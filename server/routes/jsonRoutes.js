import express from "express";

const router = express.Router();

// 📑 JSON Formatter
router.post("/format", (req, res) => {
  try {
    const parsed = JSON.parse(req.body.json);
    const formatted = JSON.stringify(parsed, null, 2);
    res.json({ formatted });
  } catch (err) {
    res.status(400).json({ error: "Invalid JSON" });
  }
});

// 📑 JSON Minifier
router.post("/minify", (req, res) => {
  try {
    const parsed = JSON.parse(req.body.json);
    const minified = JSON.stringify(parsed);
    res.json({ minified });
  } catch (err) {
    res.status(400).json({ error: "Invalid JSON" });
  }
});

// 📑 JSON Validator
router.post("/validate", (req, res) => {
  try {
    JSON.parse(req.body.json);
    res.json({ valid: true });
  } catch (err) {
    res.json({ valid: false });
  }
});

export default router;
