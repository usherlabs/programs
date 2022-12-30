import { Campaigns, parseCampaignDoc } from "@usher.so/campaigns";
import { ApiOptions } from "@usher.so/shared";
import { Command, Option } from "commander";
import { getContentByOptions } from "../../utils/content.js";
import { readWallet } from "../../utils/wallet.js";

// TODO: Review the ordger of the options
export const createCommand = new Command()
	.name("create")
	.description("Create a new Campaign on Arweave")
	.option("--usher <string>", "Usher API URL", ApiOptions.default.usherUrl)
	.requiredOption(
		"--wallet <string>",
		"Private Key, or path to Private Key file"
	)
	.requiredOption(
		"--currency <string>",
		"'arweave' (DEFAULT) | 'ethereum' | 'matic' | 'bnb' | 'fantom' | 'solana' | 'avalanche' | 'boba-eth' | 'boba' | 'near' | 'algorand' | 'aptos'",
		"arweave"
	)
	.addOption(
		new Option(
			"--file <string>",
			"Path to Campaign file in a JSON format"
		).conflicts("content")
	)
	.addOption(
		new Option(
			"--content <string>",
			"Campaign content in a JSON format"
		).conflicts("file")
	)
	.requiredOption("--advertiser <string>", "Advertiser StreamId on Ceramic")
	.requiredOption("--details <string>", "Campaign Details StreamId on Ceramic")
	.action(async (options) => {
		const {
			wallet: walletData,
			currency,
			usher: usherUrl,
			advertiser,
			details,
		} = options;
		const content = getContentByOptions(options);

		const campaignJson = JSON.stringify({
			...JSON.parse(content),
			advertiser,
			details,
		});

		const campaign = await parseCampaignDoc(campaignJson);

		const campaignsProvider = new Campaigns({ usherUrl });
		const privateKey = await readWallet(walletData);

		console.log("Uploading campaign to Arweave...");
		const transactionId = await campaignsProvider.createCampaign(
			campaign,
			privateKey,
			{
				currency,
			}
		);
		console.log(`Indexing campaign with origin ${transactionId} on Usher...`);
		const response = await campaignsProvider.indexCampaign(transactionId);

		console.log("Indexed successfully!");
		console.log(JSON.stringify(response.campaign, null, 2));
	});
