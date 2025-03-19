export type UserProfile = {
  id: string;
  firstName: string | null;
  lastName: string | null;
  email: string;
  profileImage: string | null;
  organizationId: string;
  role: "owner";
  status: "pending";
  type: "individual";
  relayerAddress: string;
  flags: string[];
  walletAddress: string;
  walletId: string;
  walletAccountType: string;
};
