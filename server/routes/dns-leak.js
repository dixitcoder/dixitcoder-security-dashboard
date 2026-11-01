import express from "express";
import dns from "dns";

const router = express.Router();

router.post("/", async (req, res) => {
  try {
    const { domain } = req.body;
    if (!domain) return res.status(400).json({ error: "Domain is required" });

    // Resolve DNS records
    dns.resolveAny(domain, (err, records) => {
      if (err) {
        return res.status(500).json({ error: "DNS lookup failed", details: err.message });
      }
      res.json({ domain, records });
    });
  } catch (err) {
    res.status(500).json({ error: "Failed to test DNS leak", details: err.message });
  }
});

export default router;
