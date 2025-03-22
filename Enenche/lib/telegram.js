const {getAxiosInstance} = require("./axios");
const errorHandler = require("./helper");
const {handleUserInput} = require("./commands/handleCallBack");


const TOKEN = "7867952264:AAGDi23RLPRpTWl1RtHiCFUV0NGiiWnBgEM";
const BASE_URL = `https://api.telegram.org/bot${TOKEN}`;

const axiosInstance = getAxiosInstance(BASE_URL);

async function sendMessage(chat_id, text, reply_markup = {}){
    try {
        return await axiosInstance.post("sendMessage", {chat_id, text, reply_markup});
    } catch (err) {
        errorHandler(err, "sendMessage", "axios");
    }

}

async function handleMessage(messageObj){
    const messageText = messageObj.text || "";
    if (!messageText){
        errorHandler("Message is empty", "handleMessage")
        return ""
    }

    try {
        const chat_id = messageObj.chat.id;
        if (messageText.charAt(0) === "/"){
            const command = messageText.substr(1);

            switch (command){
                case "start":
                    console.log("Processing /start command");
                    return sendMessage(chat_id, "👋 Welcome to my Telegram bot! How can I assist you today?");

                case "send":
                    const keyboard = {
                        inline_keyboard: [
                            [{ text: "📧 Send to Email", callback_data: "send_email" }],
                            [{ text: "💰 Send to Crypto Wallet", callback_data: "send_crypto" }],
                            [{ text: "🏦 Withdraw to Bank", callback_data: "send_bank" }],
                        ],
                    };
                    return sendMessage(chat_id, "💸 Choose a transfer option:", keyboard);
                case "help":
                    return sendMessage(chat_id, "Calling on my boss to save you 📞");

                default:
                    return sendMessage(chat_id, "Hey! I don't know that command 🤧");
  
            }
    }else if(messageText.charAt(0) != "/"){
        handleUserInput(messageText, chat_id);
    }else{
        return sendMessage(chat_id, "Check the commands by typing /help");
    }
}catch(err){
    errorHandler(err, "handleMessage")
}

}

module.exports = {handleMessage, sendMessage}