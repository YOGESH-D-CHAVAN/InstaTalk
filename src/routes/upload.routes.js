import express from "express";
import upload from "../middlewares/upload.middleware.js";

const router = express.Router();

router.post("/upload", (req, res) => {
  upload.single("file")(req, res, (err) => {
    if (err) {
      console.error("Upload Error:", err);
      return res.status(500).json({ 
        message: "File upload failed", 
        error: err.message || "Unknown upload error" 
      });
    }

    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    res.status(200).json({
      url: req.file.path,
      type: req.file.mimetype,
      name: req.file.originalname,
      size: req.file.size,
    });
  });
});

export default router;
