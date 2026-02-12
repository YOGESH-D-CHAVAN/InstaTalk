import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import cloudinary from "../config/cloudinary.js";

const storage = new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => {
    let folder = "chat_uploads";

    if (file.mimetype.startsWith("image")) folder = "chat_uploads/images";
    else if (file.mimetype.startsWith("video")) folder = "chat_uploads/videos";
    else folder = "chat_uploads/documents";

    return {
      folder,
      resource_type: "auto",
      public_id: `${Date.now()}-${file.originalname}`,
    };
  },
});

const upload = multer({
  storage,
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB
  },
});

export default upload;
