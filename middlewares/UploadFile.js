import multer from "multer";
import crypto from "crypto";

const TYPE_IMAGE = {
  "image/jpg": "jpg",
  "image/jpeg": "jpeg",
  "image/png": "png",
};

const storage = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, "public/images");
  },
  filename(req, file, cb) {
    const uuid = crypto.randomUUID();
    const ext = TYPE_IMAGE[file.mimetype];
    cb(null, `${uuid}.${ext}`);
  },
});

const fileFilter = (req, file, cb) => {
  const acceptMime = Object.keys(TYPE_IMAGE);
  if (!acceptMime.includes(file.mimetype)) {
    cb({ message: "IMAGE_NOT_ACCEPTED" }, false);
  } else {
    cb(null, true);
  }
};

const maxSize = 10 * 1024 * 1024; // 10MB

const uploadFiles = multer({
  storage,
  fileFilter,
  limits: { fileSize: maxSize },
}).array("photos", 10); // Maksimal 10 file, field name 'photos'

export { uploadFiles, TYPE_IMAGE };
