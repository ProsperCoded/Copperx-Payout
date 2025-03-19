import "dotenv/config";
import axios from "axios";
import { configService } from "../utils/config";
import { ENV } from "../constants/env.enum";
import BotCommands from "../constants/bot-commands";

// ** Set the commands for the telegram bot
const botToken = configService.get(ENV.BOT_TOKEN);

axios(`https://api.telegram.org/bot${botToken}/setMyCommands`, {
  method: "post",
  headers: {
    "Content-Type": "application/json",
  },
  data: {
    commands: BotCommands,
  },
})
  .then(function (response) {
    console.log("Commands set successfully:", JSON.stringify(response.data));
  })
  .catch(function (error) {
    console.error("Error setting commands:", error);
  });
