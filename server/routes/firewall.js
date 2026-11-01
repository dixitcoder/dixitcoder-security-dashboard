import express from "express";
import fetch from "node-fetch";
import { formatHostForUrl, isValidHost, isValidPort } from "./validation.js";

const router = express.Router();

// Firewall Test
router.post("/", async (req, res) => {
  try {
    const { domain, ports } = req.body;

    if (!isValidHost(domain)) return res.status(400).json({ error: "A valid domain is required" });

    // Default ports if not provided
    const testPorts = ports === undefined || (Array.isArray(ports) && ports.length === 0)
      ? [80, 443, 22, 21]
      : ports;
    if (
      !Array.isArray(testPorts)
      || testPorts.length > 32
      || testPorts.some((port) => !isValidPort(port))
    ) {
      return res.status(400).json({ error: "Provide up to 32 valid ports" });
    }

    const results = [];
    const urlHost = formatHostForUrl(domain);

    for (const port of testPorts) {
      try {
        const protocol = Number(port) === 443 ? "https" : "http";
        await fetch(`${protocol}://${urlHost}:${port}`, {
          method: "GET",
          signal: AbortSignal.timeout(3000),
        });
        results.push({ port, status: "Open" });
      } catch (err) {
        results.push({ port, status: "Closed/Blocked" });
      }
    }

    res.json({ domain, results });
  } catch (err) {
    console.error("Firewall Test Error:", err.message);
    res.status(500).json({ error: "Failed to test firewall", details: err.message });
  }
});

export default router;
