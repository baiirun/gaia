import type {Chain} from "viem"
import {EnvironmentLiveRaw} from "./config"

export const GEOGENESIS: Chain = {
	id: 80451, // or 80451 for mainnet
	name: "Geo Genesis",
	nativeCurrency: {
		name: "Ethereum",
		symbol: "ETH",
		decimals: 18,
	},
	rpcUrls: {
		default: {
			http: [EnvironmentLiveRaw.RPC_ENDPOINT_MAINNET],
		},
		public: {
			http: [EnvironmentLiveRaw.RPC_ENDPOINT_MAINNET],
		},
	},
}

export const TESTNET: Chain = {
	id: 19411, // or 80451 for mainnet
	name: "Geo Genesis",
	nativeCurrency: {
		name: "Ethereum",
		symbol: "ETH",
		decimals: 18,
	},
	rpcUrls: {
		default: {
			http: [EnvironmentLiveRaw.RPC_ENDPOINT_TESTNET],
		},
		public: {
			http: [EnvironmentLiveRaw.RPC_ENDPOINT_TESTNET],
		},
	},
}
