const fetch = require("node-fetch");

class ChatController {
  static chat = async (req, res) => {
    try {
      const { message } = req.body;
      if (!message)
        return res.status(400).json({ success: false, reply: "No message provided" });
      const model = "gemini-2.5-flash";
      const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${process.env.GEMINI_API_KEY}`;

      const response = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contents: [{ parts: [{ text: message }] }] }),
      });

      const data = await response.json();

      const reply =
        data?.candidates?.[0]?.content?.parts?.[0]?.text ||
        "No reply from Gemini";

      res.json({ success: true, reply });
    } catch (err) {
      console.error("🔥 Controller error:", err);
      res
        .status(500)
        .json({ success: false, reply: "⚠️ Error contacting server", error: err.message });
    }
  };
}

module.exports = ChatController;
