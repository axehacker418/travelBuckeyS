const mongoose = require("mongoose");
const UserModel = require("../Models/user");
const ProfileModel = require("../Models/Profile");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");

const otpStore = {};

class UserController {
  // Registration code
  static register = async (req, res) => {
    try {
      const { name, email, password } = req.body;

      const check = await UserModel.findOne({ email });
      if (check) {
        return res.status(400).json({ message: "Email already exists" });
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      const user = await UserModel.create({
        name,
        email,
        password: hashedPassword,
      });

      await ProfileModel.create({
        userId: user._id,
        name: user.name,
        email: user.email,
        profileImage: { public_id: null, url: null },
      });

      res.status(201).json({
        message: "User registered successfully",
        user: {
          _id: user._id,
          name: user.name,
          email: user.email,
        },
      });
    } catch (error) {
      console.error("Error in register:", error);
      res.status(500).json({ message: "Server error during registration" });
    }
  };

  // Login code
  static Login = async (req, res) => {
    try {
      const { email, password } = req.body;

      const user = await UserModel.findOne({ email });
      if (!user) {
        return res.status(400).json({ message: "Invalid Credentials" });
      }

      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(400).json({ message: "Invalid Credentials" });
      }

      const token = jwt.sign({ ID: user._id }, process.env.JWT_SECRET, {
        expiresIn: "7d",
      });

      res.cookie("token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "strict",
      });

      let profile = await ProfileModel.findOne({ userId: user._id });
      if (!profile) {
        profile = await ProfileModel.create({
          userId: user._id,
          name: user.name,
          email: user.email,
        });
      } else {
        if (!profile.email || profile.email !== user.email) {
          profile.email = user.email;
          await profile.save();
        }
      }

      res.status(200).json({
        message: "Login Successfully!",
        token,
        role: user.role,
        name: user.name,
        email: user.email,
        userId: user._id,
        profile: {
          name: profile.name,
          email: profile.email,
          profileImage: profile.profileImage,
        },
      });
    } catch (error) {
      console.error("Error in login:", error);
      res.status(500).json({ message: "Server error during login" });
    }
  };

  // Logout Code
  static logout = async (req, res) => {
    try {
      res.clearCookie("token");
      res.status(200).json({ message: "Logout successfully" });
    } catch (error) {
      console.error("Error in logout:", error);
      res.status(500).json({ message: "Server error during logout" });
    }
  };

  // Change Password code 
  static changePassword = async (req, res) => {
    try {
      const { oldPassword, newPassword } = req.body;
      const userId = req.user?._id;

      if (!userId) {
        return res.status(400).json({ message: "User ID not provided" });
      }

      if (!oldPassword || !newPassword) {
        return res
          .status(400)
          .json({ message: "Old and new password are required" });
      }

      const user = await UserModel.findById(userId).select("+password");
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      const isMatch = await bcrypt.compare(oldPassword, user.password);
      if (!isMatch) {
        return res.status(400).json({ message: "Old password is incorrect" });
      }

      const isSamePassword = await bcrypt.compare(newPassword, user.password);
      if (isSamePassword) {
        return res
          .status(400)
          .json({ message: "New password cannot be the same as old password" });
      }

      user.password = await bcrypt.hash(newPassword, 10);
      await user.save();

      res.status(200).json({ message: "Password changed successfully" });
    } catch (error) {
      console.error("[changePassword] unexpected error:", error.message);
      res.status(500).json({ message: "Server error during password change" });
    }
  };

  // OTP generation
  static forgotPassword = async (req, res) => {
    try {
      const { email } = req.body;
      const user = await UserModel.findOne({ email });
      if (!user) {
        return res
          .status(400)
          .json({ message: "No user found with this email" });
      }

      const otp = Math.floor(100000 + Math.random() * 900000);
      otpStore[email] = { otp, expires: Date.now() + 5 * 60 * 1000 };

      const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS,
        },
      });

      await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: email,
        subject: "Password Reset OTP",
        text: `Your OTP for password reset is ${otp}`,
      });

      res.status(200).json({ message: "OTP sent to email" });
    } catch (error) {
      console.error("[forgotPassword] error:", error.message);
      res.status(500).json({ message: "Server error during forgot password" });
    }
  };

  // OTP verification 
  static resetPassword = async (req, res) => {
    try {
      const { email, otp, newPassword } = req.body;
      const record = otpStore[email];

      if (!record || record.expires < Date.now()) {
        return res.status(400).json({
          type: "otp_expired",
          message: "OTP expired, please request a new one",
        });
      }

      if (parseInt(otp) !== record.otp) {
        return res.status(400).json({
          type: "otp_invalid",
          message: "Invalid OTP, please try again",
        });
      }

      const user = await UserModel.findOne({ email });
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      user.password = await bcrypt.hash(newPassword, 10);
      await user.save();

      delete otpStore[email]; 

      res.status(200).json({ message: "Password reset successfully" });
    } catch (error) {
      console.error("[resetPassword] error:", error.message);
      res.status(500).json({ message: "Server error during reset password" });
    }
  };
}

module.exports = UserController;
