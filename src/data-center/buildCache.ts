import { getParsedDep } from '.'
import { BuildInfo, getConfig, overriedConfig } from '../persistence'

export default class BuildCache {
	// current project <packageName@version, buildInfo>
	private map: Map<string, BuildInfo>
	private persistenceMap: Map<string, BuildInfo>
	private static instance: BuildCache
	constructor(data: Record<string, BuildInfo> = {}) {
		this.map = new Map()
		this.persistenceMap =
			Object.keys(data).length === 0
				? new Map()
				: new Map(Object.entries(data))
	}
	static async getInstance() {
		if (!BuildCache.instance) {
			const config = await getConfig()
			BuildCache.instance = new BuildCache(config)
		}
		return BuildCache.instance
	}
	get(key: string) {
		return this.map.get(key) || this.persistenceMap.get(key)
	}
	set(key: string, value: any) {
		this.map.set(key, value)
	}
	clear() {
		getParsedDep()
			.getAll()
			.forEach(dep => {
				this.map.delete(dep)
				this.persistenceMap.has(dep) && this.persistenceMap.delete(dep)
			})
		this.map.clear()
	}
	async toPersistence() {
		if (this.map.size !== 0) {
			try {
				overriedConfig(
					JSON.stringify({
						...Object.fromEntries(this.persistenceMap),
						...Object.fromEntries(this.map)
					})
				)
			} catch (e) {
				console.error('toPersistence failed')
				console.error(e)
			}
		}
	}
}
