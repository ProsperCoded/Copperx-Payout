import "dotenv/config";
import axios from "axios";
import { configService } from "../utils/config";
import { ENV } from "../constants/env.enum";

// ** Set the webhook for the telegram bot
const botToken = configService.get(ENV.BOT_TOKEN);
const webhookUrl = configService.get(ENV.SERVER_URL);

axios(`https://api.telegram.org/bot${botToken}/setWebhook?url=${webhookUrl}`, {
  method: "post",
  headers: {
    "Content-Type": "application/json",
  },
})
  .then(function (response) {
    console.log("Webhook set successfully:", JSON.stringify(response.data));
  })
  .catch(function (error) {
    console.error("Error setting webhook:", error.message);
  });
