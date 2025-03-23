# Verification Callbacks

This document details the callback operations related to KYC (Know Your Customer) verification in the CopperX Payout Bot.

## Verification Callback Overview

Verification callbacks allow users to check their KYC verification status and take actions to complete verification if needed. KYC verification is required for most financial operations in the bot, and these callbacks provide a seamless way for users to manage their verification status.

## Available Verification Callbacks

| Callback             | Description             | Parameters | Authentication | KYC |
| -------------------- | ----------------------- | ---------- | -------------- | --- |
| `check_verification` | Check KYC status        | None       | Required       | No  |
| `start_verification` | Start KYC process       | None       | Required       | No  |
| `verification_guide` | Show verification guide | None       | No             | No  |

## Check Verification Callback

**Purpose**: Allow users to check their current KYC verification status.

**Implementation**:

```typescript
export async function handleCheckVerificationCallback(msgObj: TelegramMessage) {
  const chatId = msgObj.chat.id;

  // Check if user is authenticated
  if (!(await authService.isAuthenticated(chatId))) {
    await TelegramService.sendMessage(chatId, authRequiredMessage);
    return;
  }

  try {
    // Get the current session
    const session = await sessionService.getSession(chatId);
    const firstName = session.email ? session.email.split("@")[0] : "there";

    // Check KYC status with CopperX API
    const kycStatus = await authService.checkKycStatus(chatId);

    if (!kycStatus) {
      await TelegramService.sendMessage(
        chatId,
        "Unable to retrieve your verification status. Please try again later.",
        {
          inlineKeyboard: [
            [
              {
                text: "Try Again",
                callback_data: CallbackEnum.CHECK_VERIFICATION,
              },
            ],
          ],
        }
      );
      return;
    }

    // Update KYC status in session
    const kycVerified = kycStatus.status === "approved";
    await sessionService.updateSession(chatId, {
      kycVerified,
    });

    // Generate response based on KYC status
    let message = "";
    let inlineKeyboard: InlineKeyboardButton[][] = [];

    switch (kycStatus.status) {
      case "approved":
        message = `✅ Good news, ${firstName}! Your KYC verification is complete.\n\nYou have full access to all features of the CopperX Payout bot.`;
        inlineKeyboard = [
          [
            {
              text: "Check Wallet",
              callback_data: CallbackEnum.WALLET_BACK,
            },
          ],
        ];
        break;

      case "pending":
        message = `⏳ Hello ${firstName}, your KYC verification is in progress.\n\nWe're currently reviewing your submitted documents. This typically takes 1-2 business days.`;
        inlineKeyboard = [
          [
            {
              text: "Check Again",
              callback_data: CallbackEnum.CHECK_VERIFICATION,
            },
          ],
        ];
        break;

      case "rejected":
        message = `❌ Hello ${firstName}, your KYC verification was not approved.\n\nReason: ${
          kycStatus.reasonMessage || "No specific reason provided."
        }\n\nPlease resubmit your verification with the corrections noted above.`;
        inlineKeyboard = [
          [
            {
              text: "Resubmit Verification",
              url: "https://copperx.io/verify",
            },
          ],
        ];
        break;

      default:
        message = `Hello ${firstName}, you have not completed KYC verification yet.\n\nTo access all features of CopperX Payout, please complete the verification process.`;
        inlineKeyboard = [
          [
            {
              text: "Complete Verification",
              url: "https://copperx.io/verify",
            },
          ],
          [
            {
              text: "Verification Guide",
              callback_data: CallbackEnum.VERIFICATION_GUIDE,
            },
          ],
        ];
    }

    // Send the response
    await TelegramService.sendMessage(chatId, message, { inlineKeyboard });
  } catch (error) {
    logger.error("Error checking verification status", {
      error: error.message,
      chatId,
    });
    await TelegramService.sendMessage(
      chatId,
      "An error occurred while checking your verification status. Please try again later."
    );
  }
}
```

**Response Examples**:

For approved verification:

```
✅ Good news, username! Your KYC verification is complete.

You have full access to all features of the CopperX Payout bot.
```

For pending verification:

```
⏳ Hello username, your KYC verification is in progress.

We're currently reviewing your submitted documents. This typically takes 1-2 business days.
```

For rejected verification:

```
❌ Hello username, your KYC verification was not approved.

Reason: The provided document was unclear. Please ensure images are well-lit and all text is readable.

Please resubmit your verification with the corrections noted above.
```

For not started verification:

```
Hello username, you have not completed KYC verification yet.

To access all features of CopperX Payout, please complete the verification process.
```

## Verification Guide Callback

**Purpose**: Provide users with guidance on how to complete KYC verification successfully.

**Implementation**:

```typescript
export async function handleVerificationGuideCallback(msgObj: TelegramMessage) {
  const chatId = msgObj.chat.id;

  try {
    // Send verification guide message
    await TelegramService.sendMessage(chatId, verificationGuideMessage, {
      inlineKeyboard: [
        [
          {
            text: "Start Verification",
            url: "https://copperx.io/verify",
          },
        ],
        [
          {
            text: "Back",
            callback_data: CallbackEnum.CHECK_VERIFICATION,
          },
        ],
      ],
    });
  } catch (error) {
    logger.error("Error showing verification guide", {
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
📝 KYC Verification Guide

To complete your KYC verification, you'll need:

1. Valid government-issued ID (passport, driver's license, or national ID)
2. A selfie with your ID
3. Proof of address (utility bill or bank statement less than 3 months old)

Tips for a smooth verification:
• Ensure all documents are clear and readable
• All corners of documents should be visible
• Information should match your account details
• Face in selfie should be clearly visible
• Documents should be valid and not expired

The verification process typically takes 1-2 business days.
```

## KYC Verification Utility

The bot includes a utility function to check KYC verification status for various operations. This is used throughout the bot's commands to ensure users have completed KYC before accessing restricted features:

```typescript
export async function checkKycVerification(
  chatId: number,
  featureName: string
): Promise<boolean> {
  try {
    // Get session
    const session = await sessionService.getSession(chatId);

    // Skip check if already verified in session
    if (session.kycVerified) {
      return true;
    }

    // Check KYC status with API
    const kycStatus = await authService.checkKycStatus(chatId);
    const isVerified = kycStatus && kycStatus.status === "approved";

    // Update session
    await sessionService.updateSession(chatId, {
      kycVerified: isVerified,
    });

    // If verified, return true
    if (isVerified) {
      return true;
    }

    // Not verified, show message with options
    await TelegramService.sendMessage(
      chatId,
      `⚠️ KYC verification required for ${featureName}\n\nTo access this feature, you need to complete the KYC verification process.`,
      {
        inlineKeyboard: [
          [
            {
              text: "Check Verification Status",
              callback_data: CallbackEnum.CHECK_VERIFICATION,
            },
          ],
          [
            {
              text: "Start Verification",
              url: "https://copperx.io/verify",
            },
          ],
        ],
      }
    );

    return false;
  } catch (error) {
    logger.error("Error checking KYC verification", {
      error: error.message,
      chatId,
      featureName,
    });

    // Show error message
    await TelegramService.sendMessage(
      chatId,
      "An error occurred while checking your verification status. Please try again later."
    );

    return false;
  }
}
```

## Auth Service KYC Methods

The verification callbacks rely on the `AuthService` to interact with the CopperX API for KYC status:

```typescript
async checkKycStatus(chatId: number): Promise<KycStatus | null> {
  const accessToken = await this.getAccessToken(chatId);
  if (!accessToken) {
    return null;
  }

  try {
    this.copperxAuthApi.setAccessToken(accessToken);
    const kycStatus = await this.copperxAuthApi.getKycStatus();
    return kycStatus;
  } catch (error) {
    this.logger.error("Error checking KYC status", {
      error: error.message,
      chatId,
    });
    return null;
  }
}
```

## KYC Data Structures

The verification system uses these key data structures:

```typescript
// KYC status response
export interface KycStatus {
  status: "pending" | "approved" | "rejected" | "not_started";
  reasonMessage?: string;
  updatedAt?: string;
  id?: string;
}
```

## Related Files

- `src/bot/handlers/check-verification.handler.ts` - Contains verification callback handlers
- `src/bot/utils/kyc-verification.ts` - Utility function for KYC verification checks
- `src/services/auth.service.ts` - Service for authentication and KYC operations
- `src/utils/copperxApi/copperxApi.auth.ts` - API client for KYC status
- `src/types/kyc.types.ts` - KYC data type definitions
- `src/bot/messages/verification.messages.ts` - Verification message templates
