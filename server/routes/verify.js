router.get("/verify-hash/:hash", async (req, res) => {
  try {
    const { hash } = req.params;

    const data = await verifyFromBlockchain(hash);

    if (!data || data === "") {
      return res.json({
        status: "Not Found",
        hash
      });
    }

    res.json({
      status: "Verified",
      result: data.toString(),
      hash
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});