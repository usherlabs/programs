import { JWKInterface } from "arweave/node/lib/wallet";
import { promises as fs } from "fs";

export const readWallet = async (path: string) => {
	const walletFileData = await fs.readFile(path, {
		encoding: "utf8",
		flag: "r",
	});

	return JSON.parse(walletFileData) as JWKInterface;
};
