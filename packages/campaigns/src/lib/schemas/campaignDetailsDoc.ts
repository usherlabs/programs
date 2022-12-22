import { z } from "zod";

// TODO: Review zod schema for Campaign Details
export const campaignDetailsDocSchema = z.object({
	destination_url: z.string().url(),
	name: z.string(),
	description: z.string().optional(),
	image: z.string().url().optional(),
	external_link: z.string().url().optional(),
});

export type CampaignDetailsDoc = z.infer<typeof campaignDetailsDocSchema>;

export const campaignDetailsDocTemplate = {
	name: "<string>",
	description: "<string>",
	destination_url: "<url>",
	external_link: "<url>",
	image: "<url>",
};

export const parseCampaignDetails = (str: string) => {
	const obj = JSON.parse(str);

	return campaignDetailsDocSchema.parse(obj);
};
