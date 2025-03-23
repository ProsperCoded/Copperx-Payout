# Troubleshooting Guide

This guide provides solutions for common issues you might encounter when deploying, configuring, or using the CopperX Payout Bot.

## Webhook Issues

### Problem: Telegram Bot Not Responding to Commands

**Symptoms:**

- Bot doesn't respond to any commands
- No error messages in logs

**Possible Causes and Solutions:**

1. **Webhook Setup Issues**

   - Verify your `SERVER_URL` in `.env` points to a public HTTPS URL
   - Check that the URL is properly formed with no trailing slash
   - Run `npm run setup` to update the webhook with Telegram

   **Verification Steps:**

   ```bash
   # Check if webhook is set correctly
   curl -X GET "https://api.telegram.org/bot{YOUR_BOT_TOKEN}/getWebhookInfo"
   ```

2. **Server Not Accessible**

   - Ensure your server is publicly accessible
   - Verify that port 443 (or your configured port) is open
   - Check if your server uses a self-signed certificate (not accepted by Telegram)

3. **Firewall or Network Issues**

   - Check server firewall settings
   - If using a cloud provider, verify security group rules
   - Ensure outbound connections to Telegram API are allowed

4. **Process Not Running**

   - Verify that the bot process is running

   ```bash
   # Check running processes
   ps aux | grep node

   # If using PM2
   pm2 status
   ```

## Authentication Issues

### Problem: Login OTP Never Arrives

**Symptoms:**

- User attempts to log in but never receives OTP email
- Bot times out waiting for OTP

**Possible Causes and Solutions:**

1. **Email Configuration at CopperX**

   - Verify that the email service at CopperX is functioning correctly
   - Check if the email might be in the user's spam folder
   - Confirm that the user's email is registered with CopperX

2. **API Key Issues**

   - Ensure your `COPPERX_API_KEY` in `.env` is valid and correct
   - Check for any API usage limits or restrictions

3. **Network Connectivity to CopperX API**
   - Verify network connectivity to the CopperX API
   - Check for any firewalls blocking outbound connections to the API

### Problem: Authentication Succeeds But Features Don't Work

**Symptoms:**

- User can log in but cannot use wallet or transfer features
- Error messages about authentication required

**Possible Causes and Solutions:**

1. **Token Storage Issues**

   - Check Redis connection and verify tokens are being stored
   - Look for Redis connection errors in logs
   - Verify Redis database URL in `.env`

2. **Token Expiration**

   - Check if tokens are expired
   - Look for token refresh mechanisms in the code
   - Verify the `expireAt` timestamp stored in the session

3. **Missing KYC Verification**
   - User may have successfully authenticated but lacks KYC verification
   - Check logs for KYC status check failures
   - Verify KYC status with CopperX API

## Redis Issues

### Problem: Redis Connection Failures

**Symptoms:**

- Error messages about Redis connection
- Session data not persisting
- Rate limiting not functioning

**Possible Causes and Solutions:**

1. **Incorrect Connection String**

   - Verify `REDIS_DATABASE_URL` in `.env`
   - Test the connection string manually

   ```bash
   # For Redis CLI
   redis-cli -u "your-redis-url"

   # For upstash
   curl -X GET "your-redis-rest-url/get/test" \
     -H "Authorization: Bearer your-token"
   ```

2. **Redis Server Not Running**

   - If using local Redis, ensure it's running

   ```bash
   systemctl status redis
   ```

   - If using Upstash or another provider, check service status

3. **Network Connectivity**

   - Check for firewalls blocking Redis connections
   - Verify network access to Redis host

4. **Authentication Issues**
   - Ensure Redis password is correct in connection string
   - Verify Redis ACL settings if applicable

## Wallet and Transfer Issues

### Problem: Wallet Balance Not Showing

**Symptoms:**

- Wallet command executes but shows no balance
- Error messages about API failures

**Possible Causes and Solutions:**

1. **API Response Format Changed**

   - Check logs for API response parsing errors
   - Verify API response format against code expectations

2. **No Default Wallet**

   - User may not have a default wallet set
   - Check logs for errors related to default wallet
   - Guide the user to set a default wallet

3. **Authentication Token Issues**
   - Token may be expired or invalid
   - Check logs for authentication errors during API calls

### Problem: Transfers Fail

**Symptoms:**

- Transfer command executes but transfers don't complete
- Error messages about transfer failures

**Possible Causes and Solutions:**

1. **Insufficient Balance**

   - Verify user has sufficient balance for the transfer
   - Check for fees that might not be accounted for

2. **Recipient Not Found**

   - Verify recipient email or wallet address is valid
   - Check logs for errors related to recipient lookup

3. **API Errors**
   - Look for specific API error messages in logs
   - Check for rate limiting or throttling by CopperX API

## Rate Limiting Issues

### Problem: Too Many Rate Limit Errors

**Symptoms:**

- Users frequently see rate limit error messages
- Bot operations are being throttled

**Possible Causes and Solutions:**

1. **Rate Limit Too Restrictive**

   - Adjust rate limit parameters in `src/utils/rate-limit/rate-limit.service.ts`

   ```typescript
   private readonly maxRequests = 10; // Increase this value if needed
   private readonly windowSeconds = 60; // Adjust time window if needed
   ```

2. **Redis Issues Affecting Rate Limit Tracking**

   - Verify Redis connection for rate limit storage
   - Check for Redis errors in logs during rate limit checks

3. **High Bot Traffic**
   - Consider scaling the bot deployment if legitimate traffic is high
   - Analyze usage patterns to optimize rate limits

## Logging and Debugging

### Problem: Not Enough Diagnostic Information

**Symptoms:**

- Unclear why certain errors are occurring
- Difficulty tracing user journeys

**Solutions:**

1. **Increase Logging Level**

   - Modify logger configuration to include more detail
   - Add additional log points in problematic code areas

2. **Structured Logging**

   - Ensure logs include context like chatId, userId, etc.

   ```typescript
   logger.error("Error description", {
     error: error.message,
     chatId,
     userId,
     operation: "specific-operation",
   });
   ```

3. **Log Aggregation**
   - Set up log aggregation tools like Papertrail, Loggly, or ELK stack
   - Configure log rotation to prevent log files from growing too large

## Deployment Issues (Railway)

### Problem: Railway Deployment Fails

**Symptoms:**

- Deployment to Railway fails
- Application doesn't start after deployment

**Possible Causes and Solutions:**

1. **Build Errors**

   - Check Railway build logs for compilation errors
   - Verify that all dependencies are properly declared in package.json

2. **Environment Variables**

   - Ensure all required environment variables are set in Railway
   - Check for typos in environment variable names

3. **Port Configuration**

   - Verify that the port used by the application matches Railway's expectations
   - Railway typically uses `PORT` env var, ensure your app respects it:

   ```typescript
   app.set("port", process.env.PORT || 3000);
   ```

4. **Memory Issues**

   - Check if application is running out of memory
   - Consider optimizing memory usage or upgrading service plan

5. **Startup Command**
   - Verify the startup command in `railway.json` is correct
   ```json
   "startCommand": "npm run start"
   ```

## General Troubleshooting Approach

1. **Check Logs**

   - Always start by checking logs in `/logs` directory
   - Look for specific error messages and timestamps

2. **Verify Configuration**

   - Double-check `.env` file for correct API keys, URLs, and tokens
   - Ensure all required environment variables are set

3. **Test API Connectivity**

   - Use tools like Postman or curl to test API endpoints directly
   - Verify that the CopperX API is accessible from your server

4. **Restart Services**

   - Sometimes simply restarting the bot resolves issues
   - If using PM2: `pm2 restart <process-id>`
   - If using systemd: `systemctl restart copperx-bot.service`

5. **Update Dependencies**

   - Keep dependencies up-to-date to avoid compatibility issues
   - Run `npm audit fix` to address security vulnerabilities

6. **Check System Resources**

   - Monitor CPU, memory, and disk usage
   - Ensure system has adequate resources for the bot

7. **Implement Health Checks**
   - Add a health check endpoint to your Express app
   - Monitor the bot's health regularly
