import express from "express";
import { GoogleGenerativeAI } from "@google/generative-ai";

const router = express.Router();

const apiKey = process.env.GEMINI_API_KEY || process.env.VITE_GOOGLE_GEMINI_AI_API_KEY;
const genAI = apiKey ? new GoogleGenerativeAI(apiKey) : null;
const MODEL_NAME = process.env.GEMINI_MODEL || "gemini-3.6-flash";

// Endpoint for AI Travel Assistant chat
router.post("/assistant", async (req, res) => {
    try {
        const { message, tripContext } = req.body;

        if (!message) {
            return res.status(400).json({ success: false, error: "Message is required" });
        }

        if (!genAI) {
            return res.status(500).json({
                success: false,
                reply: "GEMINI_API_KEY is not configured on the server."
            });
        }

        const model = genAI.getGenerativeModel({ model: MODEL_NAME });

        const prompt = `You are a friendly, knowledgeable, and concise AI Travel Companion for Trip Mind.
User is asking: "${message}"

Trip Context:
- Destination: ${tripContext?.destination || "Unknown"}
- Duration: ${tripContext?.duration || "N/A"} days
- Budget: ${tripContext?.budget || "N/A"}
${tripContext?.itinerary ? `- Itinerary Summary: ${JSON.stringify(tripContext.itinerary).slice(0, 500)}` : ""}

Provide a direct, helpful, and concise response with actionable tips, packing advice, local customs, food recommendations, or safety tips as appropriate. Keep response within 2-3 short paragraphs with bullet points if helpful.`;

        const result = await model.generateContent(prompt);
        const text = result.response.text();

        return res.json({ success: true, reply: text });
    } catch (error) {
        console.error("Gemini Assistant Error:", error);
        return res.status(500).json({
            success: false,
            error: error.message || "Failed to generate AI response",
            reply: "I'm having a little trouble thinking right now. Please try again in a moment!"
        });
    }
});

// Endpoint for generating day-by-day smart itinerary
router.post("/generate-itinerary", async (req, res) => {
    try {
        const { location, days, budget, traveler, places, hotels } = req.body;

        if (!genAI) {
            return res.status(500).json({
                success: false,
                error: "GEMINI_API_KEY is not configured on the server."
            });
        }

        const model = genAI.getGenerativeModel({
            model: MODEL_NAME,
            generationConfig: { responseMimeType: "application/json" }
        });

        const prompt = `You are a travel itinerary planner. Organize the following real attractions and hotels into a well-structured ${days}-day travel itinerary for ${traveler || "travelers"} visiting ${location} on a ${budget || "Moderate"} budget.

Attractions available:
${JSON.stringify(places || [], null, 2)}

Hotels available:
${JSON.stringify(hotels || [], null, 2)}

Return a strictly valid JSON array with ${days} objects, where each object has:
- day (number)
- theme (short string, e.g. "Historic Landmarks & Cultural Heritage")
- area (string, e.g. "Old Town")
- suggestedHotel (string, one of the hotel names provided)
- totalTime (string, e.g. "6-8 hours")
- totalExpense (string, e.g. "Moderate")
- places: array of place objects containing:
    - placeName (string, exact name matching one of the attractions provided)
    - details (concise description of what to do there)
    - estimatedCost (e.g. "Free" or "₹500")
    - visitTime (e.g. "09:30 AM")
    - duration (e.g. "2 hours")
    - nearbyTip (string)`;

        const result = await model.generateContent(prompt);
        const text = result.response.text();
        const parsed = JSON.parse(text);

        return res.json({ success: true, itinerary: parsed });
    } catch (error) {
        console.error("Gemini Itinerary Generation Error:", error);
        return res.status(500).json({
            success: false,
            error: error.message || "Failed to generate itinerary"
        });
    }
});

export default router;
