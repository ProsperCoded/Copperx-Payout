import express from "express";
import { handler } from "./bot/webhook";
import { AppEnum } from "./constants/app.enum";
import helmet from "helmet";
import cors from "cors";
import { DOCUMENTATION_URL } from "./constants";
import { errorHandler } from "./utils/middleware/errorHandler";
import { LoggerService } from "./utils/logger/logger.service";
import { LoggerPaths } from "./constants/logger-paths.enum";
import { NotificationService } from "./services/notification.service";

const app = express();
app.set("port", AppEnum.PORT || 3000);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(helmet(AppEnum.HELMET_OPTIONS));
app.use(cors(AppEnum.CORS_OPTIONS));
const logger = new LoggerService(LoggerPaths.APP);

app.use((req, res, next) => {
  console.log(req.body);
  next();
});

app.get("*", (req, res) => {
  res.send(`Welcome to Copperx Payout, view docs here: ${DOCUMENTATION_URL}`);
});
app.post("*", handler);

app.use(errorHandler);

// Initialize notification service for all authenticated users
(async () => {
  try {
    const notificationService = NotificationService.getInstance();
    await notificationService.subscribeAllUsers();
    logger.info("Notifications system initialized");
  } catch (error) {
    logger.error("Failed to initialize notification system:", error);
  }
})();

export default app;
