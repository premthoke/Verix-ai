import FormData from "form-data";
import fetch from "node-fetch"; // ADD THIS

export const detectDeepfake = async (fileBuffer) => {
  try {
    const formData = new FormData();

    formData.append("media", fileBuffer, {
      filename: "image.jpg",
      contentType: "image/jpeg"
    });

    formData.append("models", "genai");
    formData.append("api_user", process.env.SIGHTENGINE_USER);
    formData.append("api_secret", process.env.SIGHTENGINE_SECRET);

    const response = await fetch(
      "https://api.sightengine.com/1.0/check.json",
      {
        method: "POST",
        body: formData,
        headers: formData.getHeaders() // IMPORTANT
      }
    );

    const data = await response.json();

    console.log("AI RAW RESPONSE:", data);

    const score = data.type?.ai_generated || 0;

    return {
      result: score > 0.5 ? "Fake" : "Real",
      confidence: score
    };

  } catch (error) {
    console.error("AI ERROR:", error.message);

    return {
      result: "Error",
      confidence: 0
    };
  }
};