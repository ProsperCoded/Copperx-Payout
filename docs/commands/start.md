# /start Command

The `/start` command is the entry point for users interacting with the CopperX Payout Bot. It provides a personalized welcome message and guides users on next steps based on their authentication and KYC verification status.

## Command Overview

- **Purpose**: Initialize the bot and show welcome message
- **Authentication Required**: No
- **KYC Required**: No
- **Implementation File**: `src/bot/handlers/start.handler.ts`

## Functionality

When a user sends the `/start` command, the bot:

1. Checks if the user is already authenticated
2. If not authenticated, shows a welcome message with login options
3. If authenticated but not KYC verified, shows a message prompting KYC verification
4. If authenticated and KYC verified, shows a personalized welcome back message

## Response Examples

### For New/Unauthenticated Users

```
🚀 Welcome to CopperX Payout Bot!

This bot helps you manage your crypto transactions and wallet with ease. You can:
• Check your USDT balance
• Send funds to others
• View transaction history

To get started, please log in to your CopperX account using the button below or type /login.
```

With inline keyboard buttons:

- 🔐 Login to CopperX
- ℹ️ Help

### For Authenticated Users Without KYC

```
👋 Welcome back, username!

⚠️ Your account KYC is not verified. You need to complete verification to use all features.
```

With inline keyboard buttons:

- 🔍 Check Verification Status
- Learn how to complete KYC
- Complete KYC now

### For Fully Verified Users

```
👋 Welcome back, username!

Your account is fully verified. You can use all features of the CopperX Payout bot.
```

With inline keyboard buttons:

- 💰 Check Wallet
- ℹ️ Help

## Implementation Details

The start handler is implemented as follows:

```typescript
export async function startHandler(msgObj: TelegramMessage) {
  const chatId = msgObj.chat.id;

  // Check if user is authenticated
  const isAuthenticated = await authService.isAuthenticated(chatId);

  if (!isAuthenticated) {
    // New user or not logged in, show standard welcome message
    await TelegramService.sendMessage(chatId, welcomeMessage, {
      inlineKeyboard: [
        [{ text: "🔐 Login to CopperX", callback_data: CallbackEnum.LOGIN }],
        [{ text: "ℹ️ Help", callback_data: CallbackEnum.HELP }],
      ],
    });
    return;
  }

  // User is authenticated, get session to check KYC status
  const session = await sessionService.getSession(chatId);
  const firstName = session.email ? session.email.split("@")[0] : "there";

  if (session.kycVerified) {
    // User is verified, show friendly welcome back message
    await TelegramService.sendMessage(
      chatId,
      `👋 Welcome back, ${firstName}!\n\nYour account is fully verified. You can use all features of the CopperX Payout bot.`,
      {
        inlineKeyboard: [
          [
            {
              text: "💰 Check Wallet",
              callback_data: CallbackEnum.WALLET_BACK,
            },
          ],
          [{ text: "ℹ️ Help", callback_data: CallbackEnum.HELP }],
        ],
      }
    );
  } else {
    // User is authenticated but not verified
    await TelegramService.sendMessage(
      chatId,
      `👋 Welcome back, ${firstName}!\n\n⚠️ Your account KYC is not verified. You need to complete verification to use all features.`,
      {
        inlineKeyboard: [
          [
            {
              text: "🔍 Check Verification Status",
              callback_data: CallbackEnum.CHECK_VERIFICATION,
            },
          ],
          [
            {
              text: "Learn how to complete KYC",
              url: "https://copperx.io/blog/how-to-complete-your-kyc-and-kyb-at-copperx-payout",
            },
          ],
          [{ text: "Complete KYC now", url: "https://copperx.io" }],
        ],
      }
    );
  }
}
```

## Related Files

- `src/bot/messages/start.messages.ts` - Contains welcome message templates
- `src/constants/callback.enum.ts` - Defines callback data for inline buttons
- `src/bot/utils/kyc-verification.ts` - Utility for checking KYC status

## Session Management

The `/start` command doesn't specifically update the user's session state, as it's primarily an informational command. However, it does read the current session to check authentication and KYC status.

## Best Practices

- Always make the welcome message informative and user-friendly
- Provide clear next steps for users based on their current status
- Use buttons to guide users to the most common actions
- Keep welcome messages concise yet comprehensive
