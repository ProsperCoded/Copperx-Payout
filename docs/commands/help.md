# /help Command

The `/help` command provides users with comprehensive information about all available commands and features in the CopperX Payout Bot.

## Command Overview

- **Purpose**: Display help information and guide users
- **Authentication Required**: No
- **KYC Required**: No
- **Implementation File**: `src/bot/handlers/help.handler.ts`

## Functionality

When a user sends the `/help` command, the bot:

1. Displays a comprehensive guide to all available commands
2. Provides detailed information about each command's purpose
3. Explains authentication and KYC requirements
4. Offers additional resources via inline buttons

## Response Example

```
📚 CopperX Payout Bot - Help Guide

Welcome to the CopperX Payout Bot! Here's a complete guide to all available commands:

🚀 Basic Commands

/start - Start the bot and see the welcome screen
  • New users will be prompted to log in
  • Existing users will see their verification status

/help - Show this help message with all commands and instructions

🔐 Authentication

/login - Log in to your CopperX account
  • Step 1: Enter your email address
  • Step 2: Enter the OTP sent to your email
  • Note: KYC verification is required for most features

/logout - Log out from your current session

💰 Wallet Management

/wallet - Manage your cryptocurrency wallet
  • View all your wallets across different networks
  • Check wallet balances
  • Set a default wallet for transactions
  • Generate deposit addresses
  • Create new wallets on supported networks

💸 Transfer & Payments

/transfer - Access all transfer-related features
  • View your transaction history
  • Send funds to others
  • Withdraw to external wallets
  • Set up batch transfers
  • Convert crypto to fiat (offramp)

/send - Quick command to send funds (shortcut)
  • Can send via email or wallet address
  • Supports multiple currencies
  • Requires purpose code for compliance

🔍 Additional Information

• Rate Limiting: For system stability, you're limited to 10 requests per minute
• KYC Verification: Most financial operations require KYC verification
• Security: Never share your OTP with anyone, including support

Need more help? Use the buttons below to visit our website, contact support, or review our terms of service.
```

Followed by buttons:

- 🌐 Visit Website
- 🤝 Support
- 📝 Terms & Conditions

## Implementation Details

The help command is implemented as follows:

```typescript
export async function handleHelpCommand(
  msgObj: TelegramMessage
): Promise<void> {
  const chatId = msgObj.chat.id;

  try {
    await TelegramService.sendMessage(chatId, helpMessage);

    await TelegramService.sendMessage(
      chatId,
      "You can also access these resources directly:",
      {
        inlineKeyboard: [
          [
            { text: "🌐 Visit Website", url: "https://copperx.io/" },
            { text: "🤝 Support", url: "https://copperx.io/contact" },
          ],
          [
            {
              text: "📝 Terms & Conditions",
              url: "https://copperx.io/terms-of-service",
            },
          ],
        ],
      }
    );
  } catch (error) {
    logger.error("Error sending help message", {
      error: error.message,
      chatId,
    });
  }
}
```

## Message Template

The help message is defined in `src/bot/messages/help.messages.ts`:

```typescript
export const helpMessage = `
📚 <b>CopperX Payout Bot - Help Guide</b>

Welcome to the CopperX Payout Bot! Here's a complete guide to all available commands:

<b>🚀 Basic Commands</b>

/start - Start the bot and see the welcome screen
  • New users will be prompted to log in
  • Existing users will see their verification status

/help - Show this help message with all commands and instructions

<b>🔐 Authentication</b>

/login - Log in to your CopperX account
  • Step 1: Enter your email address
  • Step 2: Enter the OTP sent to your email
  • Note: KYC verification is required for most features

/logout - Log out from your current session

<b>💰 Wallet Management</b>

/wallet - Manage your cryptocurrency wallet
  • View all your wallets across different networks
  • Check wallet balances
  • Set a default wallet for transactions
  • Generate deposit addresses
  • Create new wallets on supported networks

<b>💸 Transfer & Payments</b>

/transfer - Access all transfer-related features
  • View your transaction history
  • Send funds to others
  • Withdraw to external wallets
  • Set up batch transfers
  • Convert crypto to fiat (offramp)

/send - Quick command to send funds (shortcut)
  • Can send via email or wallet address
  • Supports multiple currencies
  • Requires purpose code for compliance

<b>🔍 Additional Information</b>

• <b>Rate Limiting:</b> For system stability, you're limited to 10 requests per minute
• <b>KYC Verification:</b> Most financial operations require KYC verification
• <b>Security:</b> Never share your OTP with anyone, including support

Need more help? Use the buttons below to visit our website, contact support, or review our terms of service.
`;
```

## Command and Callback Integration

The help command is registered in:

1. `commandOperations` in `src/bot/operations/command.operations.ts`:

   ```typescript
   [CommandsEnum.HELP]: handleHelpCommand,
   ```

2. `callbackOperations` in `src/bot/operations/callback.operations.ts`:
   ```typescript
   [CallbackEnum.HELP]: handleHelpCommand,
   ```

## Best Practices for Help Content

The help system follows these best practices:

1. **Organization**: Content is organized by categories (Basic Commands, Authentication, etc.)
2. **Formatting**: Uses Telegram HTML formatting with bold text and bullet points
3. **Completeness**: Covers all commands and major features
4. **Conciseness**: Provides enough detail to be useful without being overwhelming
5. **Resources**: Includes links to additional resources
6. **Accessibility**: Available to all users (not requiring authentication)
7. **Maintenance**: Kept up-to-date with all commands

## Related Files

- `src/bot/messages/help.messages.ts` - Contains the help message template
- `src/constants/bot-commands.ts` - Defines all available commands
- `src/bot/operations/command.operations.ts` - Maps commands to handlers
- `src/bot/operations/callback.operations.ts` - Maps callbacks to handlers

## Extension Points

The help system can be extended in these ways:

1. **Localization**: Adding language support for help messages
2. **Command-specific Help**: Adding support for `/help command` to get detailed help for a specific command
3. **Interactive Help**: Adding interactive tutorials for complex features
4. **Contextual Help**: Providing help based on the user's current state
