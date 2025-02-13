import type {Chain} from "viem"

export const GEOGENESIS: Chain = {
	id: 19411, // or 80451 for mainnet
	name: "Geo Genesis",
	nativeCurrency: {
		name: "Ethereum",
		symbol: "ETH",
		decimals: 18,
	},
	rpcUrls: {
		default: {
			http: [process.env.RPC_ENDPOINT!],
		},
		public: {
			http: [process.env.RPC_ENDPOINT!],
		},
	},
}
