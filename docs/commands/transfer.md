# /transfer and /send Commands

The `/transfer` command provides access to all transfer-related features, including viewing transfer history and initiating new transfers. The `/send` command is a shortcut to the "Send Funds" functionality.

## Command Overview

- **Purpose**: View and manage transfers, send funds
- **Authentication Required**: Yes
- **KYC Required**: Yes
- **Implementation Files**:
  - `src/bot/handlers/transfer.handler.ts`
  - `src/services/transfer.service.ts`

## Features

The transfer commands provide the following functionality:

1. **List Transfers**: View transaction history with pagination
2. **Transfer Details**: View detailed information about a specific transfer
3. **Send Funds**: Send funds to another user via email or wallet address
4. **Withdraw to Wallet**: Withdraw funds to an external wallet
5. **Batch Transfer**: Send funds to multiple recipients in a batch
6. **Offramp Transfer**: Convert crypto to fiat and withdraw to a bank account

## Transfer Flows

### Main Transfer Menu Flow

```
/transfer → Transfer Operations Menu →
  → List Transfers
  → Send Funds
  → Withdraw to Wallet
  → Batch Transfer
  → Offramp Transfer
```

### Send Funds Flow

```
/send or "Send Funds" →
  → Send by Email or Send by Wallet Address →
  → Enter Recipient →
  → Enter Amount →
  → Select Currency →
  → Select Purpose →
  → Confirm Transfer
```

### List Transfers Flow

```
"List Transfers" → View Transfers List → Select Transfer → View Transfer Details
```

## Response Examples

### Transfer Operations Menu

```
💸 Transfer Operations

Choose an operation:
```

With buttons:

- 📋 List Transfers
- 💸 Send Funds
- 🏧 Withdraw to Wallet
- 📦 Batch Transfer
- 🏦 Offramp Transfer

### Send Funds Initial Screen

```
💸 Send Funds

How would you like to send funds?
```

With buttons:

- 📧 Send by Email
- 🔑 Send by Wallet Address
- Cancel

### Enter Amount Screen

```
💰 Enter Amount

Please enter the amount you want to send to recipient@example.com:
```

### Select Currency Screen

```
💱 Select Currency

Please select the currency:
```

With buttons:

- USDT
- USDC
- ETH
- BTC
- Cancel

### Confirm Transfer Screen

```
✅ Confirm Transfer

You are about to send:
Amount: 100 USDT
To: recipient@example.com
Purpose: PAYMENT

Do you want to proceed?
```

With buttons:

- ✅ Confirm
- ❌ Cancel

### Transfer List

```
📋 Your Transfers (Page 1/3)

Select a transfer to view details:
```

With buttons for each transfer and pagination controls.

## Implementation Details

### Transfer Command Handler

```typescript
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
```

### Multi-step Send Flow

The send flow uses session state to track progress:

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

export async function handleRecipientInput(msgObj: TelegramMessage) {
  const chatId = msgObj.chat.id;
  const session = await sessionService.getSession(chatId);
  const input = msgObj.text?.trim();

  // Validate input...

  // Update session with recipient
  await sessionService.updateSession(chatId, {
    state: UserState.AWAITING_AMOUNT,
    transferData: {
      ...session.transferData,
      email: input,
    },
  });

  await TelegramService.sendMessage(chatId, sendAmountMessage(input));
}

// Similar handlers for amount, currency, purpose, and confirmation
```

### Transfer Service Integration

The transfer features integrate with the `TransferService` to perform operations:

```typescript
// Example: Send a transfer
async sendTransfer(
  chatId: number,
  transferData: TransferRequest
): Promise<Transfer | null> {
  const accessToken = await this.authService.getAccessToken(chatId);
  if (!accessToken) {
    return null;
  }

  try {
    this.setAccessToken(accessToken);
    const result = await this.copperxTransfersApi.sendTransfer(transferData);
    return result;
  } catch (error) {
    // Error handling...
    return null;
  }
}
```

## Transfer Data Structures

The transfer feature uses these key data structures:

```typescript
// Transfer request object
export interface TransferRequest {
  walletAddress?: string;
  email?: string;
  payeeId?: string;
  amount: string;
  purposeCode: string;
  currency: string;
}

// Session transfer data
transferData?: {
  method?: "email" | "wallet";
  email?: string;
  walletAddress?: string;
  amount?: string;
  currency?: string;
  purposeCode?: string;
};
```

## Session States for Transfer Flow

The transfer flow uses these session states:

- `UserState.AWAITING_RECIPIENT_EMAIL`: Waiting for recipient email
- `UserState.AWAITING_WALLET_ADDRESS`: Waiting for recipient wallet address
- `UserState.AWAITING_AMOUNT`: Waiting for transfer amount
- `UserState.AWAITING_CURRENCY`: Waiting for currency selection
- `UserState.AWAITING_PURPOSE`: Waiting for purpose selection
- `UserState.AWAITING_CONFIRMATION`: Waiting for transfer confirmation

## Input Validation

The transfer process includes validation for:

- Email addresses: `/^[^\s@]+@[^\s@]+\.[^\s@]+$/`
- Wallet addresses: Basic length and format checks
- Amount: Must be a positive number
- Currency: Must be from the supported list
- Purpose code: Must be from the supported list

## Error Handling

The transfer commands handle various error scenarios:

- Authentication errors
- KYC verification errors
- Invalid input errors
- API errors when fetching or creating transfers
- Network errors

## Related Files

- `src/bot/messages/transfer.messages.ts` - Contains transfer message templates
- `src/services/transfer.service.ts` - Service for transfer operations
- `src/utils/copperxApi/copperxApi.transfers.ts` - API client for transfer operations
- `src/types/transfers.types.ts` - Transfer data type definitions

## Best Practices

- Always confirm transfers before execution
- Provide clear feedback after transfer execution (success or failure)
- Format currency amounts with appropriate decimal places
- Allow cancellation at any step of the multi-step flow
- Implement pagination for transfer lists to handle large transaction histories
- Show relevant details in transfer history (date, amount, status)
