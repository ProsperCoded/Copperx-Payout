# Send Callbacks

This document details the callback operations specifically related to sending funds in the CopperX Payout Bot.

## Send Callback Overview

Send callbacks enable users to send funds to other users via email addresses or wallet addresses. The send process is a multi-step flow that involves selecting a method, specifying a recipient, entering an amount, selecting a currency, specifying a purpose, and confirming the transfer.

## Available Send Callbacks

| Callback                     | Description            | Parameters    | Authentication | KYC      |
| ---------------------------- | ---------------------- | ------------- | -------------- | -------- |
| `send_by_email`              | Send by email          | None          | Required       | Required |
| `send_by_wallet`             | Send by wallet address | None          | Required       | Required |
| `send_confirm`               | Confirm transfer       | None          | Required       | Required |
| `send_cancel`                | Cancel transfer        | None          | Required       | Required |
| `transfer_currency:currency` | Select currency        | Currency code | Required       | Required |
| `transfer_purpose:purpose`   | Select purpose         | Purpose code  | Required       | Required |

## Send By Email Callback

**Purpose**: Initialize the process to send funds to an email address.

**Implementation**:

```typescript
export async function handleSendByEmailCallback(msgObj: TelegramMessage) {
  const chatId = msgObj.chat.id;

  // Authentication and KYC checks
  if (!(await authService.isAuthenticated(chatId))) {
    await TelegramService.sendMessage(chatId, authRequiredMessage);
    return;
  }

  if (!(await checkKycVerification(chatId, "send features"))) {
    return;
  }

  // Update session for expected email input
  await sessionService.updateSession(chatId, {
    state: UserState.AWAITING_RECIPIENT_EMAIL,
    transferData: {
      method: "email",
    },
  });

  await TelegramService.sendMessage(chatId, sendByEmailMessage);
}
```

**Response Example**:

```
📧 Send by Email

Please enter the recipient's email address:
```

## Send By Wallet Callback

**Purpose**: Initialize the process to send funds to a wallet address.

**Implementation**:

```typescript
export async function handleSendByWalletCallback(msgObj: TelegramMessage) {
  const chatId = msgObj.chat.id;

  // Authentication and KYC checks
  if (!(await authService.isAuthenticated(chatId))) {
    await TelegramService.sendMessage(chatId, authRequiredMessage);
    return;
  }

  if (!(await checkKycVerification(chatId, "send features"))) {
    return;
  }

  // Update session for expected wallet address input
  await sessionService.updateSession(chatId, {
    state: UserState.AWAITING_WALLET_ADDRESS,
    transferData: {
      method: "wallet",
    },
  });

  await TelegramService.sendMessage(chatId, sendByWalletMessage);
}
```

**Response Example**:

```
🔑 Send by Wallet Address

Please enter the recipient's wallet address:
```

## Currency Selection Callback

**Purpose**: Select the currency for a transfer.

**Implementation**:

```typescript
export async function handleCurrencyCallback(
  msgObj: TelegramMessage,
  currency: string
) {
  const chatId = msgObj.chat.id;
  const session = await sessionService.getSession(chatId);

  // Authentication and KYC checks
  if (!(await authService.isAuthenticated(chatId))) {
    await TelegramService.sendMessage(chatId, authRequiredMessage);
    return;
  }

  if (!(await checkKycVerification(chatId, "send features"))) {
    return;
  }

  // Update session with selected currency
  await sessionService.updateSession(chatId, {
    state: UserState.AWAITING_PURPOSE,
    transferData: {
      ...session.transferData,
      currency,
    },
  });

  // Show purpose selection options
  await TelegramService.sendMessage(chatId, sendPurposeMessage, {
    inlineKeyboard: [
      [
        { text: "Payment", callback_data: "transfer_purpose:PAYMENT" },
        { text: "Gift", callback_data: "transfer_purpose:GIFT" },
      ],
      [
        { text: "Investment", callback_data: "transfer_purpose:INVESTMENT" },
        { text: "Self", callback_data: "transfer_purpose:SELF" },
      ],
      [{ text: "Cancel", callback_data: CallbackEnum.SEND_CANCEL }],
    ],
  });
}
```

**Response Example**:

```
🏷️ Transfer Purpose

Please select a purpose for this transfer:
```

## Purpose Selection Callback

**Purpose**: Select the purpose code for a transfer.

**Implementation**:

```typescript
export async function handlePurposeCallback(
  msgObj: TelegramMessage,
  purpose: string
) {
  const chatId = msgObj.chat.id;
  const session = await sessionService.getSession(chatId);

  // Authentication and KYC checks
  if (!(await authService.isAuthenticated(chatId))) {
    await TelegramService.sendMessage(chatId, authRequiredMessage);
    return;
  }

  if (!(await checkKycVerification(chatId, "send features"))) {
    return;
  }

  // Update session with purpose code
  await sessionService.updateSession(chatId, {
    state: UserState.AWAITING_CONFIRMATION,
    transferData: {
      ...session.transferData,
      purposeCode: purpose,
    },
  });

  // Get recipient display identifier (email or shortened wallet address)
  const recipient =
    session.transferData?.email ||
    shortenWalletAddress(session.transferData?.walletAddress || "");

  // Show confirmation screen
  await TelegramService.sendMessage(
    chatId,
    sendConfirmationMessage(
      recipient,
      session.transferData?.amount || "",
      session.transferData?.currency || "",
      purpose
    ),
    {
      inlineKeyboard: [
        [
          { text: "✅ Confirm", callback_data: CallbackEnum.SEND_CONFIRM },
          { text: "❌ Cancel", callback_data: CallbackEnum.SEND_CANCEL },
        ],
      ],
    }
  );
}
```

**Response Example**:

```
✅ Confirm Transfer

You are about to send:
Amount: 100 USDT
To: recipient@example.com
Purpose: PAYMENT

Do you want to proceed?
```

## Send Confirm Callback

**Purpose**: Execute the transfer after user confirmation.

**Implementation**:

```typescript
export async function handleSendConfirmCallback(msgObj: TelegramMessage) {
  const chatId = msgObj.chat.id;
  const session = await sessionService.getSession(chatId);

  // Authentication and KYC checks
  if (!(await authService.isAuthenticated(chatId))) {
    await TelegramService.sendMessage(chatId, authRequiredMessage);
    return;
  }

  if (!(await checkKycVerification(chatId, "send features"))) {
    return;
  }

  // Build transfer request from session data
  try {
    const transferRequest: TransferRequest = {
      amount: session.transferData?.amount || "",
      currency: session.transferData?.currency || "",
      purposeCode: session.transferData?.purposeCode || "",
    };

    // Add email or wallet address based on method
    if (session.transferData?.method === "email") {
      transferRequest.email = session.transferData.email;
    } else if (session.transferData?.method === "wallet") {
      transferRequest.walletAddress = session.transferData.walletAddress;
    }

    // Send the transfer
    const transfer = await transferService.sendTransfer(
      chatId,
      transferRequest
    );

    if (transfer) {
      // Format recipient for display
      const recipient =
        session.transferData?.email ||
        shortenWalletAddress(session.transferData?.walletAddress || "");

      // Show success message
      await TelegramService.sendMessage(
        chatId,
        sendSuccessMessage(
          session.transferData?.amount || "",
          session.transferData?.currency || "",
          recipient
        ),
        {
          inlineKeyboard: [
            [
              {
                text: "View Transfers",
                callback_data: CallbackEnum.TRANSFER_LIST,
              },
            ],
          ],
        }
      );

      // Reset session to authenticated state
      await sessionService.updateSession(chatId, {
        state: UserState.AUTHENTICATED,
        transferData: undefined,
      });
    } else {
      // Show error message
      await TelegramService.sendMessage(chatId, sendErrorMessage);
    }
  } catch (error) {
    logger.error("Error confirming transfer", {
      error: error.message,
      chatId,
      transferData: session.transferData,
    });
    await TelegramService.sendMessage(chatId, sendErrorMessage);
  }
}
```

**Response Example**:

```
✅ Transfer Successful!

You have sent 100 USDT to recipient@example.com.
```

## Send Cancel Callback

**Purpose**: Cancel the current transfer process.

**Implementation**:

```typescript
export async function handleSendCancelCallback(msgObj: TelegramMessage) {
  const chatId = msgObj.chat.id;

  // Reset session state
  await sessionService.updateSession(chatId, {
    state: UserState.AUTHENTICATED,
    transferData: undefined,
  });

  // Show cancellation message with options to proceed
  await TelegramService.sendMessage(
    chatId,
    "Transfer cancelled. What would you like to do next?",
    {
      inlineKeyboard: [
        [
          {
            text: "View Transfers",
            callback_data: CallbackEnum.TRANSFER_LIST,
          },
          {
            text: "Try Again",
            callback_data: CallbackEnum.TRANSFER_SEND,
          },
        ],
        [
          {
            text: "Back to Main Menu",
            callback_data: CallbackEnum.TRANSFER_BACK,
          },
        ],
      ],
    }
  );
}
```

**Response Example**:

```
Transfer cancelled. What would you like to do next?
```

## Email Receipt Handler

**Purpose**: Handle user input when email recipient is expected.

**Implementation**:

```typescript
export async function handleRecipientEmailInput(msgObj: TelegramMessage) {
  const chatId = msgObj.chat.id;
  const session = await sessionService.getSession(chatId);
  const email = msgObj.text?.trim();

  // Validate the state
  if (session.state !== UserState.AWAITING_RECIPIENT_EMAIL) {
    return;
  }

  // Validate email format
  if (!email || !isValidEmail(email)) {
    await TelegramService.sendMessage(
      chatId,
      "Please enter a valid email address."
    );
    return;
  }

  // Update session with recipient email
  await sessionService.updateSession(chatId, {
    state: UserState.AWAITING_AMOUNT,
    transferData: {
      ...session.transferData,
      email,
    },
  });

  // Ask for amount
  await TelegramService.sendMessage(chatId, sendAmountMessage(email), {
    inlineKeyboard: [
      [{ text: "Cancel", callback_data: CallbackEnum.SEND_CANCEL }],
    ],
  });
}
```

**Response Example**:

```
💰 Enter Amount

Please enter the amount you want to send to recipient@example.com:
```

## Wallet Address Input Handler

**Purpose**: Handle user input when wallet address recipient is expected.

**Implementation**:

```typescript
export async function handleRecipientWalletInput(msgObj: TelegramMessage) {
  const chatId = msgObj.chat.id;
  const session = await sessionService.getSession(chatId);
  const walletAddress = msgObj.text?.trim();

  // Validate the state
  if (session.state !== UserState.AWAITING_WALLET_ADDRESS) {
    return;
  }

  // Validate wallet address format
  if (!walletAddress || !isValidWalletAddress(walletAddress)) {
    await TelegramService.sendMessage(
      chatId,
      "Please enter a valid wallet address."
    );
    return;
  }

  // Update session with recipient wallet address
  await sessionService.updateSession(chatId, {
    state: UserState.AWAITING_AMOUNT,
    transferData: {
      ...session.transferData,
      walletAddress,
    },
  });

  // Ask for amount
  await TelegramService.sendMessage(
    chatId,
    sendAmountMessage(shortenWalletAddress(walletAddress)),
    {
      inlineKeyboard: [
        [{ text: "Cancel", callback_data: CallbackEnum.SEND_CANCEL }],
      ],
    }
  );
}
```

**Response Example**:

```
💰 Enter Amount

Please enter the amount you want to send to 0x1234...5678:
```

## Amount Input Handler

**Purpose**: Handle user input when amount is expected.

**Implementation**:

```typescript
export async function handleAmountInput(msgObj: TelegramMessage) {
  const chatId = msgObj.chat.id;
  const session = await sessionService.getSession(chatId);
  const amount = msgObj.text?.trim();

  // Validate the state
  if (session.state !== UserState.AWAITING_AMOUNT) {
    return;
  }

  // Validate amount format
  if (!amount || !isValidAmount(amount)) {
    await TelegramService.sendMessage(
      chatId,
      "Please enter a valid amount (e.g. 100 or 15.50)."
    );
    return;
  }

  // Update session with amount
  await sessionService.updateSession(chatId, {
    state: UserState.AWAITING_CURRENCY,
    transferData: {
      ...session.transferData,
      amount,
    },
  });

  // Show currency options
  await TelegramService.sendMessage(chatId, sendCurrencyMessage, {
    inlineKeyboard: [
      [
        { text: "USDT", callback_data: "transfer_currency:USDT" },
        { text: "USDC", callback_data: "transfer_currency:USDC" },
      ],
      [
        { text: "ETH", callback_data: "transfer_currency:ETH" },
        { text: "BTC", callback_data: "transfer_currency:BTC" },
      ],
      [{ text: "Cancel", callback_data: CallbackEnum.SEND_CANCEL }],
    ],
  });
}
```

**Response Example**:

```
💱 Select Currency

Please select the currency:
```

## Related Files

- `src/bot/handlers/transfer.handler.ts` - Contains send callback handlers
- `src/services/transfer.service.ts` - Service for transfer operations
- `src/bot/messages/transfer.messages.ts` - Contains transfer message templates
- `src/types/transfers.types.ts` - Transfer data type definitions
- `src/constants/callback.enum.ts` - Defines callback enum values
