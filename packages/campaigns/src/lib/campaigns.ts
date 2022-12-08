import { CampaignReference } from "@usher.so/partnerships";
import { ApiOptions } from "@usher.so/shared";
import { isEqual, uniqWith } from "lodash";
import { CampaignsApi } from "./api";
import { Campaign } from "./types";

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