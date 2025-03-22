import { TelegramMessage } from "../../types/webhook.types";
import { TelegramService } from "../../utils/telegram/telegram.service";
import { AuthService } from "../../services/auth.service";
import { TransferService } from "../../services/transfer.service";
import { WalletService } from "../../services/wallet.service";
import { CallbackEnum } from "../../constants/callback.enum";
import { logger } from "../webhook";
import { checkKycVerification } from "../utils/kyc-verification";
import { SessionService } from "../../utils/session/session.service";
import { TransferRequest } from "../../types/transfers.types";
import { UserState } from "../../types/session.types";
import {
  transferOptionsMessage,
  transferListHeaderMessage,
  transferEmptyListMessage,
  transferDetailsMessage,
  authRequiredMessage,
  errorFetchingTransfersMessage,
  sendTransferHeaderMessage,
  sendByEmailMessage,
  sendByWalletMessage,
  sendAmountMessage,
  sendCurrencyMessage,
  sendPurposeMessage,
  sendConfirmationMessage,
  sendSuccessMessage,
  sendErrorMessage,
  withdrawHeaderMessage,
  batchTransferHeaderMessage,
  offrampTransferHeaderMessage,
} from "../messages/transfer.messages";

const authService = AuthService.getInstance();
const transferService = TransferService.getInstance();
const walletService = WalletService.getInstance();
const sessionService = SessionService.getInstance();

// Main transfer command handler - shows available transfer operations
export async function handleTransferCommand(msgObj: TelegramMessage) {
  const chatId = msgObj.chat.id;

  if (!(await authService.isAuthenticated(chatId))) {
    await TelegramService.sendMessage(chatId, authRequiredMessage);
    return;
  }

  // Check KYC verification
  if (!(await checkKycVerification(chatId, "transfer features"))) {
    return;
  }

  await TelegramService.sendMessage(chatId, transferOptionsMessage, {
    inlineKeyboard: [
      [
        {
          text: "📋 List Transfers",
          callback_data: CallbackEnum.TRANSFER_LIST,
        },
        { text: "💸 Send Funds", callback_data: CallbackEnum.TRANSFER_SEND },
      ],
      [
        {
          text: "🏧 Withdraw to Wallet",
          callback_data: CallbackEnum.TRANSFER_WITHDRAW,
        },
        {
          text: "📦 Batch Transfer",
          callback_data: CallbackEnum.TRANSFER_BATCH,
        },
      ],
      [
        {
          text: "🏦 Offramp Transfer",
          callback_data: CallbackEnum.TRANSFER_OFFRAMP,
        },
      ],
    ],
  });
}

// List transfers with pagination
export async function handleTransferListCallback(
  msgObj: TelegramMessage,
  page: number = 1
) {
  const chatId = msgObj.chat.id;

  if (!(await authService.isAuthenticated(chatId))) {
    await TelegramService.sendMessage(chatId, authRequiredMessage);
    return;
  }

  // Check KYC verification
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

// Show transfer details
export async function handleTransferDetailsCallback(
  msgObj: TelegramMessage,
  transferId: string
) {
  const chatId = msgObj.chat.id;

  if (!(await authService.isAuthenticated(chatId))) {
    await TelegramService.sendMessage(chatId, authRequiredMessage);
    return;
  }

  // Check KYC verification
  if (!(await checkKycVerification(chatId, "transfer details"))) {
    return;
  }

  try {
    const transfer = await transferService.getTransferById(chatId, transferId);

    if (!transfer) {
      await TelegramService.sendMessage(
        chatId,
        "Transfer not found. Please try again."
      );
      return;
    }

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

// Initialize the send process
export async function handleSendTransferCallback(msgObj: TelegramMessage) {
  const chatId = msgObj.chat.id;

  if (!(await authService.isAuthenticated(chatId))) {
    await TelegramService.sendMessage(chatId, authRequiredMessage);
    return;
  }

  // Check KYC verification
  if (!(await checkKycVerification(chatId, "sending funds"))) {
    return;
  }

  // Start the send process - ask how they want to send
  await TelegramService.sendMessage(chatId, sendTransferHeaderMessage, {
    inlineKeyboard: [
      [
        { text: "📧 Send by Email", callback_data: CallbackEnum.SEND_BY_EMAIL },
        {
          text: "🔑 Send by Wallet Address",
          callback_data: CallbackEnum.SEND_BY_WALLET,
        },
      ],
      [{ text: "Cancel", callback_data: CallbackEnum.SEND_CANCEL }],
    ],
  });
}

// Handle send by email
export async function handleSendByEmailCallback(msgObj: TelegramMessage) {
  const chatId = msgObj.chat.id;

  // Update session for expected email input - now with the specific recipient email state
  await sessionService.updateSession(chatId, {
    state: UserState.AWAITING_RECIPIENT_EMAIL,
    transferData: {
      method: "email",
    },
  });

  await TelegramService.sendMessage(chatId, sendByEmailMessage);
}

// Handle send by wallet address
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

// Handle recipient input (email or wallet)
export async function handleRecipientInput(msgObj: TelegramMessage) {
  const chatId = msgObj.chat.id;
  const session = await sessionService.getSession(chatId);
  const input = msgObj.text?.trim();

  if (!input) {
    await TelegramService.sendMessage(
      chatId,
      "Please enter a valid recipient."
    );
    return;
  }

  const method = session.transferData?.method;

  if (method === "email") {
    // Validate email
    if (!isValidEmail(input)) {
      await TelegramService.sendMessage(
        chatId,
        "Please enter a valid email address."
      );
      return;
    }

    // Update session with recipient
    await sessionService.updateSession(chatId, {
      state: UserState.AWAITING_AMOUNT,
      transferData: {
        ...session.transferData,
        email: input,
      },
    });

    await TelegramService.sendMessage(chatId, sendAmountMessage(input));
  } else if (method === "wallet") {
    // Basic wallet address validation (more sophisticated validation might be needed)
    if (!isValidWalletAddress(input)) {
      await TelegramService.sendMessage(
        chatId,
        "Please enter a valid wallet address."
      );
      return;
    }

    // Update session with recipient
    await sessionService.updateSession(chatId, {
      state: UserState.AWAITING_AMOUNT,
      transferData: {
        ...session.transferData,
        walletAddress: input,
      },
    });

    await TelegramService.sendMessage(
      chatId,
      sendAmountMessage(shortenWalletAddress(input))
    );
  } else {
    // Something went wrong with the state
    await TelegramService.sendMessage(
      chatId,
      "Sorry, there was an error processing your request. Please start again."
    );
  }
}

// Handle amount input
export async function handleAmountInput(msgObj: TelegramMessage) {
  const chatId = msgObj.chat.id;
  const session = await sessionService.getSession(chatId);
  const input = msgObj.text?.trim();

  if (!input || isNaN(parseFloat(input)) || parseFloat(input) <= 0) {
    await TelegramService.sendMessage(
      chatId,
      "Please enter a valid amount (a positive number)."
    );
    return;
  }

  // Update session with amount
  await sessionService.updateSession(chatId, {
    state: UserState.AWAITING_CURRENCY,
    transferData: {
      ...session.transferData,
      amount: input,
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

// Handle currency selection
export async function handleCurrencyCallback(
  msgObj: TelegramMessage,
  currency: string
) {
  const chatId = msgObj.chat.id;
  const session = await sessionService.getSession(chatId);

  // Update session with currency
  await sessionService.updateSession(chatId, {
    state: UserState.AWAITING_PURPOSE,
    transferData: {
      ...session.transferData,
      currency,
    },
  });

  // Show purpose options
  await TelegramService.sendMessage(chatId, sendPurposeMessage, {
    inlineKeyboard: [
      [
        { text: "Payment", callback_data: "transfer_purpose:PAYMENT" },
        { text: "Gift", callback_data: "transfer_purpose:GIFT" },
      ],
      [
        { text: "Investment", callback_data: "transfer_purpose:INVESTMENT" },
        { text: "self", callback_data: "transfer_purpose:SELF" },
      ],
      [{ text: "Cancel", callback_data: CallbackEnum.SEND_CANCEL }],
    ],
  });
}

// Handle purpose selection
export async function handlePurposeCallback(
  msgObj: TelegramMessage,
  purpose: string
) {
  const chatId = msgObj.chat.id;
  const session = await sessionService.getSession(chatId);

  // Update session with purpose
  await sessionService.updateSession(chatId, {
    state: UserState.AWAITING_CONFIRMATION,
    transferData: {
      ...session.transferData,
      purposeCode: purpose,
    },
  });

  // Get recipient display name
  const recipient =
    session.transferData?.email ||
    shortenWalletAddress(session.transferData?.walletAddress || "");

  // Show confirmation
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

// Handle transfer confirmation
export async function handleSendConfirmCallback(msgObj: TelegramMessage) {
  const chatId = msgObj.chat.id;
  const session = await sessionService.getSession(chatId);

  // Send transfer request
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
    console.log("transfer request", transferRequest);
    const transfer = await transferService.sendTransfer(
      chatId,
      transferRequest
    );

    if (transfer) {
      // Success
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

      // Reset session
      await sessionService.updateSession(chatId, {
        state: UserState.AUTHENTICATED,
        transferData: undefined,
      });
    } else {
      // Failed
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

// Handle transfer cancellation
export async function handleSendCancelCallback(msgObj: TelegramMessage) {
  const chatId = msgObj.chat.id;

  // Reset session
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
            text: "Back to Transfer Menu",
            callback_data: CallbackEnum.TRANSFER_BACK,
          },
        ],
      ],
    }
  );
}

// Go back to main transfer menu
export async function handleTransferBackCallback(msgObj: TelegramMessage) {
  await handleTransferCommand(msgObj);
}

// Send funds command - alias for transfer send
export async function handleSendCommand(msgObj: TelegramMessage) {
  await handleSendTransferCallback(msgObj);
}

// Helper functions
function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function isValidWalletAddress(address: string): boolean {
  // Simple validation - can be made more sophisticated
  return address.length >= 30 && address.length <= 100;
}

function shortenWalletAddress(address: string): string {
  if (!address) return "";
  return `${address.substring(0, 6)}...${address.substring(
    address.length - 4
  )}`;
}
