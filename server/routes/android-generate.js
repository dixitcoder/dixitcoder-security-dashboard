import express from "express";

const router = express.Router();
const unavailable = (_req, res) => res.status(410).json({
  error: "APK generation and remote handler endpoints are disabled.",
});

router.post("/generate-apk", unavailable);
router.post("/start-handler", unavailable);

export default router;
