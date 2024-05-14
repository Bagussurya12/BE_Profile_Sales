import express from "express";
import dotenv from "dotenv";
import { PrismaClient } from "@prisma/client";
import { resolve } from "path";
import { uploadFiles } from "./middlewares/UploadFile.js"; // Hapus ini
import checkFileType from "./middlewares/CheckType.js";
import multer from "multer";

import indexRouter from "./routes/index.js";

const env = dotenv.config().parsed;
const prisma = new PrismaClient();

var app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use("/static", express.static(resolve("public")));

// app.use(uploadFiles); // Hapus ini

app.use((req, res, err, next) => {
  if (err instanceof multer.MulterError) {
    if (err.code === "LIMIT_FILE_SIZE") {
      err.message = "MAX_SIZE_FILE_IS_1_MB";
    }
  }
  console.log(err);
  res.status(500).json(err);
});

app.use("/", indexRouter);

app.listen(env.APP_PORT, async () => {
  try {
    // MELAKUKAN KONEKSI KE DATABASE
    await prisma.$connect();
    console.log("CONNECTED TO DATABASE");

    process.on("SIGINT", async () => {
      await prisma.$disconnect();
      console.log("DISCONNECTED FROM DATABASE");
      process.exit();
    });
  } catch (error) {
    console.error("ERROR CONNECTING TO THE DATABASE:", error);
  }

  console.log(`SERVER_RUNNING_ON_PORT ${env.APP_PORT}`);
});
