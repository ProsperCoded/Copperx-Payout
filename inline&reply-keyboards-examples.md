Yes! **Webhooks and Telegraf are just different ways to receive updates** , but they both **support Telegram buttons and UI elements** like **Inline Keyboards, Reply Keyboards, and Custom Menus** .

**🔹 Webhook (Express API) still supports Inline Keyboards & Reply Keyboards** —you just need to send the right JSON payload manually when replying to a user.

---

# **✅ How to Use Buttons (Inline Keyboards & Reply Keyboards) with Webhooks?**

You’ll need to manually **send the correct API request** to Telegram inside your Express webhook handler.

---

## **🎯 1️⃣ Inline Keyboard (Best for Clickable Options Below Message)**

Inline keyboards are **buttons that appear directly below the message** instead of the keyboard.

**📌 Example:**

- User gets a message: **“Choose a payment method”**
- Below the message, they see:

  ✅ **Crypto** | ✅ **Bank Transfer**

```javascript
app.post("/webhook", async (req, res) => {
  const update = req.body;
  if (update.message) {
    const chatId = update.message.chat.id;

    await axios.post(`${TELEGRAM_API}/sendMessage`, {
      chat_id: chatId,
      text: "Choose a payment method:",
      reply_markup: {
        inline_keyboard: [
          [{ text: "💰 Crypto", callback_data: "crypto" }],
          [{ text: "🏦 Bank Transfer", callback_data: "bank" }],
        ],
      },
    });
  }
  res.sendStatus(200);
});
```

🔥 **When the user clicks a button** , Telegram sends an **update** with `"callback_query"`. You handle this in another webhook route.

```javascript
app.post("/webhook", async (req, res) => {
  const update = req.body;
  if (update.callback_query) {
    const chatId = update.callback_query.message.chat.id;
    const choice = update.callback_query.data; // Either "crypto" or "bank"

    let responseText =
      choice === "crypto"
        ? "You chose Crypto! 🚀"
        : "You chose Bank Transfer! 🏦";

    await axios.post(`${TELEGRAM_API}/sendMessage`, {
      chat_id: chatId,
      text: responseText,
    });
  }
  res.sendStatus(200);
});
```

✅ **Works with Webhook!** Clickable buttons appear **below the message** like Telegraf.

---

## **🎯 2️⃣ Reply Keyboard (Replaces the User’s Keyboard)**

Instead of buttons **below the message** , this makes a **custom keyboard** .

**📌 Example:**

- User sees a message: **“Choose a currency”**
- Their keyboard changes to:

  ✅ **USD** | ✅ **NGN**

```javascript
app.post("/webhook", async (req, res) => {
  const update = req.body;
  if (update.message) {
    const chatId = update.message.chat.id;

    await axios.post(`${TELEGRAM_API}/sendMessage`, {
      chat_id: chatId,
      text: "Select a currency:",
      reply_markup: {
        keyboard: [
          [{ text: "💵 USD" }, { text: "🇳🇬 NGN" }],
          [{ text: "❌ Cancel" }],
        ],
        resize_keyboard: true, // Optional: makes the keyboard smaller
        one_time_keyboard: true, // Optional: hides keyboard after one use
      },
    });
  }
  res.sendStatus(200);
});
```

✅ **Works with Webhook!** Instead of showing buttons below the message, the **user's keyboard changes** to predefined buttons.

---

## **🎯 3️⃣ Removing the Custom Keyboard (Back to Normal)**

If you use a **Reply Keyboard** , you may want to **remove it** later.

```javascript
await axios.post(`${TELEGRAM_API}/sendMessage`, {
  chat_id: chatId,
  text: "Keyboard removed. Type anything...",
  reply_markup: { remove_keyboard: true },
});
```

✅ **The keyboard disappears** , and the user gets a normal text input.

---

# **🔥 Summary Table**

| Feature                                                    | Telegraf | Webhook (Express API) |
| ---------------------------------------------------------- | -------- | --------------------- |
| **Inline Keyboard (buttons below message)**                | ✅ Yes   | ✅ Yes                |
| **Reply Keyboard (custom keyboard instead of text input)** | ✅ Yes   | ✅ Yes                |
| **Removing Custom Keyboard**                               | ✅ Yes   | ✅ Yes                |

---

# **🚀 Conclusion**

Even with **Webhook (Express API)** , you can **fully use** :
✅ Inline Buttons

✅ Custom Keyboards

✅ Removing Keyboards

✅ Callback Query Handling

Telegraf makes it **easier** because it has built-in functions, but **Webhook works just as well!** Would you like help handling **user authentication (e.g., verifying Telegram users)** next? 🚀
