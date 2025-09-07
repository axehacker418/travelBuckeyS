const mongoose = require('mongoose')
const UserModel = require('../Models/trip')
const bcrypt = require('bcrypt')

const jwt = require('jsonwebtoken')
const tripModel = require('../Models/trip')
const cloudinary = require('cloudinary')


// Configuration
cloudinary.config({
    cloud_name:process.env.cloud_name,
    api_key: process.env.cloud_api_key,
    api_secret:process.env.cloud_api_secret,
});


class TripController {
    static addtrip = async (req, res) => {
    try {
        const userId = req.user._id;
        const { budget, location, vehicle, duration } = req.body;

        // ✅ Check if trip with same details already exists (ignore image)
        const existingTrip = await tripModel.findOne({
            userId,
            budget,
            location,
            vehicle,
            duration,
        });

        if (existingTrip) {
            return res.status(400).json({
                message: "Trip with the same details already exists",
            });
        }

        // ✅ Handle image upload
        const file = req.files?.destinationImage;
        if (!file) {
            return res.status(400).json({ message: "Destination image is required" });
        }

        const imageUpload = await cloudinary.uploader.upload(file.tempFilePath, {
            folder: "CloudinaryImageUploadFolder",
        });

        // ✅ Create new trip with timestamp
        const trip = await tripModel.create({
            userId,
            budget,
            location,
            vehicle,
            duration,
            destinationImage: {
                public_id: imageUpload.public_id,
                url: imageUpload.secure_url,
            },
            createdAt: new Date(), // timestamp
            status: "pending", // default status
        });

        res.status(201).json(trip);
    } catch (error) {
        console.error("Error in trip creation!", error);
        res.status(500).json({ message: "Server error while creating trip" });
    }
};



    static getTrip = async (req, res) => {
        try {
            const userId = req.user._id;
            const trips = await tripModel.find({ userId });
            res.status(200).json(trips);
        } catch (error) {
            console.error("Error in fetching trips:", error);
            res.status(500).json({ message: "Failed to fetch trips" });
        }
    };

    static deleteTrip = async (req, res) => {
        try {
            const { id } = req.params; 

            const deletedTrip = await tripModel.findOneAndDelete({
                _id: id,
                userId: req.user._id, 
            });

            if (!deletedTrip) {
                return res.status(404).json({ message: "Trip not found or not authorized" });
            }

            res.json({ message: "Trip deleted successfully", deletedTrip });
        } catch (error) {
            console.error("Error deleting trip:", error);
            res.status(500).json({ message: "Server error while deleting trip" });
        }
    };




    static startTrip = async (req, res) => {
        try {
            const { id } = req.params;

            const updatedTrip = await tripModel.findByIdAndUpdate(
                id,
                { status: "active" },
                { new: true }
            );

            if (!updatedTrip) {
                return res.status(404).json({ message: "Trip not found" });
            }

            res.json({ message: "Trip started", trip: updatedTrip });
        } catch (error) {
            console.error("Error starting trip:", error);
            res.status(500).json({ message: "Server error" });
        }
    };



    static cancelTrip = async (req, res) => {
        try {
            const { id } = req.params;

            const updatedTrip = await tripModel.findByIdAndUpdate(
                id,
                { status: "cancelled" },
                { new: true }
            );

            if (!updatedTrip) {
                return res.status(404).json({ message: "Trip not found" });
            }

            res.json({
                message: "Trip cancelled successfully",
                trip: updatedTrip,
            });
        } catch (error) {
            console.error("Error cancelling trip:", error);
            res.status(500).json({ message: "Server error" });
        }
    };


    static completeTrip = async (req, res) => {
    try {
        const { id } = req.params; // Trip ID

        const updatedTrip = await tripModel.findOneAndUpdate(
            { _id: id, userId: req.user._id }, // only owner can complete
            { status: "completed" },
            { new: true }
        );

        if (!updatedTrip) {
            return res.status(404).json({ message: "Trip not found or not authorized" });
        }

        res.json({
            message: "Trip marked as completed",
            trip: updatedTrip,
        });
    } catch (error) {
        console.error("Error completing trip:", error);
        res.status(500).json({ message: "Server error while completing trip" });
    }
};


}

module.exports = TripController