import {Effect, Config, Layer, Context} from "effect"

export class Environment extends Context.Tag("Environment")<
	Environment,
	{
		IPFS_KEY: string
		IPFS_GATEWAY_WRITE: string
		IPFS_GATEWAY_READ: string
		RPC_ENDPOINT_TESTNET: string
		API_ENDPOINT_TESTNET: string
		RPC_ENDPOINT_MAINNET: string
		API_ENDPOINT_MAINNET: string
	}
>() {}

export const EnvironmentLive = Layer.effect(
	Environment,
	Effect.gen(function* () {
		const IPFS_KEY = yield* Config.string("IPFS_KEY")
		const IPFS_GATEWAY_WRITE = yield* Config.string("IPFS_GATEWAY_WRITE")
		const IPFS_GATEWAY_READ = yield* Config.string("IPFS_GATEWAY_READ")
		const RPC_ENDPOINT_TESTNET = yield* Config.string("RPC_ENDPOINT_TESTNET")
		const API_ENDPOINT_TESTNET = yield* Config.string("API_ENDPOINT_TESTNET")
		const RPC_ENDPOINT_MAINNET = yield* Config.string("RPC_ENDPOINT_MAINNET")
		const API_ENDPOINT_MAINNET = yield* Config.string("API_ENDPOINT_MAINNET")

		return {
			IPFS_KEY,
			IPFS_GATEWAY_WRITE,
			IPFS_GATEWAY_READ,
			RPC_ENDPOINT_TESTNET,
			API_ENDPOINT_TESTNET,
			RPC_ENDPOINT_MAINNET,
			API_ENDPOINT_MAINNET,
		}
	}),
)

export const EnvironmentLiveRaw = Effect.runSync(
	Effect.gen(function* () {
		const live = yield* Environment

		return live
	}).pipe(Effect.provide(EnvironmentLive)),
)
