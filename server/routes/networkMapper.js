import express from "express";
import { execFile } from "child_process";
import { isValidHost } from "./validation.js";

const router = express.Router();

router.post('/', (req, res) => {
  const { host } = req.body;
  if (!isValidHost(host)) {
    return res.status(400).json({ error: "A valid host is required" });
  }

  execFile("traceroute", ["-n", host], { timeout: 30000 }, (error, stdout, stderr) => {
    if (error) {
      console.error("Traceroute error:", error.message, stderr);
      return res.status(500).json({ error: "Failed to run traceroute", details: stderr || error.message });
    }

    const results = [];
    const lines = stdout.split("\n");
    lines.forEach(line => {
      const parts = line.trim().split(/\s+/);
      if (parts.length >= 2 && !isNaN(parts[0])) {
        results.push({
          hop: parts[0],
          ip: parts[1],
          hostname: parts[1],
          rtt: parts[2] || null
        });
      }
    });

    res.json({ results });
  });
});

export default router;
