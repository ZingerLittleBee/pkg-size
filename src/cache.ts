type BuildInfo = {
	size?: number
	gzip?: number
	time?: number
	isSkip?: boolean
}
export class Cache {
	// <packageName@version, buildInfo>
	private map: Map<string, BuildInfo>
	private static instance: Cache
	constructor() {
		this.map = new Map()
	}
	static getInstance() {
		if (!Cache.instance) {
			Cache.instance = new Cache()
		}
		return Cache.instance
	}
	get(key: string) {
		return this.map.get(key)
	}
	set(key: string, value: any) {
		this.map.set(key, value)
	}
}
