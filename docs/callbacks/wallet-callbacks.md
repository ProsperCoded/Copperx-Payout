# Wallet Callbacks

This document details the callback operations related to wallet management in the CopperX Payout Bot.

## Wallet Callback Overview

Wallet callbacks enable users to interact with their cryptocurrency wallets through inline keyboard buttons. These callbacks handle operations such as viewing wallet details, setting default wallets, generating deposit addresses, and creating new wallets.

## Available Wallet Callbacks

| Callback                | Description                       | Parameters   | Authentication | KYC      |
| ----------------------- | --------------------------------- | ------------ | -------------- | -------- |
| `wallet_details:id`     | Show wallet details               | Wallet ID    | Required       | Required |
| `wallet_set_default:id` | Set default wallet                | Wallet ID    | Required       | Required |
| `wallet_deposit:id`     | Show deposit address              | Wallet ID    | Required       | Required |
| `wallet_all_balances`   | Show all wallet balances          | None         | Required       | Required |
| `wallet_back`           | Return to wallet list             | None         | Required       | Required |
| `wallet_create`         | Create new wallet                 | None         | Required       | Required |
| `create_wallet_*`       | Create wallet on specific network | Network name | Required       | Required |

## Wallet Details Callback

**Purpose**: Display detailed information about a specific wallet including its balance, network, and address.

**Implementation**:

```typescript
export async function handleWalletDetailsCallback(
  msgObj: TelegramMessage,
  walletId: string
) {
  const chatId = msgObj.chat.id;

  // Authentication and KYC checks
  if (!(await authService.isAuthenticated(chatId))) {
    await TelegramService.sendMessage(chatId, authRequiredMessage);
    return;
  }

  if (!(await checkKycVerification(chatId, "wallet details"))) {
    return;
  }

  try {
    // Get wallet information
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

    // Get wallet balance
    const balance = await walletService.getWalletBalance(chatId, walletId);
    if (!balance) {
      await TelegramService.sendMessage(
        chatId,
        "Could not fetch wallet balance. Please try again."
      );
      return;
    }

    // Define action buttons
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

    // Send wallet details
    await TelegramService.sendMessage(
      chatId,
      walletDetailMessage(
        selectedWallet.network,
        selectedWallet.id,
        selectedWallet.walletAddress,
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
```

**Response Example**:

```
💼 Wallet Details

Network: ethereum
Wallet ID: 12345abcde
Address: 0x1234...5678
Balance: 100.50 USDT
✅ Default Wallet

What would you like to do with this wallet?
```

## Set Default Wallet Callback

**Purpose**: Set a specific wallet as the default wallet for transactions.

**Implementation**:

```typescript
export async function handleSetDefaultWalletCallback(
  msgObj: TelegramMessage,
  walletId: string
) {
  const chatId = msgObj.chat.id;

  // Authentication and KYC checks
  if (!(await authService.isAuthenticated(chatId))) {
    await TelegramService.sendMessage(chatId, authRequiredMessage);
    return;
  }

  if (!(await checkKycVerification(chatId, "wallet settings"))) {
    return;
  }

  try {
    // Get wallet information
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

    // Set wallet as default
    const success = await walletService.setDefaultWallet(chatId, walletId);

    if (success) {
      // Show success message
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
```

**Response Example**:

```
✅ Your ethereum wallet has been set as the default wallet.
```

## Deposit Callback

**Purpose**: Display a wallet address for receiving funds.

**Implementation**:

```typescript
export async function handleDepositCallback(
  msgObj: TelegramMessage,
  walletId: string
) {
  const chatId = msgObj.chat.id;

  // Authentication and KYC checks
  if (!(await authService.isAuthenticated(chatId))) {
    await TelegramService.sendMessage(chatId, authRequiredMessage);
    return;
  }

  if (!(await checkKycVerification(chatId, "deposit features"))) {
    return;
  }

  try {
    // Get wallet information
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

    // Show deposit instructions
    await TelegramService.sendMessage(
      chatId,
      depositInstructionsMessage(
        selectedWallet.network,
        selectedWallet.walletAddress
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
```

**Response Example**:

```
📥 Deposit to your ethereum wallet

Send funds to this address:
0x1234567890abcdef1234567890abcdef12345678

Only send ethereum network tokens to this address. Sending other tokens may result in permanent loss.
```

## All Balances Callback

**Purpose**: Display balances across all user wallets.

**Implementation**:

```typescript
export async function handleAllBalancesCallback(msgObj: TelegramMessage) {
  const chatId = msgObj.chat.id;

  // Authentication and KYC checks
  if (!(await authService.isAuthenticated(chatId))) {
    await TelegramService.sendMessage(chatId, authRequiredMessage);
    return;
  }

  if (!(await checkKycVerification(chatId, "balance information"))) {
    return;
  }

  try {
    // Get all wallet balances
    const balances = await walletService.getAllWalletBalances(chatId);
    if (!balances || balances.length === 0) {
      await TelegramService.sendMessage(
        chatId,
        "You don't have any wallet balances to display."
      );
      return;
    }

    // Show all balances
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
```

**Response Example**:

```
💰 Your Wallet Balances

Network: ethereum
Balance: 100.50 USDT
Address: 0x1234...5678

Network: polygon
Balance: 25.75 MATIC
Address: 0xabcd...efgh
```

## Wallet Back Callback

**Purpose**: Return to the wallet list view.

**Implementation**:

```typescript
export async function handleWalletBackCallback(msgObj: TelegramMessage) {
  await displayWalletList(msgObj.chat.id);
}

async function displayWalletList(chatId: number) {
  try {
    // Get user wallets
    const wallets = await walletService.getUserWallets(chatId);

    if (!wallets || wallets.length === 0) {
      // Show "create wallet" option for users with no wallets
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

    // Create buttons for each wallet
    const inlineKeyboard = wallets.map((wallet) => [
      {
        text: `${wallet.network} - ${wallet.walletType} ${
          wallet.isDefault ? "(Default)" : ""
        }`,
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

    // Show wallet list
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
```

## Create Wallet Callback

**Purpose**: Initiate the wallet creation process.

**Implementation**:

```typescript
export async function handleCreateWalletCallback(msgObj: TelegramMessage) {
  const chatId = msgObj.chat.id;

  // Authentication and KYC checks
  if (!(await authService.isAuthenticated(chatId))) {
    await TelegramService.sendMessage(chatId, authRequiredMessage);
    return;
  }

  if (!(await checkKycVerification(chatId, "wallet creation"))) {
    return;
  }

  try {
    // Get supported networks
    const networks = await walletService.getSupportedNetworks(chatId);
    if (!networks || networks.length === 0) {
      await TelegramService.sendMessage(
        chatId,
        "No supported networks found. Please try again later."
      );
      return;
    }

    // Create buttons for each network
    const inlineKeyboard = networks.map((network) => [
      { text: network, callback_data: `create_wallet_${network}` },
    ]);

    // Add back button
    inlineKeyboard.push([
      { text: "Back", callback_data: CallbackEnum.WALLET_BACK },
    ]);

    // Show network selection
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
```

## Dynamic Create Wallet Network Callback

**Purpose**: Create a wallet on a specific network.

**Implementation**:

This is handled in the main callback router:

```typescript
// In handleCallback function
if (baseCallback.startsWith("create_wallet_")) {
  const network = baseCallback.replace("create_wallet_", "");
  return handleCreateWalletForNetwork(message, network);
}

// Handler function
async function handleCreateWalletForNetwork(
  msgObj: TelegramMessage,
  network: string
) {
  const chatId = msgObj.chat.id;

  // Authentication and KYC checks
  if (!(await authService.isAuthenticated(chatId))) {
    await TelegramService.sendMessage(chatId, authRequiredMessage);
    return;
  }

  if (!(await checkKycVerification(chatId, "wallet creation"))) {
    return;
  }

  try {
    // Show loading message
    await TelegramService.sendMessage(
      chatId,
      `Creating your ${network} wallet...`
    );

    // Create wallet
    const wallet = await walletService.generateWallet(chatId, network);

    if (wallet) {
      // Show success message
      await TelegramService.sendMessage(
        chatId,
        `✅ Your ${network} wallet has been created successfully!`
      );

      // Show wallet details
      await handleWalletDetailsCallback(msgObj, wallet.id);
    } else {
      await TelegramService.sendMessage(
        chatId,
        `Failed to create ${network} wallet. Please try again later.`
      );
    }
  } catch (error) {
    logger.error("Error creating wallet", {
      error: error.message,
      chatId,
      network,
    });
    await TelegramService.sendMessage(
      chatId,
      "An error occurred while creating your wallet. Please try again later."
    );
  }
}
```

## Wallet Callback Registration

Wallet callbacks are registered in the callback operations:

```typescript
export const callbackOperations: Record<
  string,
  (msgObj: TelegramMessage, ...args: any[]) => Promise<void> | void
> = {
  // ...other callbacks
  [CallbackEnum.WALLET_ALL_BALANCES]: handleAllBalancesCallback,
  [CallbackEnum.WALLET_BACK]: handleWalletBackCallback,
  [CallbackEnum.WALLET_CREATE]: handleCreateWalletCallback,
};

export const handleCallback = async (
  callbackData: string,
  message: TelegramMessage
) => {
  // Extract the base callback and parameters
  const [baseCallback, ...params] = callbackData.split(":");

  // Handle parameterized wallet callbacks
  if (baseCallback === CallbackEnum.WALLET_DETAILS) {
    return handleWalletDetailsCallback(message, params[0]);
  }

  if (baseCallback === CallbackEnum.WALLET_SET_DEFAULT) {
    return handleSetDefaultWalletCallback(message, params[0]);
  }

  if (baseCallback === CallbackEnum.WALLET_DEPOSIT) {
    return handleDepositCallback(message, params[0]);
  }

  // Handle special case for wallet creation
  if (baseCallback.startsWith("create_wallet_")) {
    const network = baseCallback.replace("create_wallet_", "");
    return handleCreateWalletForNetwork(message, network);
  }

  // ...other callback handling
};
```

## Related Files

- `src/bot/handlers/wallet.handler.ts` - Contains wallet callback handlers
- `src/services/wallet.service.ts` - Service layer for wallet operations
- `src/constants/callback.enum.ts` - Defines callback enum values
- `src/bot/messages/wallet.messages.ts` - Contains wallet message templates
