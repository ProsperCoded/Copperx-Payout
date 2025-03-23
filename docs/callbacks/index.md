# Callback Reference

This section provides a comprehensive reference for all callback operations available in the CopperX Payout Bot. Callbacks are used to handle user interactions with inline keyboard buttons.

## Callback System Overview

The callback system in the CopperX Payout Bot is designed to handle user interactions with inline keyboard buttons. When a user clicks a button, Telegram sends a `callback_query` update to the bot's webhook. The bot extracts the `callback_data` and routes it to the appropriate handler.

The callback system supports:

- Simple callbacks (e.g., `login`)
- Parameterized callbacks (e.g., `wallet_details:12345`)
- Dynamic callback generation

## Callback Architecture

Callbacks are processed through the following components:

1. **Webhook Handler**: Receives the callback query from Telegram
2. **Callback Router**: Extracts the callback data and routes to the appropriate handler
3. **Callback Handlers**: Process specific callbacks and generate responses

The main callback router is implemented in `src/bot/operations/callback.operations.ts`.

## Available Callbacks

| Callback                     | Description                      | Authentication Required | KYC Required |
| ---------------------------- | -------------------------------- | ----------------------- | ------------ |
| `login`                      | Initiate login process           | No                      | No           |
| `help`                       | Show help message                | No                      | No           |
| `check_verification`         | Check KYC status                 | Yes                     | No           |
| `wallet_details:id`          | Show wallet details              | Yes                     | Yes          |
| `wallet_set_default:id`      | Set default wallet               | Yes                     | Yes          |
| `wallet_deposit:id`          | Show deposit address             | Yes                     | Yes          |
| `wallet_all_balances`        | Show all wallet balances         | Yes                     | Yes          |
| `wallet_back`                | Return to wallet list            | Yes                     | Yes          |
| `wallet_create`              | Initiate wallet creation         | Yes                     | Yes          |
| `transfer_list`              | Show transfer list               | Yes                     | Yes          |
| `transfer_details:id`        | Show transfer details            | Yes                     | Yes          |
| `transfer_send`              | Initiate send process            | Yes                     | Yes          |
| `transfer_withdraw`          | Initiate withdraw process        | Yes                     | Yes          |
| `transfer_batch`             | Initiate batch transfer          | Yes                     | Yes          |
| `transfer_offramp`           | Initiate offramp transfer        | Yes                     | Yes          |
| `transfer_next_page:page`    | Go to next page of transfers     | Yes                     | Yes          |
| `transfer_prev_page:page`    | Go to previous page of transfers | Yes                     | Yes          |
| `transfer_back`              | Return to transfer menu          | Yes                     | Yes          |
| `send_by_email`              | Send by email                    | Yes                     | Yes          |
| `send_by_wallet`             | Send by wallet address           | Yes                     | Yes          |
| `send_confirm`               | Confirm transfer                 | Yes                     | Yes          |
| `send_cancel`                | Cancel transfer                  | Yes                     | Yes          |
| `transfer_currency:currency` | Select currency                  | Yes                     | Yes          |
| `transfer_purpose:purpose`   | Select purpose                   | Yes                     | Yes          |

## Callback Implementation

The main callback router is implemented as follows:

```typescript
export const handleCallback = async (
  callbackData: string,
  message: TelegramMessage
) => {
  // Extract the base callback and parameters
  const [baseCallback, ...params] = callbackData.split(":");

  // Handle parameterized callbacks
  if (baseCallback === CallbackEnum.WALLET_DETAILS) {
    return handleWalletDetailsCallback(message, params[0]);
  }

  if (baseCallback === CallbackEnum.WALLET_SET_DEFAULT) {
    return handleSetDefaultWalletCallback(message, params[0]);
  }

  // ...more parameterized callbacks...

  // Handle standard callbacks without parameters
  if (baseCallback in callbackOperations) {
    return callbackOperations[baseCallback](message);
  }

  // Handle special case callbacks
  if (baseCallback.startsWith("create_wallet_")) {
    const network = baseCallback.replace("create_wallet_", "");
    // Implement wallet creation for specific network
  }
};
```

## Callback Details

Each callback category has its own detailed documentation:

- [Login Callbacks](./login-callbacks.md)
- [Wallet Callbacks](./wallet-callbacks.md)
- [Transfer Callbacks](./transfer-callbacks.md)
- [Send Callbacks](./send-callbacks.md)
- [Verification Callbacks](./verification-callbacks.md)

## Callback Registration

Standard callbacks are registered in the `callbackOperations` object:

```typescript
export const callbackOperations: Record<
  string,
  (msgObj: TelegramMessage, ...args: any[]) => Promise<void> | void
> = {
  [CallbackEnum.LOGIN]: loginHandler,
  [CallbackEnum.HELP]: handleHelpCommand,
  [CallbackEnum.WALLET_ALL_BALANCES]: handleAllBalancesCallback,
  // ...more callbacks...
};
```

## Callback Data Format

Callbacks follow these formats:

- Simple callback: `callback_name`
- Parameterized callback: `callback_name:parameter1:parameter2`

The parameters are extracted using:

```typescript
const [baseCallback, ...params] = callbackData.split(":");
```

## Best Practices

- Use clear, descriptive names for callbacks
- Keep callback data short to respect Telegram's 64-byte limit
- Use parameterized callbacks for dynamic content
- Handle authentication and KYC checks in each callback handler
- Provide clear error messages if a callback fails
- Always include a way to navigate back or cancel an operation
