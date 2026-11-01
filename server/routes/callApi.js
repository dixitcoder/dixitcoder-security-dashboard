import express from "express";

const router = express.Router();

router.post("/run", (req, res) => {
  const { password: _password, ...data } = req.body;
  res.json({ success: true, data });
})

export default router;
