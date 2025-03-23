# /logout Command

The `/logout` command allows users to securely end their current session and disconnect from their CopperX account.

## Command Overview

- **Purpose**: Log out from the CopperX account
- **Authentication Required**: Yes (but handled gracefully if not authenticated)
- **KYC Required**: No
- **Implementation File**: `src/bot/handlers/logout.handler.ts`

## Functionality

When a user sends the `/logout` command, the bot:

1. Checks if the user is currently authenticated
2. If authenticated, terminates the session and removes authentication tokens
3. Unsubscribes the user from real-time notifications
4. Confirms the logout to the user
5. If not authenticated, informs the user they're not currently logged in

## Response Examples

### Successful Logout

```
You have been logged out successfully.
```

### Not Logged In

```
You're not currently logged in.
```

## Implementation Details

The logout handler is implemented as follows:

```typescript
export async function handleLogout(msgObj: TelegramMessage) {
  const chatId = msgObj.chat.id;

  if (!(await authService.isAuthenticated(chatId))) {
    await TelegramService.sendMessage(
      chatId,
      "You're not currently logged in."
    );
    return;
  }

  await authService.logout(chatId);

  await TelegramService.sendMessage(
    chatId,
    "You have been logged out successfully."
  );
}
```

## Auth Service Logout Method

The logout functionality relies on the `logout` method in the AuthService:

```typescript
async logout(chatId: number): Promise<void> {
  const session = await this.sessionService.getSession(chatId);

  // Unsubscribe from notifications if organization ID exists
  if (session.organizationId) {
    this.notificationService.unsubscribe(session.organizationId);
  }

  await this.sessionService.updateSession(chatId, {
    state: UserState.IDLE,
    kycVerified: false,
    organizationId: undefined,
    authData: undefined,
  });
}
```

## Session Management

The logout process updates the user session to:

1. Set the state to `UserState.IDLE`
2. Clear the KYC verification flag
3. Remove the organization ID
4. Remove all authentication data (tokens, expiry, etc.)

## Notification Management

The logout process also unsubscribes the user from real-time notifications:

```typescript
// In the NotificationService
public unsubscribe(organizationId: string): void {
  try {
    if (this.pusherClient && this.channelSubscriptions[organizationId]) {
      this.pusherClient.unsubscribe(`private-org-${organizationId}`);
      delete this.channelSubscriptions[organizationId];
      this.logger.info(
        `Unsubscribed from channel for organization ${organizationId}`
      );
    }
  } catch (error) {
    this.logger.error(
      `Error unsubscribing from organization ${organizationId}:`,
      error
    );
  }
}
```

## Security Considerations

- All authentication tokens are removed from the session
- Pusher subscription is terminated to prevent further real-time updates
- Redis session is updated but not deleted to maintain user preferences
- No personal data is retained in the session after logout

## Related Files

- `src/services/auth.service.ts` - Contains the logout method
- `src/services/notification.service.ts` - Contains the unsubscribe method
- `src/utils/session/session.service.ts` - Manages the user session
- `src/types/session.types.ts` - Defines the session structure and states

## Best Practices

- The logout command is always available, regardless of authentication state
- It provides clear feedback about the current status
- It cleans up all resources (tokens, subscriptions) to prevent lingering connections
- It handles errors gracefully to ensure the user is always logged out, even if some cleanup steps fail
