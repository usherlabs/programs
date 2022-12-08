import { CampaignReference } from "@usher.so/partnerships";
import { ApiOptions } from "@usher.so/shared";
import lodash from "lodash";
import { CampaignsApi } from "./api.js";
import { Campaign } from "./types.js";

// ? Required for compatibility with CommonJS modules
const { isEqual, uniqWith } = lodash;

export class Campaigns {

  private api: CampaignsApi;

  constructor(options?: ApiOptions) {
    this.api = new CampaignsApi(options);
  }

  public async getCampaigns(refs: CampaignReference[]): Promise<Campaign[]> {
    if (refs.length === 0) {
      return [];
    }

    const campaigns = await this.api
      .campaigns()
      .get(uniqWith(refs, isEqual));

    return campaigns.data;
  }
}