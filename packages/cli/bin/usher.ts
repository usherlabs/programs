#!/usr/bin/env node

import { program } from "commander";
import { advertiserCommand } from "../src/cmd/advertiser.js";
import { campaignDetailsCommand } from "../src/cmd/campaign-details.js";
import { campaignCommand } from "../src/cmd/campaign.js";
import { handleError } from "../src/utils/error.js";

process.on("uncaughtException", handleError);

program.addCommand(advertiserCommand);
program.addCommand(campaignDetailsCommand);
program.addCommand(campaignCommand);

program.parse(process.argv);
