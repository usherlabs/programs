import { CeramicClient } from "@ceramicnetwork/http-client";
import { TileDocument } from "@ceramicnetwork/stream-tile";
import {
	AdvertiserDoc,
	CampaignDetailsDoc,
	CampaignDoc,
} from "@usher.so/campaigns";
import { CampaignReference } from "@usher.so/partnerships";
import { ApiOptions } from "@usher.so/shared";
import Arweave from "arweave";
import { JWKInterface } from "arweave/node/lib/wallet.js";
import { DID } from "dids";
import lodash from "lodash";
import { CampaignsApi } from "./api.js";
import { Campaign } from "./types.js";
import { parseArweaveApiConfig } from "./utils.js";

// TODO: ? Required for compatibility with CommonJS modules
const { isEqual, uniqWith } = lodash;

export class Campaigns {
	private readonly options: ApiOptions;
	private readonly api: CampaignsApi;

	constructor(options?: Partial<ApiOptions>) {
		this.options = new ApiOptions(options);
		this.api = new CampaignsApi(this.options);
	}

	public async getCampaigns(refs: CampaignReference[]): Promise<Campaign[]> {
		if (refs.length === 0) {
			return [];
		}

		const response = await this.api.campaigns().get(uniqWith(refs, isEqual));
		return response.data;
	}

	// TODO: Consider moving to its own provider
	public async createAdvertiser(advertiser: AdvertiserDoc, did: DID) {
		const ceramic = new CeramicClient(this.options.ceramicUrl);
		ceramic.did = did;

		return await TileDocument.create(ceramic, advertiser);
	}

	public async createCampaignDetails(
		campaignDetails: CampaignDetailsDoc,
		did: DID
	) {
		const ceramic = new CeramicClient(this.options.ceramicUrl);
		ceramic.did = did;

		return await TileDocument.create(ceramic, campaignDetails);
	}

	public async createCampaign(campaign: CampaignDoc, jwk: JWKInterface) {
		const apiConfig = parseArweaveApiConfig(this.options.arweaveUrl);
		const arweave = Arweave.init(apiConfig);

		const transaction = await arweave.createTransaction(
			{
				data: JSON.stringify(campaign),
			},
			jwk
		);
		transaction.addTag("Content-Type", "application/json");

		await arweave.transactions.sign(transaction, jwk);

		// TODO: Check for success
		await arweave.transactions.post(transaction);
		return await this.api.campaigns().index(transaction.id);
	}
}
