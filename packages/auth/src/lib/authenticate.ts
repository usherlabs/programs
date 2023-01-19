import { randomString } from "@stablelib/random";
import { Chains, Connections, Wallet } from "@usher.so/shared";
import Arweave from "arweave";
import { DID } from "dids";
import { ethers } from "ethers";
import { Base64 } from "js-base64";
import * as uint8arrays from "uint8arrays";

import { AuthOptions } from "./options.js";
import { WalletAuth } from "./walletAuth.js";

export class Authenticate {
	protected auths: WalletAuth[] = [];

	constructor(
		private arweave: Arweave, // ? Left here for compatibility for when MagicWallets are used again.
		private ethProvider: ethers.providers.Web3Provider,
		private authOptions?: AuthOptions
	) {}

	private add(auth: WalletAuth) {
		this.auths.push(auth);
	}

	private exists(o: DID | WalletAuth) {
		return !!this.auths.find(
			(auth) => auth.did.id === (o instanceof DID ? o.id : o.did.id)
		);
	}

	// Removes auths that are similar to the provided authentication -- but not the provided authentication
	private removeSimilar(auth: WalletAuth) {
		// First remove the existing similar authentication
		const existingSimilarAuthIndex = this.auths.findIndex(
			(a) =>
				a.wallet.connection === auth.wallet.connection &&
				a.wallet.chain === auth.wallet.chain &&
				a.wallet.address !== auth.wallet.address // -- but not the provided authentication
		);
		if (existingSimilarAuthIndex >= 0) {
			this.auths.splice(existingSimilarAuthIndex, 1);
		}
	}

	public getAuth(address: string) {
		const auth = this.auths.find((a) => a.address === address);
		if (auth) {
			return auth;
		}
		throw new Error(`No Auth found for wallet ${address}`);
	}

	public getWallets(): Wallet[] {
		return this.auths.map((auth) => {
			return auth.wallet;
		});
	}

	public getAll() {
		return this.auths;
	}

	/**
	 * A method to retrieve a verifiable token
	 * For use with Server communication
	 *
	 * @return  {string}  AuthToken
	 */
	public async getAuthToken() {
		const nonce = randomString(32);
		const parts = await Promise.all(
			this.auths.map(async (auth) => {
				const sig = await auth.did.createJWS(nonce, { did: auth.did.id });
				return [auth.did.id, sig, [auth.wallet.chain, auth.wallet.address]];
			})
		);
		const s = JSON.stringify(parts);
		const token = Base64.encode(s);

		return token;
	}

	/**
	 * Deterministically produce a secret for DID production
	 */
	public async withArweave(
		address: string,
		connection: Connections,
		provider:
			| typeof window.arweaveWallet
			| {
					signature: (
						data: Uint8Array,
						algorithm: RsaPssParams
					) => Promise<Uint8Array>;
			  }
	): Promise<WalletAuth> {
		const auth = new WalletAuth(
			{
				address,
				chain: Chains.ARWEAVE,
				connection,
			},
			this.authOptions
		);

		const sig = await provider.signature(uint8arrays.fromString(auth.id), {
			name: "RSA-PSS",
			saltLength: 0, // This ensures that no additional salt is produced and added to the message signed.
		});
		await auth.connect(sig);
		const { did } = auth;

		// If wallet DID does not exist, push and activate it
		if (!this.exists(did)) {
			this.add(auth);
		}

		// Called after the wallets are indexed together.
		this.removeSimilar(auth);

		return auth;
	}

	/**
	 * Deterministically produce a secret for DID production
	 */
	public async withEthereum(
		address: string,
		connection: Connections
	): Promise<WalletAuth> {
		const auth = new WalletAuth(
			{
				address,
				chain: Chains.ETHEREUM,
				connection,
			},
			this.authOptions
		);

		let prevWalletData = "[]";
		if (typeof window !== "undefined") {
			const item = window.localStorage.getItem("connectedWallets");
			if (item) {
				prevWalletData = item;
			}
		}
		const previouslyConnectedWallets = JSON.parse(prevWalletData) as (Wallet & {
			signature: string;
		})[];

		const [connectedWallet] = previouslyConnectedWallets.filter(
			(wallet) => wallet.connection === connection
		);
		const sig = uint8arrays.fromString(connectedWallet.signature);

		await auth.connect(sig);
		const { did } = auth;

		// If wallet DID does not exist, push and activate it
		if (!this.exists(did)) {
			this.add(auth);
		}

		// Called after the wallets are indexed together.
		this.removeSimilar(auth);

		return auth;
	}

	/**
	 * Authenticate with Magic -- assumes that user is authenticated
	 *
	 * Create a DID for Magic Eth wallet.
	 * If no existing Magic wallet exists, create a JWK wallet and encrypt with Eth Signer
	 * Push the encrypted JWK wallet to Ceramic under a "MagicWallets" stream
	 */
	public async withMagic(): Promise<WalletAuth> {
		const signer = this.ethProvider.getSigner();
		const address = await signer.getAddress();
		const ethAuth = new WalletAuth(
			{
				address,
				chain: Chains.ETHEREUM,
				connection: Connections.MAGIC,
			},
			this.authOptions
		);

		const sig = await signer.signMessage(ethAuth.id);
		await ethAuth.connect(uint8arrays.fromString(sig));

		// If wallet DID does not exist, push and activate it
		if (!this.exists(ethAuth.did)) {
			this.add(ethAuth);
		}

		// Called after the wallets are indexed together.
		this.removeSimilar(ethAuth);

		return ethAuth;
	}
}
