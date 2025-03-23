export const rateLimitExceededMessage = (remainingSeconds: number): string => `
⚠️ <b>Rate limit exceeded</b>

You've made too many requests in a short period. 
Please wait for <b>${remainingSeconds}</b> seconds before trying again.

This limit helps ensure the service remains stable for all users.
`;
