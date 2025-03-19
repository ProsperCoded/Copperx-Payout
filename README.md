# CopperX Telegram Bot

🚀 **CopperX Telegram Bot** is a webhook-based Telegram bot that enables seamless crypto transactions and wallet management using the CopperX API. This bot provides features like balance checking, fund transfers, transaction history, and authentication.

view docs here: [docs](https://73zmmrspoh.apidog.io "https://73zmmrspoh.apidog.io")

---

## 📌 Features

- ✅ Secure authentication via CopperX API
- 💰 Check USDT balance
- 🔄 View transaction history
- 💸 Send funds using the CopperX platform
- 🛡️ Rate limiting for security
- 🎛️ Inline and reply keyboards for easy navigation
- 📡 Webhook-based for real-time updates

---

## 🏗️ Project Structure

---

## 🔧 Setup & Installation

### **1️⃣ Clone the repository**

```sh
git clone https://github.com/prospercoded/copperx-telegram-bot.git
cd copperx-telegram-bot
```

### **2️⃣ Install dependencies**

```sh
npm install
```

### **3️⃣ Set up environment variables**

Create a `.env` file and add:

```ini
BOT_TOKEN=your_telegram_bot_token
COPPERX_API_KEY=your_copperx_api_key
SERVER_URL=https://your-deployed-server.com
```

### **4️⃣ Run the server**

```sh
npm run dev  # For development
npm run start  # For production
```

### **5️⃣ Set up Telegram Webhook**

```sh
curl -X POST "https://api.telegram.org/bot{BOT_TOKEN}/setWebhook?url={SERVER_URL}/webhook"
```

---

## 📡 Usage

### **Start the Bot**

Send `/start` to the bot to begin.

### **Check Wallet Balance**

Send `/wallet` to check your USDT balance.

### **Transfer Funds**

Send `/transfer {amount} {receiver_address}` to transfer USDT.

### **Authenticate**

Click the **Login** button sent by the bot to authenticate securely via CopperX.

### **Transaction History**

Send `/transactions` to view recent transactions.

---

## 🛠️ API Reference

### **Send Message**

```http
POST https://api.telegram.org/bot{BOT_TOKEN}/sendMessage
```

**Body:**

```json
{
  "chat_id": "123456789",
  "text": "Hello, User!"
}
```

### **Inline Keyboard Example**

```json
{
  "reply_markup": {
    "inline_keyboard": [
      [{ "text": "Check Balance", "callback_data": "wallet_balance" }],
      [{ "text": "View Transactions", "callback_data": "wallet_transactions" }]
    ]
  }
}
```

---

## 🔒 Security Features

- **Rate Limiting** : Limits requests to prevent abuse
- **Webhook Validation** : Ensures requests are from Telegram
- **Secure Authentication** : Uses CopperX API for authentication
- **Error Handling & Logging** : Captures failures with meaningful logs

---

## 🛠️ Built With

- **TypeScript**
- **Express.js**
- **Telegram Bot API**
- **CopperX API**
- **Axios**

---

## 🚀 Future Enhancements

- ✅ Multi-user support
- ✅ Web-based admin panel
- ✅ More transaction options

---

## 🤝 Contributing

1. Fork the project
2. Create a feature branch (`git checkout -b feature-xyz`)
3. Commit changes (`git commit -m 'Add feature XYZ'`)
4. Push to the branch (`git push origin feature-xyz`)
5. Create a Pull Request

---

## 📜 License

This project is licensed under the MIT License - see the [LICENSE](https://chatgpt.com/c/LICENSE) file for details.

---

## 📞 Contact

For support, reach out via:

- **Telegram** : [@](https://t.me/yourbotusername)prospercoded
- **Email** : [buildminds.direct@gmail.com](mailto:support@yourdomain.com)
