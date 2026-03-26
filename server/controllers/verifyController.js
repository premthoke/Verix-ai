export const verifyFile = async (req, res) => {
  try {
    return res.json({
      result: "Verified (Demo)"
    });
  } catch {
    res.status(500).json({ error: "Verification failed" });
  }
};