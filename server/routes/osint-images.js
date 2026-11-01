import express from "express";
import multer from "multer";
import path from "path";
import { fileURLToPath } from "url";

const router = express.Router();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configure multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, "../uploads"));
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + "-" + file.originalname);
  },
});

const upload = multer({ storage });

// Upload route
router.post("/upload", upload.single("image"), (req, res) => {
  if (!req.file) return res.status(400).json({ error: "No image uploaded" });

  const filePath = `/uploads/${req.file.filename}`;
  res.json({
    success: true,
    message: "Image uploaded successfully",
    path: filePath,
  });
});

// Dummy OSINT analyzer
router.post("/analyze", (req, res) => {
  const { imageUrl } = req.body;
  res.json({
    success: true,
    analysis: {
      file: imageUrl,
      metadata: "Detected image metadata example",
      confidence: "98%",
    },
  });
});

export default router;
