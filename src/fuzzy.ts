import {Effect} from "effect"
import {Environment} from "./config"
import {graphql} from "./graphql"

const getSearchQuery = (query: string) => `
  query {
    searchEntitiesFuzzy(searchTerm: "${query}") {
      nodes {
        id
        name

				currentVersion {
					version {
						versionSpaces {
							nodes {
								spaceId
							}
						}
						versionTypes {
							nodes {
								type {
									entityId
									name
								}
							}
						}
					}
				}
      }
    }
  }
`

type NetworkResult = {
	searchEntitiesFuzzy: {
		nodes: {
			id: string
			name: string

			currentVersion: {
				version: {
					versionSpaces: {
						nodes: {
							spaceId: string
						}[]
					}
					versionTypes: {
						nodes: {
							type: {
								entityId: string
								name: string
							}
						}[]
					}
				}
			}
		}[]
	}
}

export function fuzzySearch(query: string, network?: string) {
	return Effect.gen(function* () {
		const config = yield* Environment

		let endpoint = config.API_ENDPOINT_MAINNET

		if (network === "TESTNET") {
			endpoint = config.API_ENDPOINT_TESTNET
		}

		const result = yield* graphql<NetworkResult>({
			endpoint: endpoint,
			query: getSearchQuery(query),
		})

		return result.searchEntitiesFuzzy.nodes.map((e) => {
			return {
				id: e.id,
				name: e.name,
				types: e.currentVersion.version.versionTypes.nodes.map((v) => {
					return {
						id: v.type.entityId,
						name: v.type.name,
					}
				}),

				spaces: e.currentVersion.version.versionSpaces.nodes.map((v) => {
					return {
						id: v.spaceId
					}
				}),
			}
		})
	})
}
