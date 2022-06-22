export class Cache {
	private map: Map<
		string,
		{
			version: string
			size?: number
			gzip?: number
			time?: number
		}
	>
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
