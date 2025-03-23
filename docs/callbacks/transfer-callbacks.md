# Transfer Callbacks

This document details the callback operations related to transfer functionality in the CopperX Payout Bot.

## Transfer Callback Overview

Transfer callbacks enable users to interact with the transfer system, allowing them to view transaction history, send funds, withdraw to external wallets, and more.

## Available Transfer Callbacks

| Callback                     | Description                      | Parameters    | Authentication | KYC      |
| ---------------------------- | -------------------------------- | ------------- | -------------- | -------- |
| `transfer_list`              | Show transfer list               | None          | Required       | Required |
| `transfer_details:id`        | Show transfer details            | Transfer ID   | Required       | Required |
| `transfer_send`              | Initiate send process            | None          | Required       | Required |
| `transfer_withdraw`          | Initiate withdraw process        | None          | Required       | Required |
| `transfer_batch`             | Initiate batch transfer          | None          | Required       | Required |
| `transfer_offramp`           | Initiate offramp transfer        | None          | Required       | Required |
| `transfer_next_page:page`    | Go to next page of transfers     | Page number   | Required       | Required |
| `transfer_prev_page:page`    | Go to previous page of transfers | Page number   | Required       | Required |
| `transfer_back`              | Return to transfer menu          | None          | Required       | Required |
| `send_by_email`              | Send by email                    | None          | Required       | Required |
| `send_by_wallet`             | Send by wallet address           | None          | Required       | Required |
| `send_confirm`               | Confirm transfer                 | None          | Required       | Required |
| `send_cancel`                | Cancel transfer                  | None          | Required       | Required |
| `transfer_currency:currency` | Select currency                  | Currency code | Required       | Required |
| `transfer_purpose:purpose`   | Select purpose                   | Purpose code  | Required       | Required |

## Transfer List Callback

**Purpose**: Display a paginated list of the user's transfers.

**Implementation**:

```typescript
export async function handleTransferListCallback(
  msgObj: TelegramMessage,
  page: number = 1
) {
  const chatId = msgObj.chat.id;

  // Authentication and KYC checks
  if (!(await authService.isAuthenticated(chatId))) {
    await TelegramService.sendMessage(chatId, authRequiredMessage);
    return;
  }

  if (!(await checkKycVerification(chatId, "transfer listing"))) {
    return;
  }

  // Show loading message
  await TelegramService.sendMessage(chatId, "Loading your transfers...");

  try {
    const limit = 5; // Show 5 transfers per page
    const transfers = await transferService.listTransfers(chatId, page, limit);

    if (!transfers || transfers.data.length === 0) {
      await TelegramService.sendMessage(chatId, transferEmptyListMessage, {
        inlineKeyboard: [
          [
            { text: "Back", callback_data: CallbackEnum.TRANSFER_BACK },
            { text: "Send Funds", callback_data: CallbackEnum.TRANSFER_SEND },
          ],
        ],
      });
      return;
    }

    // Calculate total pages
    const totalPages = Math.ceil(transfers.count / limit);

    // Create list of transfers as buttons
    const transferButtons = transfers.data.map((transfer) => [
      {
        text: `${new Date(transfer.createdAt).toLocaleDateString()} - ${
          transfer.amount
        } ${transfer.currency} (${transfer.status})`,
        callback_data: `${CallbackEnum.TRANSFER_DETAILS}:${transfer.id}`,
      },
    ]);

    // Add pagination controls
    const paginationButtons = [];

    if (page > 1) {
      paginationButtons.push({
        text: "⬅️ Previous",
        callback_data: `${CallbackEnum.TRANSFER_PREV_PAGE}:${page - 1}`,
      });
    }

    if (transfers.hasMore || page < totalPages) {
      paginationButtons.push({
        text: "➡️ Next",
        callback_data: `${CallbackEnum.TRANSFER_NEXT_PAGE}:${page + 1}`,
      });
    }

    // Add back button
    const navigationButtons = [
      {
        text: "Back to Transfer Menu",
        callback_data: CallbackEnum.TRANSFER_BACK,
      },
    ];

    // Combine all buttons
    const inlineKeyboard = [
      ...transferButtons,
      paginationButtons.length > 0 ? paginationButtons : [],
      navigationButtons,
    ];

    await TelegramService.sendMessage(
      chatId,
      transferListHeaderMessage(page, totalPages),
      { inlineKeyboard }
    );
  } catch (error) {
    logger.error("Error handling transfer list", {
      error: error.message,
      chatId,
    });
    await TelegramService.sendMessage(chatId, errorFetchingTransfersMessage);
  }
}
```

**Response Example**:

```
📋 Your Transfers (Page 1/3)

Select a transfer to view details:
```

## Transfer Details Callback

**Purpose**: Show detailed information about a specific transfer.

**Implementation**:

```typescript
export async function handleTransferDetailsCallback(
  msgObj: TelegramMessage,
  transferId: string
) {
  const chatId = msgObj.chat.id;

  // Authentication and KYC checks
  if (!(await authService.isAuthenticated(chatId))) {
    await TelegramService.sendMessage(chatId, authRequiredMessage);
    return;
  }

  if (!(await checkKycVerification(chatId, "transfer details"))) {
    return;
  }

  try {
    // Get transfer details
    const transfer = await transferService.getTransferById(chatId, transferId);

    if (!transfer) {
      await TelegramService.sendMessage(
        chatId,
        "Transfer not found. Please try again."
      );
      return;
    }

    // Show transfer details
    await TelegramService.sendMessage(
      chatId,
      transferDetailsMessage(transfer),
      {
        inlineKeyboard: [
          [
            {
              text: "Back to Transfer List",
              callback_data: CallbackEnum.TRANSFER_LIST,
            },
          ],
        ],
      }
    );
  } catch (error) {
    logger.error("Error handling transfer details", {
      error: error.message,
      chatId,
      transferId,
    });
    await TelegramService.sendMessage(
      chatId,
      "An error occurred. Please try again later."
    );
  }
}
```

**Response Example**:

```
🧾 Transfer Details

ID: abc123def456
Status: success
Amount: 100.00 USDT
Fee: 1.50 USDT
Date: 3/15/2023, 2:30:45 PM
Type: send
Destination: 0x1234...5678
Transaction Hash: 0xabcd...efgh
```

## Send By Email Callback

**Purpose**: Set up a transfer to be sent via email address.

**Implementation**:

```typescript
export async function handleSendByEmailCallback(msgObj: TelegramMessage) {
  const chatId = msgObj.chat.id;

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

**Purpose**: Set up a transfer to be sent via wallet address.

**Implementation**:

```typescript
export async function handleSendByWalletCallback(msgObj: TelegramMessage) {
  const chatId = msgObj.chat.id;

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

## Send Confirm Callback

**Purpose**: Execute the transfer after user confirmation.

**Implementation**:

```typescript
export async function handleSendConfirmCallback(msgObj: TelegramMessage) {
  const chatId = msgObj.chat.id;
  const session = await sessionService.getSession(chatId);

  try {
    // Build transfer request from session data
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
      // Success message
      await TelegramService.sendMessage(
        chatId,
        sendSuccessMessage(
          session.transferData?.amount || "",
          session.transferData?.currency || "",
          session.transferData?.email ||
            shortenWalletAddress(session.transferData?.walletAddress || "")
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

      // Reset session state
      await sessionService.updateSession(chatId, {
        state: UserState.AUTHENTICATED,
        transferData: undefined,
      });
    } else {
      // Failure message
      await TelegramService.sendMessage(chatId, sendErrorMessage);
    }
  } catch (error) {
    logger.error("Error sending transfer", {
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

## Transfer Withdraw Callback

**Purpose**: Initialize the process to withdraw funds to an external wallet.

**Implementation**:

```typescript
export async function handleWithdrawCallback(msgObj: TelegramMessage) {
  const chatId = msgObj.chat.id;

  // Authentication and KYC checks
  if (!(await authService.isAuthenticated(chatId))) {
    await TelegramService.sendMessage(chatId, authRequiredMessage);
    return;
  }

  if (!(await checkKycVerification(chatId, "withdrawal features"))) {
    return;
  }

  // Check for available balance first
  try {
    const defaultWalletBalance = await walletService.getDefaultWalletBalance(
      chatId
    );

    if (
      !defaultWalletBalance ||
      parseFloat(defaultWalletBalance.balance) <= 0
    ) {
      await TelegramService.sendMessage(
        chatId,
        "You don't have sufficient balance to withdraw. Please deposit funds first.",
        {
          inlineKeyboard: [
            [
              {
                text: "Back to Transfer Menu",
                callback_data: CallbackEnum.TRANSFER_BACK,
              },
            ],
          ],
        }
      );
      return;
    }

    // Update session state and ask for destination address
    await sessionService.updateSession(chatId, {
      state: UserState.AWAITING_WALLET_ADDRESS,
      transferData: {
        method: "withdraw",
      },
    });

    await TelegramService.sendMessage(chatId, withdrawAddressMessage, {
      inlineKeyboard: [
        [
          {
            text: "Cancel",
            callback_data: CallbackEnum.SEND_CANCEL,
          },
        ],
      ],
    });
  } catch (error) {
    logger.error("Error initiating withdrawal", {
      error: error.message,
      chatId,
    });
    await TelegramService.sendMessage(
      chatId,
      "An error occurred. Please try again later."
    );
  }
}
```

**Response Example**:

```
📤 Withdraw to External Wallet

Please enter the destination wallet address:
```

## Batch Transfer Callback

**Purpose**: Initialize the process to send funds to multiple recipients at once.

**Implementation**:

```typescript
export async function handleBatchTransferCallback(msgObj: TelegramMessage) {
  const chatId = msgObj.chat.id;

  // Authentication and KYC checks
  if (!(await authService.isAuthenticated(chatId))) {
    await TelegramService.sendMessage(chatId, authRequiredMessage);
    return;
  }

  if (!(await checkKycVerification(chatId, "batch transfer features"))) {
    return;
  }

  // Batch transfers may have additional KYC requirements
  try {
    const kycStatus = await authService.checkAdvancedKycStatus(chatId);
    if (!kycStatus || kycStatus.level < 2) {
      await TelegramService.sendMessage(
        chatId,
        "Batch transfers require enhanced KYC verification. Please complete additional verification first.",
        {
          inlineKeyboard: [
            [
              {
                text: "Complete Enhanced Verification",
                url: "https://copperx.io/verify/advanced",
              },
            ],
            [
              {
                text: "Back to Transfer Menu",
                callback_data: CallbackEnum.TRANSFER_BACK,
              },
            ],
          ],
        }
      );
      return;
    }

    // Initialize batch transfer process
    await TelegramService.sendMessage(
      chatId,
      batchTransferInstructionsMessage,
      {
        inlineKeyboard: [
          [
            {
              text: "Download Template",
              url: "https://copperx.io/templates/batch-transfer.csv",
            },
          ],
          [
            {
              text: "Back to Transfer Menu",
              callback_data: CallbackEnum.TRANSFER_BACK,
            },
          ],
        ],
      }
    );

    // Update session state to await CSV upload
    await sessionService.updateSession(chatId, {
      state: UserState.AWAITING_BATCH_FILE,
    });
  } catch (error) {
    logger.error("Error initiating batch transfer", {
      error: error.message,
      chatId,
    });
    await TelegramService.sendMessage(
      chatId,
      "An error occurred. Please try again later."
    );
  }
}
```

**Response Example**:

```
📦 Batch Transfer

Batch transfers allow you to send funds to multiple recipients at once.
1. Download the template CSV file
2. Fill in recipient emails/addresses and amounts
3. Upload the completed file to this chat
```

## Related Files

- `src/bot/handlers/transfer.handler.ts` - Contains transfer callback handlers
- `src/services/transfer.service.ts` - Service for transfer operations
- `src/utils/copperxApi/copperxApi.transfers.ts` - API client for transfer operations
- `src/bot/messages/transfer.messages.ts` - Message templates for transfers
- `src/constants/callback.enum.ts` - Defines transfer callback enum values
