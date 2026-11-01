// routes/traceroute.js
import express from "express";
import { execFile } from "child_process";
import { isValidHost } from "./validation.js";

const router = express.Router();

// POST /api/traceroute
router.post("/", (req, res) => {
  const { host } = req.body;

  if (!isValidHost(host)) {
    return res.status(400).json({ error: "A valid host is required" });
  }

  execFile('traceroute', ['-n', host], { timeout: 30000 }, (err, stdout, stderr) => {
    if (err) {
      return res.status(500).json({ error: "Traceroute failed", details: stderr || err.message });
    }
    res.json({ result: stdout });
  });
});

export default router;
