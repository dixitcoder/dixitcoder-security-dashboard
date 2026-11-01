import express from "express";
import sslChecker from "ssl-checker";

const router = express.Router();

// Normalize domain
const normalizeDomain = (domain) => {
  return domain.trim()
    .toLowerCase()
    .replace(/^https?:\/\//, "")
    .replace(/^www\./, "")
    .split("/")[0];
};

router.post("/", async (req, res) => {
  try {
    if (!req.body.domain) {
      return res.status(400).json({ error: "Domain is required" });
    }

    const domain = normalizeDomain(req.body.domain);

    // SSL/TLS Check
    const sslData = await sslChecker(domain, { method: "GET" });

    res.json({
      domain,
      valid: sslData.valid,
      validFrom: sslData.validFrom,
      validTo: sslData.validTo,
      daysRemaining: sslData.daysRemaining,
      issuer: sslData.issuer,
      subject: sslData.subject,
      algorithm: sslData.algorithm,
      serial: sslData.serial,
      raw: sslData,
    });
  } catch (err) {
    console.error("SSL Checker Error:", err.message);
    res.status(500).json({ error: "Failed to fetch SSL info", details: err.message });
  }
});

export default router;
