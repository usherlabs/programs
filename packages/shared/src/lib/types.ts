export enum Chains {
	ARWEAVE = "arweave",
	ETHEREUM = "ethereum"
	// POLYGON = "polygon"
}

export enum Connections {
	ARCONNECT = "ar_connect",
	COINBASEWALLET = "coinbase_wallet",
	MAGIC = "magic",
	METAMASK = "meta_mask",
	WALLETCONNECT = "wallet_connect"
}

// TODO: Probably move to @usher.so/auth library
export type Wallet = {
	chain: Chains;
	connection: Connections;
	address: string;
};
