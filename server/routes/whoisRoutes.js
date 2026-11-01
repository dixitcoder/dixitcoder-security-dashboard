import express from "express";
import whois from "whois-json";

const router = express.Router();

// Domain normalization function
const normalizeDomain = (domain) => {
  return domain.trim()
    .toLowerCase()
    .replace(/^https?:\/\//, "") // remove http:// or https://
    .replace(/^www\./, "")       // remove www.
    .split("/")[0];              // remove path
};

router.post("/", async (req, res) => {
  try {
    if (!req.body.domain) {
      return res.status(400).json({ error: "Domain is required" });
    }

    const domain = normalizeDomain(req.body.domain);

    // WHOIS Lookup
    const data = await whois(domain, { follow: 3, verbose: true });

    // Format response
    const formatted = {
      domain,
      registrar: data.registrar || "N/A",
      creationDate: data.creationDate || data["Creation Date"] || "N/A",
      expiryDate: data.registryExpiryDate || data["Registrar Registration Expiration Date"] || "N/A",
      updatedDate: data.updatedDate || data["Updated Date"] || "N/A",
      status: data.status || data["Domain Status"] || "N/A",
      nameServers: data.nameServer || data["Name Server"] || [],
      emails: data.emails || [],
      raw: data, // keep raw for advanced users
    };

    res.json(formatted);
  } catch (err) {
    console.error("WHOIS Error:", err.message);
    res.status(500).json({ error: "Failed to fetch WHOIS data", details: err.message });
  }
});

export default router;
