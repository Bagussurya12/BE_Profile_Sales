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

const maxSize = 1 * 1024 * 1024; //1MB

const uploadFile = multer({ storage, fileFilter, limits: { fileSize: maxSize } }).single("image");

export { uploadFile, TYPE_IMAGE };
