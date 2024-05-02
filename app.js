import express from "express";
import dotenv from "dotenv";
import { PrismaClient } from "@prisma/client";

import indexRouter from "./routes/index.js";

const env = dotenv.config().parsed;
const prisma = new PrismaClient();

var app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

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
