export const detectDeepfake = async (fileBuffer) => {
  try {
    const form = new FormData();

    form.append("media", new Blob([fileBuffer]), "image.jpg");
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

    const aiScore = data?.type?.ai_generated ?? 0;

    return {
      result: aiScore > 0.5 ? "Fake" : "Real",
      confidence: aiScore
    };

  } catch (error) {
    console.log("AI ERROR:", error.message);

    return {
      result: "Unknown",
      confidence: 0.5
    };
  }
};