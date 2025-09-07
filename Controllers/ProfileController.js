const Profile = require("../Models/Profile");
const cloudinary=require('cloudinary')

class ProfileController {
    // Create profile (called during register OR login if missing)
    static createProfile = async (userId, name) => {
        try {
            let profile = await Profile.findOne({ userId });
            if (!profile) {
                profile = await Profile.create({ userId, name });
                console.log("Profile created for user:", name);
            }
            return profile;
        } catch (error) {
            console.error("Error creating profile:", error);
            throw new Error("Profile creation failed");
        }
    };

    // Get logged-in user's profile
    static getMyProfile = async (req, res) => {
        try {
            const userId = req.user._id;
            let profile = await Profile.findOne({ userId });

            // If not exists, create one automatically
            if (!profile) {
                profile = await ProfileController.createProfile(userId, req.user.name);
            }

            res.json(profile);
        } catch (error) {
            console.error("Error fetching profile:", error);
            res.status(500).json({ message: "Server error fetching profile" });
        }
    };

    // Update / Add profile image
    static updateProfileImage = async (req, res) => {
    try {
      const userId = req.user._id; // ✅ requires auth middleware

      if (!req.files || !req.files.profileImage) {
        return res.status(400).json({ message: "No image uploaded" });
      }

      const file = req.files.profileImage;

      // 1. Find profile
      let profile = await Profile.findOne({ userId });
      if (!profile) {
        return res.status(404).json({ message: "Profile not found" });
      }

      // 2. Delete old image from Cloudinary if exists
      if (profile.profileImage && profile.profileImage.public_id) {
        await cloudinary.uploader.destroy(profile.profileImage.public_id);
      }

      // 3. Upload new image
      const uploaded = await cloudinary.uploader.upload(file.tempFilePath, {
        folder: "ProfileImages",
      });

      // 4. Save new image in DB
      profile.profileImage = {
        public_id: uploaded.public_id,
        url: uploaded.secure_url,
      };

      await profile.save();

      res.status(200).json({
        message: "Profile image updated successfully",
        profile,
      });
    } catch (error) {
      console.error("Error in updating profile image:", error);
      res.status(500).json({ message: "Server error updating profile image" });
    }
  };

}

module.exports = ProfileController;
