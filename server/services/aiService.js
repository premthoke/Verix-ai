import fs from "fs";
import fetch from "node-fetch";
import FormData from "form-data";

export const detectDeepfake = async (filePath) => {
  try {
    const form = new FormData();

    form.append("media", fs.createReadStream(filePath));
    form.append("models", "genai");
    form.append("api_user", process.env.SIGHTENGINE_USER);
    form.append("api_secret", process.env.SIGHTENGINE_SECRET);

    const response = await fetch(
      "https://api.sightengine.com/1.0/check.json",
      {
        method: "POST",
        body: form
      }
    );

    const data = await response.json();

    console.log("AI RAW RESPONSE:", data);

    const score = data?.type?.ai_generated ?? 0;

    return {
      result:
        score > 0.7
          ? "Fake"
          : score > 0.4
          ? "Suspicious"
          : "Real",
      confidence: score
    };

  } catch (error) {
    console.log("AI ERROR:", error.message);

    return {
      result: "AI Error",
      confidence: 0
    };
  }
};