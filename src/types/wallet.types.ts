export type Wallet = {
  id: string;
  createdAt: string;
  updatedAt: string;
  organizationId: string;
  walletType: "web3_auth_copperx";
  network: string;
  walletAddress: string;
  isDefault: boolean;
};
export type WalletBalance = {
  decimals: number;
  balance: string;
  symbol: string;
  address: string;
};

export type WalletBalances = {
  walletId: string;
  isDefault: boolean;
  network: string;
  balances: WalletBalance[];
}[];
