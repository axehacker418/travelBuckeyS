const axios = require("axios");

class LocationController {
  static suggest = async (req, res) => {
    try {
      const { input } = req.query;

      if (!input) {
        return res.status(400).json({
          success: false,
          suggestions: [],
          message: "No input query provided",
        });
      }

      // const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
      //   input
      // )}&addressdetails=1&limit=5`;
     const inputClean = input.replace(/\s+/g, ' ').trim();

      // OpenStreetMap Nominatim API (global search)
      const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
        inputClean
      )}&addressdetails=1&limit=5`;

      const response = await axios.get(url, {
        headers: { "User-Agent": "travelBuckey" }, // Nominatim requires User-Agent
      });

      const suggestions =
        response.data.map((place) => ({
          display_name: place.display_name,
          lat: place.lat,
          lon: place.lon,
        })) || [];

      res.json({ success: true, suggestions });
    } catch (err) {
      console.error("🔥 LocationController error:", err);
      res.status(500).json({
        success: false,
        suggestions: [],
        message: "⚠️ Failed to fetch location suggestions",
        error: err.message,
      });
    }
  };
}

module.exports = LocationController;
