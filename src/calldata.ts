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
	}
}

export function getPublishEditCalldata(spaceId: string, cid: string) {
	return Effect.gen(function* () {
		const config = yield* Environment

		const result = yield* graphql<NetworkResult>({
			endpoint: config.API_ENDPOINT,
			query: query(spaceId),
		})

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
