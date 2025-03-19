import { CopperxApiBase } from "./copperxApi";
import { UserProfile } from "../../types/user.types";
export class CopperxApiAuthService extends CopperxApiBase {
  // Request an email OTP and return the session ID (sid)
  async requestEmailOtp(
    email: string
  ): Promise<{ email: string; sid: string }> {
    try {
      const response = await this.api.post("/api/auth/email-otp/request", {
        email,
      });
      this.logger.info("Requested email OTP", { email });
      return response.data;
    } catch (error) {
      this.logger.error("Error requesting email OTP", error.message);
      throw error;
    }
  }

  // Authenticate using email OTP and return the access token
  async authenticateWithEmailOtp(
    email: string,
    otp: string,
    sid: string
  ): Promise<{
    scheme: string;
    accessToken: string;
    accessTokenId: string;
    expireAt: string;
    user: UserProfile;
  }> {
    try {
      const response = await this.api.post("/api/auth/email-otp/authenticate", {
        email,
        otp,
        sid,
      });
      this.logger.info("Authenticated with email OTP", { email });
      return response.data; // Updated to return the full response data
    } catch (error) {
      this.logger.error("Error authenticating with email OTP", error.message);
      throw error;
    }
  }

  // Get user profile using access token
  async getUserProfile(accessToken: string) {
    try {
      const response = await this.api.get("/api/auth/me", {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      this.logger.info("Fetched user profile");
      return response.data;
    } catch (error) {
      this.logger.error("Error fetching user profile", error.message);
      throw error;
    }
  }
}
