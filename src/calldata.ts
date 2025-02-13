import {Effect} from "effect"
import {Environment} from "./config"
import {graphql} from "./graphql"
import {encodeFunctionData} from "viem"
import {PersonalSpaceAdminAbi} from "@graphprotocol/grc-20/abis"

const query = (spaceId: string) => {
	return `
    query {
      space(id: "${spaceId}") {
        id
        type
        daoAddress
        mainVotingPluginAddress
        memberAccessPluginAddress
        personalSpaceAdminPluginAddress
        spacePluginAddress
      }
    }`
}

type NetworkResult = {
	space: {
		id: string
		type: "PERSONAL" | "PUBLIC"
		daoAddress: string
		spacePluginAddress: string
		mainVotingPluginAddress: string | null
		memberAccessPluginAddress: string | null
		personalSpaceAdminPluginAddress: string | null
	} | null
}

export function getPublishEditCalldata(spaceId: string, cid: string, network: "TESTNET" | "MAINNET") {
	return Effect.gen(function* () {
		const config = yield* Environment
		const endpoint = network === "TESTNET" ? config.API_ENDPOINT_TESTNET : config.API_ENDPOINT_MAINNET

		const result = yield* graphql<NetworkResult>({
			endpoint,
			query: query(spaceId),
		})

		if (!result.space) {
			return null
		}

		const calldata = encodeFunctionData({
			functionName: "submitEdits",
			abi: PersonalSpaceAdminAbi,
			args: [cid, result.space.spacePluginAddress as `0x${string}`],
		})

		return {
			to: result.space.personalSpaceAdminPluginAddress,
			data: calldata,
		}
	})
}
