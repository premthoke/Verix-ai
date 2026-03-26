import axios from "axios";
import fs from "fs";

export const detectDeepfake = async (filePath) => {
  try {
    // ✅ convert image to base64
    const imageBase64 = fs.readFileSync(filePath, {
      encoding: "base64"
    });

    const response = await axios.post(
      "https://api.sightengine.com/1.0/check.json",
      {
        media: `data:image/jpeg;base64,${imageBase64}`,
        models: "genai",
        api_user: process.env.SIGHTENGINE_USER,
        api_secret: process.env.SIGHTENGINE_SECRET
      }
    );

    console.log("AI RAW:", response.data);

    const aiScore = response.data?.type?.ai_generated || 0;

    return {
      result: aiScore > 0.5 ? "Fake" : "Real",
      confidence: aiScore
    };

  } catch (error) {
    console.log(
      "AI ERROR:",
      error.response?.data || error.message
    );

    return {
      result: "AI Error",
      confidence: 0
    };
  }
};