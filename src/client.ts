import {createPublicClient, createWalletClient, http} from "viem"
import {privateKeyToAccount} from "viem/accounts"
import {providers} from "ethers"
import type {WalletClient} from "viem"
import {GEOGENESIS} from "./chain"

const geoAccount = privateKeyToAccount(process.env.DEPLOYER_PK as `0x${string}`)

export const walletClient = createWalletClient({
	account: geoAccount,
	chain: GEOGENESIS,
	transport: http(process.env.RPC_ENDPOINT!, {batch: true}),
})

export const publicClient = createPublicClient({
	chain: GEOGENESIS,
	transport: http(process.env.RPC_ENDPOINT!, {batch: true}),
})

export const signer = walletClientToSigner(walletClient)

function walletClientToSigner(walletClient: WalletClient) {
	const {account, chain, transport} = walletClient

	if (!chain) return

	const network = {
		chainId: chain.id,
		name: chain.name,
		ensAddress: chain.contracts?.ensRegistry?.address,
	}
	const provider = new providers.Web3Provider(transport, network)
	const signer = provider.getSigner(account?.address)
	return signer
}
