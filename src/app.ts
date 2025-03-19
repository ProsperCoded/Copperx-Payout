import express from "express";
import { handleUpdate } from "./bot/webhook";
import dotenv from "dotenv";
import { AppEnum } from "./constants/app.enum";
import helmet from "helmet";
import cors from "cors";
import { DOCUMENTATION_URL } from "./constants";
dotenv.config();

const app = express();
app.set("port", AppEnum.PORT || 3000);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(helmet(AppEnum.HELMET_OPTIONS));
app.use(cors(AppEnum.CORS_OPTIONS));

app.get("*", (req, res) => {
  res.send(`Welcome to Copperx Payout, view docs here: ${DOCUMENTATION_URL}`);
});
app.post(`/webhook`, handleUpdate);

export default app;
