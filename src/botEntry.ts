import "dotenv/config";
import axios from "axios";
import { configService } from "./utils/config";
import { ENV } from "./constants/env.enum";
const botToken = configService.get(ENV.TOKEN);
const webhookUrl = configService.get(ENV.SERVER_URL) + "/webhook";

axios(`https://api.telegram.org/bot${botToken}/setWebhook?url=${webhookUrl}`, {
  method: "post",
  headers: {
    "Content-Type": "application/json",
  },
})
  .then(function (response) {
    console.log(JSON.stringify(response.data));
  })
  .catch(function (error) {
    console.log(error);
  });
