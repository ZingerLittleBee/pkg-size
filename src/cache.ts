import { BuildInfo, getConfig, overriedConfig } from './persistence'

export class Cache {
	// <packageName@version, buildInfo>
	private map: Map<string, BuildInfo>
	private static instance: Cache
	constructor(data: Record<string, BuildInfo> = {}) {
		if (Object.keys(data).length === 0) {
			this.map = new Map()
		} else {
			this.map = new Map(Object.entries(data))
		}
	}
	static async getInstance() {
		if (!Cache.instance) {
			const config = await getConfig()
			Cache.instance = new Cache(config)
		}
		return Cache.instance
	}
	get(key: string) {
		return this.map.get(key)
	}
	set(key: string, value: any) {
		this.map.set(key, value)
	}
	clear() {
		this.map.clear()
	}
	async toPersistence() {
		if (this.map.size !== 0) {
			try {
				overriedConfig(JSON.stringify(Object.fromEntries(this.map)))
			} catch (e) {
				console.error('toPersistence failed')
				console.error(e)
			}
		}
	}
}
