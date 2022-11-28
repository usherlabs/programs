import ky from "ky";
import { CampaignReference, Partnership } from "./types";

// TODO: Use corresponding USHER_API_URL for production, staging and development
const USHER_API_URL = "http://localhost:3000/api";

export const request = ky.create({
  prefixUrl: USHER_API_URL
});

export const getAuthRequest = (authToken: string) =>
  request.extend({
    headers: {
      Authorization: `Bearer ${authToken}`
    }
  });

// Boilerplate to fetch partnershiops related to authenticated DID
export const relatedPartnerships = (authToken: string) => {
  const req = getAuthRequest(authToken);

  return {
    async get() {
      const resp = await req.get(`partnerships/related`).json();
      return resp as { success: boolean; data: Partnership[] };
    },
    async post(
      partnership: string,
      campaignRef: CampaignReference
    ): Promise<{ success: boolean }> {
      return req
        .post(`partnerships/related`, {
          json: {
            partnership,
            campaignRef
          }
        })
        .json();
    }
  };
};
