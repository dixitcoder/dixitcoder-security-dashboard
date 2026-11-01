import express from "express";
import { spawn } from "child_process";

const router = express.Router();

// Real-time output stream
router.post("/run", (req, res) => {
  const { command, args = [] } = req.body;
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");

  const infoooze = spawn("infoooze", [command, ...args]);

  infoooze.stdout.on("data", (data) => {
    res.write(`data: ${data.toString()}\n\n`);
  });

  infoooze.stderr.on("data", (data) => {
    res.write(`data: ${data.toString()}\n\n`);
  });

  infoooze.on("close", (code) => {
    res.write(`data: Process exited with code ${code}\n\n`);
    res.end();
  });

  req.on("close", () => {
    infoooze.kill();
  });
});

export default router;
