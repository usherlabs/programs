import { ApiOptions } from "@usher.so/shared";
import ky from "ky";
import { KyInstance } from "ky/distribution/types/ky";
import { CampaignReference, Partnership } from "./types";

export class Api {
  protected request: KyInstance;

  constructor(options?: ApiOptions) {
    const prefixUrl =
      options && options.url
        ? options.url
        : options && options.environment == "staging"
          ? "https://app.staging.usher.so/api"
          : "https://app.usher.so/api";

    this.request = ky.create({ prefixUrl });
  }

  protected getAuthRequest(authToken: string) {
    return this.request.extend({
      headers: {
        Authorization: `Bearer ${authToken}`
      }
    });
  }
}

export class PartnershipsApi extends Api {

  public relatedPartnerships = (authToken: string) => {
    const req = this.getAuthRequest(authToken);

    return {
      async get() {
        const resp = await req
          .get(`partnerships/related`)
          .json();
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
  }
}
