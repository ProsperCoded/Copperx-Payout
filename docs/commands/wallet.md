# /wallet Command

The `/wallet` command provides access to all wallet management features, allowing users to view balances, create wallets, set default wallets, and generate deposit addresses.

## Command Overview

- **Purpose**: Manage cryptocurrency wallets
- **Authentication Required**: Yes
- **KYC Required**: Yes
- **Implementation File**: `src/bot/handlers/wallet.handler.ts`

## Features

The wallet command provides the following functionality:

1. **View Wallet List**: Display all wallets across different networks
2. **View Wallet Details**: Show balance and details of a specific wallet
3. **View All Balances**: Display balances across all wallets
4. **Set Default Wallet**: Set a specific wallet as the default for transactions
5. **Generate Deposit Address**: Display a wallet address for receiving funds
6. **Create New Wallet**: Create a new wallet on a supported network

## Wallet Flows

### Main Wallet Flow

```
/wallet → View Wallet List → Select Wallet → View Wallet Details →
                                               ↓
                            Set as Default or View Deposit Address
```

### Create Wallet Flow

```
/wallet → View Wallet List → Create a Wallet → Select Network → Wallet Created
```

## Response Examples

### Wallet List

```
🏦 Your CopperX Wallets

Select a wallet to set as Default and view its details:
```

With buttons for each wallet:

- ethereum - web3_auth_copperx (Default)
- polygon - web3_auth_copperx
- View All Balances

### Wallet Details

```
💼 Wallet Details

Network: ethereum
Wallet ID: 12345abcde
Address: 0x1234...5678
Balance: 100.50 USDT
✅ Default Wallet

What would you like to do with this wallet?
```

With buttons:

- Deposit
- Set as Default (if not default)
- Back to Wallet List

### All Balances

```
💰 Your Wallet Balances

Network: ethereum
Balance: 100.50 USDT
Address: 0x1234...5678

Network: polygon
Balance: 25.75 MATIC
Address: 0xabcd...efgh
```

### Deposit Instructions

```
📥 Deposit to your ethereum wallet

Send funds to this address:
0x1234567890abcdef1234567890abcdef12345678

Only send ethereum network tokens to this address. Sending other tokens may result in permanent loss.
```

## Implementation Details

### Wallet Command Handler

```typescript
export async function handleWalletCommand(msgObj: TelegramMessage) {
  const chatId = msgObj.chat.id;

  // Check authentication
  if (!(await authService.isAuthenticated(chatId))) {
    await TelegramService.sendMessage(chatId, authRequiredMessage);
    return;
  }

  // Check KYC verification
  if (!(await checkKycVerification(chatId, "wallet features"))) {
    return;
  }

  await displayWalletList(chatId);
}
```

### Display Wallet List

```typescript
async function displayWalletList(chatId: number) {
  try {
    const wallets = await walletService.getUserWallets(chatId);

    if (!wallets || wallets.length === 0) {
      // Handle no wallets case...
      return;
    }

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

    await TelegramService.sendMessage(chatId, walletListHeaderMessage, {
      inlineKeyboard,
    });
  } catch (error) {
    // Error handling...
  }
}
```

### Wallet Service Integration

The wallet command integrates with the `WalletService` to perform operations:

```typescript
// Example: Fetch user wallets from the CopperX API
async getUserWallets(chatId: number): Promise<Wallet[] | null> {
  const accessToken = await this.authService.getAccessToken(chatId);
  if (!accessToken) {
    return null;
  }

  try {
    this.setAccessToken(accessToken);
    const wallets = await this.copperxWalletApi.getOrganizationWallets();
    return wallets;
  } catch (error) {
    // Error handling...
    return null;
  }
}
```

## Callback Handlers

The wallet feature uses various callback handlers for different operations:

### Wallet Details Callback

```typescript
export async function handleWalletDetailsCallback(
  msgObj: TelegramMessage,
  walletId: string
) {
  const chatId = msgObj.chat.id;

  // Authentication and KYC checks...

  try {
    const wallets = await walletService.getUserWallets(chatId);
    const selectedWallet = wallets.find((w) => w.id === walletId);
    const balance = await walletService.getWalletBalance(chatId, walletId);

    // Display wallet details with action buttons...
  } catch (error) {
    // Error handling...
  }
}
```

### Set Default Wallet Callback

```typescript
export async function handleSetDefaultWalletCallback(
  msgObj: TelegramMessage,
  walletId: string
) {
  const chatId = msgObj.chat.id;

  // Authentication and KYC checks...

  try {
    const success = await walletService.setDefaultWallet(chatId, walletId);
    // Handle success or failure...
  } catch (error) {
    // Error handling...
  }
}
```

### Deposit Callback

```typescript
export async function handleDepositCallback(
  msgObj: TelegramMessage,
  walletId: string
) {
  const chatId = msgObj.chat.id;

  // Authentication and KYC checks...

  try {
    const wallets = await walletService.getUserWallets(chatId);
    const selectedWallet = wallets.find((w) => w.id === walletId);

    // Display deposit instructions...
  } catch (error) {
    // Error handling...
  }
}
```

## Wallet Data Structures

The wallet feature uses these key data structures:

```typescript
// Wallet object
export type Wallet = {
  id: string;
  createdAt: string;
  updatedAt: string;
  organizationId: string;
  walletType: "web3_auth_copperx" | "quantum";
  network: string;
  walletAddress: string;
  isDefault: boolean;
};

// Wallet balance
export type WalletBalance = {
  decimals: number;
  balance: string;
  symbol: string;
  address: string;
};

// Wallet balances across multiple wallets
export type WalletBalances = {
  walletId: string;
  isDefault: boolean;
  network: string;
  balances: WalletBalance[];
}[];
```

## Error Handling

The wallet command handles various error scenarios:

- Authentication errors
- KYC verification errors
- API errors when fetching wallets
- API errors when setting default wallet
- Network errors

## Related Files

- `src/bot/messages/wallet.messages.ts` - Contains wallet message templates
- `src/services/wallet.service.ts` - Service for wallet operations
- `src/utils/copperxApi/copperxApi.wallet.ts` - API client for wallet operations
- `src/types/wallet.types.ts` - Wallet data type definitions

## Best Practices

- Always show clear instructions for deposits, especially regarding network compatibility
- Provide a way to easily set and identify the default wallet
- Display wallet addresses in a copyable format with `<code>` tags
- Show confirmation messages after actions like setting a default wallet
- Always include a way to navigate back to the wallet list
