# /login Command

The `/login` command allows users to authenticate with their CopperX account through a secure email OTP (One-Time Password) process.

## Command Overview

- **Purpose**: Authenticate users with their CopperX account
- **Authentication Required**: No
- **KYC Required**: No
- **Implementation File**: `src/bot/handlers/login.handler.ts`

## Authentication Flow

The login process follows these steps:

1. User sends `/login` command
2. Bot prompts user to enter their email address
3. User provides their email address
4. Bot requests an OTP from the CopperX API
5. CopperX sends an OTP to the user's email
6. Bot prompts user to enter the OTP
7. User provides the OTP
8. Bot verifies the OTP with the CopperX API
9. On success, the bot stores authentication tokens and checks KYC status

## Response Examples

### Initial Login Prompt

```
🔐 Login to your CopperX account to get started.
Enter your email and an OTP will be sent to your email:
email@example.com
```

### OTP Prompt

```
An OTP has been sent to your email. Please enter it to complete your login:
```

### Successful Login (KYC Verified)

```
✅ Login successful! Welcome, username!

You can now use the following commands:
• /wallet - Check your wallet balance
• /send - Send funds to another user
• /logout - Logout from your account
```

### Successful Login (KYC Not Verified)

```
✅ Login successful! Welcome, username!

⚠️ Your account KYC is not verified. Please complete your KYC verification to use all features.
```

With inline keyboard buttons:

- Learn how to complete KYC
- Complete KYC now

## Implementation Details

### Login Handler

The login handler initializes the email input process:

```typescript
export async function loginHandler(msgObj: TelegramMessage) {
  const chatId = msgObj.chat.id;
  await sessionService.updateSession(chatId, {
    state: UserState.AWAITING_LOGIN_EMAIL,
  });
  await TelegramService.sendMessage(chatId, loginMessage);
}
```

### Email Input Handler

When the user provides their email address:

```typescript
export async function handleEmailInput(msgObj: TelegramMessage) {
  const chatId = msgObj.chat.id;
  const email = msgObj.text?.trim();
  const session = await sessionService.getSession(chatId);

  // Check if user is already in OTP input state
  if (session.state === UserState.AWAITING_OTP) {
    await handleOtpInput(msgObj);
    return;
  }

  if (!email || !isValidEmail(email)) {
    await TelegramService.sendMessage(
      chatId,
      "Please enter a valid email address."
    );
    return;
  }

  // Initiate login process
  await authService.initiateLogin(chatId, email);
}
```

### OTP Verification

When the user provides the OTP:

```typescript
export async function handleOtpInput(msgObj: TelegramMessage) {
  const chatId = msgObj.chat.id;
  const otp = msgObj.text?.trim();

  if (!otp || !isValidOtp(otp)) {
    await TelegramService.sendMessage(
      chatId,
      "Please enter a valid OTP (usually a 6-digit number)."
    );
    return;
  }

  const user = await authService.verifyOtp(chatId, otp);

  if (user) {
    // Check KYC status and update session
    const kycStatus = await authService.checkKycStatus(chatId);
    const kycVerified = kycStatus && kycStatus.status === "approved";

    await sessionService.updateSession(chatId, {
      kycVerified,
    });

    // Send appropriate welcome message based on KYC status
    if (kycVerified) {
      // KYC verified message...
    } else {
      // KYC not verified message...
    }
  }
}
```

## Auth Service

The login handler relies on the `AuthService` to interact with the CopperX API:

```typescript
// Initiates the login process, requesting an OTP
async initiateLogin(chatId: number, email: string): Promise<boolean> {
  try {
    const { sid } = await this.copperxAuthApi.requestEmailOtp(email);
    await this.sessionService.updateSession(chatId, {
      email,
      state: UserState.AWAITING_OTP,
      authData: { sid },
    });
    await TelegramService.sendMessage(
      chatId,
      "An OTP has been sent to your email. Please enter it to complete your login:"
    );
    return true;
  } catch (error) {
    // Error handling...
  }
}

// Verifies the OTP and completes authentication
async verifyOtp(chatId: number, otp: string): Promise<UserProfile | null> {
  const session = await this.sessionService.getSession(chatId);
  if (!session.email || !session.authData?.sid) {
    // Handle invalid session...
    return null;
  }

  try {
    const authResult = await this.copperxAuthApi.authenticateWithEmailOtp(
      session.email,
      otp,
      session.authData.sid
    );

    // Store auth data in session
    await this.sessionService.updateSession(chatId, {
      state: UserState.AUTHENTICATED,
      userId: authResult.user.id,
      organizationId: authResult.user.organizationId,
      authData: {
        accessToken: authResult.accessToken,
        accessTokenId: authResult.accessTokenId,
        expireAt: authResult.expireAt,
      },
    });

    // Initialize notifications
    await this.notificationService.initializePusher(
      chatId,
      authResult.user.organizationId,
      authResult.accessToken
    );

    return authResult.user;
  } catch (error) {
    // Error handling...
    return null;
  }
}
```

## Session States

The login process uses the following session states:

- `UserState.AWAITING_LOGIN_EMAIL`: Waiting for the user to provide their email
- `UserState.AWAITING_OTP`: Waiting for the user to provide the OTP
- `UserState.AUTHENTICATED`: User has successfully authenticated

## Input Validation

The login handler includes validation for:

- Email format using a regular expression: `/^[^\s@]+@[^\s@]+\.[^\s@]+$/`
- OTP format using a regular expression: `/^\d{4,6}$/`

## Error Handling

The login process handles various error scenarios:

- Invalid email format
- Failed OTP request (e.g., email not registered)
- Invalid OTP
- Expired session
- API errors

## Related Files

- `src/bot/messages/start.messages.ts` - Contains login message templates
- `src/types/session.types.ts` - Defines session states and structure
- `src/utils/copperxApi/copperxApi.auth.ts` - API client for authentication
- `src/services/auth.service.ts` - Authentication service

## Security Considerations

- OTP is sent directly to the user's email, not through Telegram
- Session IDs (sid) are securely stored and used only for the current authentication flow
- Access tokens have an expiration time
- Rate limiting is applied to prevent brute force attacks
