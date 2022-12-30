import Bundlr from "@bundlr-network/client";
import { CeramicClient } from "@ceramicnetwork/http-client";
import { TileDocument } from "@ceramicnetwork/stream-tile";
import {
	AdvertiserDoc,
	CampaignDetailsDoc,
	CampaignDoc,
} from "@usher.so/campaigns";
import { CampaignReference } from "@usher.so/partnerships";
import { ApiOptions } from "@usher.so/shared";
import BigNumber from "bignumber.js";
import { DID } from "dids";
import isEqual from "lodash/isEqual.js";
import uniqWith from "lodash/uniqWith.js";
import snakecaseKeys from "snakecase-keys";
import { CampaignsApi } from "./api.js";
import { Campaign } from "./types.js";

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

		return await TileDocument.create(
			ceramic,
			snakecaseKeys(advertiser, { deep: true })
		);
	}

	public async createCampaignDetails(
		campaignDetails: CampaignDetailsDoc,
		did: DID
	) {
		const ceramic = new CeramicClient(this.options.ceramicUrl);
		ceramic.did = did;

		return await TileDocument.create(
			ceramic,
			snakecaseKeys(campaignDetails, { deep: true })
		);
	}

	//? https://docs.bundlr.network/docs/sdk/Basic%20Features/connecting-node
	public async createCampaign(
		campaign: CampaignDoc,
		privateKey: string,
		options?: { bundlrUrl?: string; currency?: string }
	) {
		const bundlrUrl = options?.bundlrUrl || "https://devnet.bundlr.network";
		const currency = options?.currency || "arweave";
		const data = JSON.stringify(snakecaseKeys(campaign, { deep: true }));
		if (currency === "arweave") {
			privateKey = JSON.parse(privateKey);
		}
		// @ts-ignore
		const bundlr = new Bundlr.default(bundlrUrl, currency, privateKey);
		await bundlr.ready();
		const bytes = Buffer.byteLength(data, "utf-8");
		const balance = (await bundlr.getLoadedBalance()) as BigNumber;
		const price = (await bundlr.getPrice(bytes)) as BigNumber;
		const fundAmount = price.minus(balance);
		console.log(price.toNumber(), balance.toNumber(), fundAmount.toNumber());
		if (fundAmount.gt(new BigNumber(0))) {
			throw new Error(
				`You must fund Bundlr with ${fundAmount} in ${currency} currency. For more information, see https://docs.bundlr.network/docs/client/cli#fund-a-bundlr-node`
			);
		}
		const response = await bundlr.upload(data, {
			tags: [{ name: "Content-Type", value: "application/json" }],
		});

		return response.id;
	}

	public async indexCampaign(transactionId: string) {
		return await this.api.campaigns().index(transactionId);
	}
}
