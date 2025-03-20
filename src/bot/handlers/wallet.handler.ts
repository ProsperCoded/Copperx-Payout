import { TelegramMessage } from "../../types/webhook.types";
import { TelegramService } from "../../utils/telegram/telegram.service";
import { AuthService } from "../../services/auth.service";
import { WalletService } from "../../services/wallet.service";
import { CallbackEnum } from "../../constants/callback.enum";
import { logger } from "../webhook";
import {
  walletListHeaderMessage,
  walletDetailMessage,
  walletBalancesMessage,
  depositInstructionsMessage,
  noWalletsMessage,
  walletSetAsDefaultMessage,
  authRequiredMessage,
  errorFetchingWalletsMessage,
} from "../messages/wallet.messages";

const authService = AuthService.getInstance();
const walletService = WalletService.getInstance();

// Handler for /wallet command
export async function handleWalletCommand(msgObj: TelegramMessage) {
  const chatId = msgObj.chat.id;

  if (!(await authService.isAuthenticated(chatId))) {
    await TelegramService.sendMessage(chatId, authRequiredMessage);
    return;
  }

  await displayWalletList(chatId);
}

// Display list of user's wallets
async function displayWalletList(chatId: number) {
  try {
    const wallets = await walletService.getUserWallets(chatId);

    if (!wallets || wallets.length === 0) {
      await TelegramService.sendMessage(chatId, noWalletsMessage, {
        inlineKeyboard: [
          [
            {
              text: "Create a Wallet",
              callback_data: CallbackEnum.WALLET_CREATE,
            },
          ],
        ],
      });
      return;
    }

    const inlineKeyboard = wallets.map((wallet) => [
      {
        text: `${wallet.network} ${wallet.isDefault ? "(Default)" : ""}`,
        callback_data: `${CallbackEnum.WALLET_DETAILS}:${wallet.id}`,
      },
    ]);

    // Add an option to view all balances
    inlineKeyboard.push([
      {
        text: "View All Balances",
        callback_data: CallbackEnum.WALLET_ALL_BALANCES,
      },
    ]);

    await TelegramService.sendMessage(chatId, walletListHeaderMessage, {
      inlineKeyboard,
    });
  } catch (error) {
    logger.error("Error displaying wallet list", {
      error: error.message,
      chatId,
    });
    await TelegramService.sendMessage(chatId, errorFetchingWalletsMessage);
  }
}

// Handle wallet detail display callback
export async function handleWalletDetailsCallback(
  msgObj: TelegramMessage,
  walletId: string
) {
  const chatId = msgObj.chat.id;

  if (!(await authService.isAuthenticated(chatId))) {
    await TelegramService.sendMessage(chatId, authRequiredMessage);
    return;
  }

  try {
    const wallets = await walletService.getUserWallets(chatId);
    if (!wallets) {
      await TelegramService.sendMessage(chatId, errorFetchingWalletsMessage);
      return;
    }

    const selectedWallet = wallets.find((w) => w.id === walletId);
    if (!selectedWallet) {
      await TelegramService.sendMessage(
        chatId,
        "Wallet not found. Please try again."
      );
      return;
    }

    const balance = await walletService.getWalletBalance(chatId, walletId);
    if (!balance) {
      await TelegramService.sendMessage(
        chatId,
        "Could not fetch wallet balance. Please try again."
      );
      return;
    }

    const inlineKeyboard = [
      [
        {
          text: "Deposit",
          callback_data: `${CallbackEnum.WALLET_DEPOSIT}:${walletId}`,
        },
      ],
    ];

    // Only show "Set as Default" button if this is not already the default wallet
    if (!selectedWallet.isDefault) {
      inlineKeyboard.push([
        {
          text: "Set as Default",
          callback_data: `${CallbackEnum.WALLET_SET_DEFAULT}:${walletId}`,
        },
      ]);
    }

    // Add a back button
    inlineKeyboard.push([
      { text: "Back to Wallet List", callback_data: CallbackEnum.WALLET_BACK },
    ]);

    await TelegramService.sendMessage(
      chatId,
      walletDetailMessage(
        selectedWallet.network,
        selectedWallet.id,
        selectedWallet.address,
        balance.balance,
        selectedWallet.isDefault
      ),
      { inlineKeyboard }
    );
  } catch (error) {
    logger.error("Error displaying wallet details", {
      error: error.message,
      chatId,
      walletId,
    });
    await TelegramService.sendMessage(
      chatId,
      "An error occurred. Please try again later."
    );
  }
}

// Handle setting a wallet as default
export async function handleSetDefaultWalletCallback(
  msgObj: TelegramMessage,
  walletId: string
) {
  const chatId = msgObj.chat.id;

  if (!(await authService.isAuthenticated(chatId))) {
    await TelegramService.sendMessage(chatId, authRequiredMessage);
    return;
  }

  try {
    const wallets = await walletService.getUserWallets(chatId);
    if (!wallets) {
      await TelegramService.sendMessage(chatId, errorFetchingWalletsMessage);
      return;
    }

    const selectedWallet = wallets.find((w) => w.id === walletId);
    if (!selectedWallet) {
      await TelegramService.sendMessage(
        chatId,
        "Wallet not found. Please try again."
      );
      return;
    }

    const success = await walletService.setDefaultWallet(chatId, walletId);
    if (success) {
      await TelegramService.sendMessage(
        chatId,
        walletSetAsDefaultMessage(selectedWallet.network)
      );
      // Refresh wallet details after setting as default
      await handleWalletDetailsCallback(msgObj, walletId);
    } else {
      await TelegramService.sendMessage(
        chatId,
        "Could not set wallet as default. Please try again."
      );
    }
  } catch (error) {
    logger.error("Error setting default wallet", {
      error: error.message,
      chatId,
      walletId,
    });
    await TelegramService.sendMessage(
      chatId,
      "An error occurred. Please try again later."
    );
  }
}

// Handle deposit callback - show deposit address
export async function handleDepositCallback(
  msgObj: TelegramMessage,
  walletId: string
) {
  const chatId = msgObj.chat.id;

  if (!(await authService.isAuthenticated(chatId))) {
    await TelegramService.sendMessage(chatId, authRequiredMessage);
    return;
  }

  try {
    const wallets = await walletService.getUserWallets(chatId);
    if (!wallets) {
      await TelegramService.sendMessage(chatId, errorFetchingWalletsMessage);
      return;
    }

    const selectedWallet = wallets.find((w) => w.id === walletId);
    if (!selectedWallet) {
      await TelegramService.sendMessage(
        chatId,
        "Wallet not found. Please try again."
      );
      return;
    }

    await TelegramService.sendMessage(
      chatId,
      depositInstructionsMessage(
        selectedWallet.network,
        selectedWallet.address
      ),
      {
        inlineKeyboard: [
          [
            {
              text: "Back to Wallet Details",
              callback_data: `${CallbackEnum.WALLET_DETAILS}:${walletId}`,
            },
          ],
        ],
      }
    );
  } catch (error) {
    logger.error("Error showing deposit instructions", {
      error: error.message,
      chatId,
      walletId,
    });
    await TelegramService.sendMessage(
      chatId,
      "An error occurred. Please try again later."
    );
  }
}

// Handle view all balances callback
export async function handleAllBalancesCallback(msgObj: TelegramMessage) {
  const chatId = msgObj.chat.id;

  if (!(await authService.isAuthenticated(chatId))) {
    await TelegramService.sendMessage(chatId, authRequiredMessage);
    return;
  }

  try {
    const balances = await walletService.getAllWalletBalances(chatId);
    if (!balances || balances.length === 0) {
      await TelegramService.sendMessage(
        chatId,
        "You don't have any wallet balances to display."
      );
      return;
    }

    await TelegramService.sendMessage(chatId, walletBalancesMessage(balances), {
      inlineKeyboard: [
        [
          {
            text: "Back to Wallet List",
            callback_data: CallbackEnum.WALLET_BACK,
          },
        ],
      ],
    });
  } catch (error) {
    logger.error("Error fetching all balances", {
      error: error.message,
      chatId,
    });
    await TelegramService.sendMessage(
      chatId,
      "An error occurred. Please try again later."
    );
  }
}

// Handle back button callback to return to wallet list
export async function handleWalletBackCallback(msgObj: TelegramMessage) {
  await displayWalletList(msgObj.chat.id);
}

// Handle create wallet callback
export async function handleCreateWalletCallback(msgObj: TelegramMessage) {
  const chatId = msgObj.chat.id;

  if (!(await authService.isAuthenticated(chatId))) {
    await TelegramService.sendMessage(chatId, authRequiredMessage);
    return;
  }

  try {
    const networks = await walletService.getSupportedNetworks(chatId);
    if (!networks || networks.length === 0) {
      await TelegramService.sendMessage(
        chatId,
        "No supported networks found. Please try again later."
      );
      return;
    }

    const inlineKeyboard = networks.map((network) => [
      { text: network, callback_data: `create_wallet_${network}` },
    ]);

    // Add back button
    inlineKeyboard.push([
      { text: "Back", callback_data: CallbackEnum.WALLET_BACK },
    ]);

    await TelegramService.sendMessage(
      chatId,
      "Select a network to create a wallet:",
      { inlineKeyboard }
    );
  } catch (error) {
    logger.error("Error fetching supported networks", {
      error: error.message,
      chatId,
    });
    await TelegramService.sendMessage(
      chatId,
      "An error occurred. Please try again later."
    );
  }
}
