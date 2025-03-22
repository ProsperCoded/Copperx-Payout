const helper = require("../helper");

let userSession = {};

async function handleCallBack(data, chat_id){
    const { sendMessage } = require("../telegram");
    switch (data){
        case "send_email":
            userSession[chat_id] = "waiting for email...";
            return sendMessage(chat_id, "Enter the recipient's email address:");
        case "send_crypto":
            userSession[chat_id] = "waiting for pub key...";
            return sendMessage(chat_id, "Enter the recipeints public key:");
        case "send_bank":
            userSession[chat_id] = "waiting for bank details...";
            return sendMessage(chat_id, "Enter the recipient's bank details:");
    }
}

function validateEmail(email) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function validatePubKey(pubKey) {
    return pubKey.length >= 26 && pubKey.length <= 64; 
}

function validateBankDetails(bank) {
    return /^\d{10,16}$/.test(bank); 
}


async function handleUserInput(userInput, chat_id) {
    
    if (userSession[chat_id] === "waiting for email...") {
        if (!validateEmail(userInput)) {
            return sendMessage(chat_id, "❌ Invalid email format. Please enter a valid email:");
        }
        await sendMessage(chat_id, `✅ Email **${userInput}** saved! Now enter the amount:`);
        userSession[chat_id] = "waiting for amount";

    } else if (userSession[chat_id] === "waiting for pub key...") {
        if (!validatePubKey(userInput)) {
            return sendMessage(chat_id, "❌ Invalid public key. Please enter a valid key:");
        }
        await sendMessage(chat_id, `✅ Public Key **${userInput}** saved! Now enter the amount:`);
        userSession[chat_id] = "waiting for amount";

    } else if (userSession[chat_id] === "waiting for bank details...") {
        if (!validateBankDetails(userInput)) {
            return sendMessage(chat_id, "❌ Invalid bank details. Please enter again:");
        }
        await sendMessage(chat_id, `✅ Bank Details **${userInput}** saved! Now enter the amount:`);
        userSession[chat_id] = "waiting for amount";

    } else {
        return sendMessage(chat_id, "🤖 Please follow the correct steps. Use /send to begin.");
    }
}

module.exports = {handleCallBack, handleUserInput}