export const walletListHeaderMessage = `
🏦 <b>Your CopperX Wallets</b>

Select a wallet to view its details:
`;

export const walletDetailMessage = (
  network: string,
  walletId: string,
  address: string,
  balance: string,
  isDefault: boolean
) => `
💼 <b>Wallet Details</b>

<b>Network:</b> ${network}
<b>Wallet ID:</b> ${walletId}
<b>Address:</b> <code>${address}</code>
<b>Balance:</b> ${balance}
${isDefault ? "✅ <b>Default Wallet</b>" : ""}

What would you like to do with this wallet?
`;

export const walletBalancesMessage = (
  balances: Array<{ network: string; balance: string; address: string }>
) => `
💰 <b>Your Wallet Balances</b>

${balances
  .map(
    (b) => `
<b>Network:</b> ${b.network}
<b>Balance:</b> ${b.balance}
<b>Address:</b> <code>${b.address}</code>
`
  )
  .join("\n")}
`;

export const depositInstructionsMessage = (
  network: string,
  address: string
) => `
📥 <b>Deposit to your ${network} wallet</b>

Send funds to this address:
<code>${address}</code>

<i>Only send ${network} network tokens to this address. Sending other tokens may result in permanent loss.</i>
`;

export const noWalletsMessage = `
You don't have any wallets yet. Would you like to create one?
`;

export const walletSetAsDefaultMessage = (network: string) => `
✅ Your ${network} wallet has been set as the default wallet.
`;

export const authRequiredMessage = `
⚠️ You need to be logged in to access wallet features.

Please use /login to authenticate first.
`;

export const errorFetchingWalletsMessage = `
😕 Sorry, we encountered an error fetching your wallets. Please try again later.
`;
