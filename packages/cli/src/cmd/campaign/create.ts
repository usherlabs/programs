import { Campaigns, parseCampaignDoc } from "@usher.so/campaigns";
import { ApiOptions } from "@usher.so/shared";
import { Command, Option } from "commander";
import { readWallet } from "../../utils/arweave.js";
import { getContentByOptions } from "../../utils/content.js";

// TODO: Review the ordger of the options
export const createCommand = new Command()
	.name("create")
	.description("Creeate a new Campaign on Arweave")
	.option(
		"--arweave <string>",
		"Arweave API URL",
		ApiOptions.default.arweaveUrl
	)
	.option("--usher <string>", "Usher API URL", ApiOptions.default.usherUrl)
	.requiredOption("--wallet <string>", "Path to Arweave wallet")
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
			arweave: arweaveUrl,
			wallet: walletPath,
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

		const campaignsProvider = new Campaigns({ arweaveUrl, usherUrl });
		const jwk = await readWallet(walletPath);

		const response = await campaignsProvider.createCampaign(campaign, jwk);

		console.log(JSON.stringify(response.campaign, null, 2));
	});
