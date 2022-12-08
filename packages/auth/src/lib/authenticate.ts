import { randomString } from "@stablelib/random";
import { Chains, Connections, Wallet } from "@usher.so/shared";
import Arweave from "arweave";
import { JWKInterface } from "arweave/node/lib/wallet";
import { DID } from "dids";
import { ethers } from "ethers";
import { Base64 } from "js-base64";
import * as uint8arrays from "uint8arrays";

import { AuthOptions } from "./options.js";
import { WalletAuth } from "./walletAuth.js";

export class Authenticate {
	protected auths: WalletAuth[] = [];

	constructor(
		private arweave: Arweave,
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

		const previouslyConnectedWallets = JSON.parse(
			window.localStorage.getItem("connectedWallets") || "[]"
		) as (Wallet & { signature: string })[];

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
	public async withMagic(): Promise<WalletAuth[]> {
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
		const { did } = ethAuth;

		// If wallet DID does not exist, push and activate it
		if (!this.exists(ethAuth.did)) {
			this.add(ethAuth);
		}

		// Called after the wallets are indexed together.
		this.removeSimilar(ethAuth);

		// Check if Arweave wallet exists for the DID
		// For reference, see https://developers.ceramic.network/tools/glaze/example/#5-runtime-usage
		const magicWallets = await ethAuth.getMagicWallets();
		let arweaveKey = {};
		let arweaveAddress = "";
		if (!(magicWallets || {}).arweave) {
			// Create Arweave Jwk
			const key = await this.arweave.wallets.generate();
			const arAddress = await this.arweave.wallets.jwkToAddress(key);
			// Encrypt the wallet.
			const buf = uint8arrays.fromString(JSON.stringify(key));
			const jwe = await did.createJWE(buf, [did.id]);
			const encData = Arweave.utils.stringToB64Url(JSON.stringify(jwe));
			ethAuth.addMagicWallet({
				arweave: {
					address: arAddress,
					data: encData,
				},
			});
			arweaveKey = key;
			arweaveAddress = arAddress;
		} else {
			const { data } = magicWallets.arweave;
			const jwk = await this.processMagicArweaveJwk(ethAuth.did, data);
			arweaveAddress = await this.arweave.wallets.jwkToAddress(jwk);
			arweaveKey = jwk;
		}

		// withAreave includes the loadOwnerForAuth method already
		const arAuth = await this.withArweave(
			arweaveAddress,
			Connections.MAGIC,
			Authenticate.nativeArweaveProvider(arweaveKey)
		);

		return [ethAuth, arAuth];
	}

	/**
	 * Get JWK associated to Magic Wallet
	 *
	 * @return  {JWKInterface}
	 */
	public async getMagicArweaveJwk() {
		const ethAuth = this.auths.find(
			(a) =>
				a.wallet.connection === Connections.MAGIC &&
				a.wallet.chain === Chains.ETHEREUM
		);
		if (!ethAuth) {
			throw new Error("Genisis Magic Wallet not Connected");
		}
		const magicWallets = await ethAuth.getMagicWallets();
		if (!(magicWallets || {}).arweave) {
			throw new Error("Magic Arweave Wallet not Connected");
		}
		const { data } = magicWallets.arweave;
		const jwk = await this.processMagicArweaveJwk(ethAuth.did, data);
		return jwk;
	}

	private async processMagicArweaveJwk(
		genisisDid: DID,
		data: string
	): Promise<JWKInterface> {
		const str = Arweave.utils.b64UrlToString(data);
		const enc = JSON.parse(str);
		const dec = await genisisDid.decryptJWE(enc);
		const keyStr = uint8arrays.toString(dec);
		const jwk = JSON.parse(keyStr);
		return jwk as JWKInterface;
	}

	private static nativeArweaveProvider(jwk: Object) {
		return {
			// We're reimplementing the signature mechanism to allow for 0 salt length -- as the ArweaveJS forces 32
			async signature(data: Uint8Array, algorithm: RsaPssParams) {
				// For reference, see https://github.com/ArweaveTeam/arweave-js/blob/master/src/common/lib/crypto/webcrypto-driver.ts#L110
				const k = await crypto.subtle.importKey(
					"jwk",
					jwk,
					{
						name: "RSA-PSS",
						hash: {
							name: "SHA-256",
						},
					},
					false,
					["sign"]
				);
				// For reference, see: https://github.com/ArweaveTeam/arweave-js/blob/master/src/common/lib/crypto/webcrypto-driver.ts#L48
				const sig = await crypto.subtle.sign(algorithm, k, data);
				return new Uint8Array(sig);
			},
		};
	}
}
