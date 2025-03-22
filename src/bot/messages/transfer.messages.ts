import { Transfer } from "../../types/transfers.types";

export const transferOptionsMessage = `
💸 <b>Transfer Operations</b>

Choose an operation:
`;

export const transferListHeaderMessage = (page: number, totalPages: number) => `
📋 <b>Your Transfers</b> (Page ${page}/${totalPages || 1})

Select a transfer to view details:
`;

export const transferEmptyListMessage = `
No transfers found. Use the /send command to make your first transfer.
`;

export const transferDetailsMessage = (transfer: Transfer) => `
🧾 <b>Transfer Details</b>

<b>ID:</b> ${transfer.id}
<b>Status:</b> ${transfer.status}
<b>Amount:</b> ${transfer.amount} ${transfer.currency}
<b>Fee:</b> ${transfer.totalFee} ${transfer.feeCurrency}
<b>Date:</b> ${new Date(transfer.createdAt).toLocaleString()}
<b>Type:</b> ${transfer.type}
${
  transfer.destinationAccount?.walletAddress
    ? `<b>Destination:</b> ${
        transfer.destinationAccount.walletAddress.slice(0, 8) +
        "..." +
        transfer.destinationAccount.walletAddress.slice(-8)
      }`
    : ""
}
${
  transfer.status === "success"
    ? `<b>Transaction Hash:</b> ${
        transfer.transactions?.[0]?.transactionHash || "N/A"
      }`
    : ""
}
`;

export const sendTransferHeaderMessage = `
💸 <b>Send Funds</b>

How would you like to send funds?
`;

export const sendByEmailMessage = `
📧 <b>Send by Email</b>

Please enter the recipient's email address:
`;

export const sendByWalletMessage = `
🔑 <b>Send by Wallet Address</b>

Please enter the recipient's wallet address:
`;

export const sendAmountMessage = (recipient: string) => `
💰 <b>Enter Amount</b>

Please enter the amount you want to send to ${recipient}:
`;

export const sendCurrencyMessage = `
💱 <b>Select Currency</b>

Please select the currency:
`;

export const sendPurposeMessage = `
🏷️ <b>Transfer Purpose</b>

Please select a purpose for this transfer:
`;

export const sendConfirmationMessage = (
  recipient: string,
  amount: string,
  currency: string,
  purpose: string
) => `
✅ <b>Confirm Transfer</b>

You are about to send:
<b>Amount:</b> ${amount} ${currency}
<b>To:</b> ${recipient}
<b>Purpose:</b> ${purpose}

Do you want to proceed?
`;

export const sendSuccessMessage = (
  amount: string,
  currency: string,
  recipient: string
) => `
✅ <b>Transfer Successful!</b>

You have sent ${amount} ${currency} to ${recipient}.
`;

export const sendErrorMessage = `
❌ <b>Transfer Failed</b>

Sorry, we couldn't process your transfer. 
Ensure you have enough balance in your default wallet.
Please try again later or contact support.
`;

export const withdrawHeaderMessage = `
🏧 <b>Withdraw to Wallet</b>

Please enter the wallet address you want to withdraw to:
`;

export const batchTransferHeaderMessage = `
📦 <b>Batch Transfer</b>

This feature allows you to send funds to multiple recipients at once.
To use this feature, please prepare a CSV file with the following format:

email/wallet,amount,currency,purpose

Example:
user@example.com,100,USDT,PAYMENT
0x1234...5678,50,USDT,GIFT

Please upload your CSV file to continue.
`;

export const offrampTransferHeaderMessage = `
🏦 <b>Offramp Transfer</b>

This feature allows you to convert crypto to fiat and withdraw it to a bank account.

Let's set up your offramp transfer step by step:
`;

export const authRequiredMessage = `
⚠️ You need to be logged in to access transfer features.

Please use /login to authenticate first.
`;

export const errorFetchingTransfersMessage = `
😕 Sorry, we encountered an error fetching your transfers. Please try again later.
`;
