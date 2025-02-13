import {Effect, Config, Layer, Context} from "effect"

export class Environment extends Context.Tag("Environment")<
	Environment,
	{
		IPFS_KEY: string
		IPFS_GATEWAY_WRITE: string
		IPFS_GATEWAY_READ: string
		RPC_ENDPOINT: string
		API_ENDPOINT: string
	}
>() {}

export const EnvironmentLive = Layer.effect(
	Environment,
	Effect.gen(function* () {
		const IPFS_KEY = yield* Config.string("IPFS_KEY")
		const IPFS_GATEWAY_WRITE = yield* Config.string("IPFS_GATEWAY_WRITE")
		const IPFS_GATEWAY_READ = yield* Config.string("IPFS_GATEWAY_READ")
		const RPC_ENDPOINT = yield* Config.string("RPC_ENDPOINT")
		const API_ENDPOINT = yield* Config.string("API_ENDPOINT")

		return {
			IPFS_KEY,
			IPFS_GATEWAY_WRITE,
			IPFS_GATEWAY_READ,
			RPC_ENDPOINT,
			API_ENDPOINT,
		}
	}),
)

export const EnvironmentLiveRaw = Effect.runSync(
	Effect.gen(function* () {
		const live = yield* Environment

		return live
	}).pipe(Effect.provide(EnvironmentLive)),
)
