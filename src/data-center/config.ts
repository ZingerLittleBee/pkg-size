import { readFile, writeFile } from 'fs/promises'
import { DEFAULT_BASE_URL, PKG_SIZE_CONFIG_PATH } from '../const'

export type BuildInfo = {
	size?: number
	gzip?: number
	time?: number
	isSkip?: boolean
}

type PKGConfig = {
	baseUrl: string
}

export default class Config {
	static instace: Config
	private static async init(): Promise<{
		configs?: PKGConfig
		deps?: Record<string, BuildInfo>
	}> {
		let content = {}
		try {
			const contentBuffer = await readFile(PKG_SIZE_CONFIG_PATH)
			content = JSON.parse(contentBuffer.toString('utf8'))
		} catch (e) {
			console.error('getConfig failed')
			console.error(e)
		}
		return content
	}
	static async getInstance() {
		if (!this.instace) {
			const arg = await this.init()
			this.instace = new Config(arg)
		}
		return this.instace
	}
	private deps?: Record<string, BuildInfo>
	private configs?: PKGConfig
	constructor(args: {
		configs?: PKGConfig
		deps?: Record<string, BuildInfo>
	}) {
		this.deps = args.deps
		this.configs = args.configs
	}

	getDeps() {
		return this.deps
	}
	getConfigs() {
		return this.configs
	}
	getUrl(): string {
		return this.configs?.baseUrl || DEFAULT_BASE_URL
	}
	overriedConfig(args: {
		deps?: Record<string, BuildInfo>
		configs?: PKGConfig
	}) {
		const content = {
			configs: {
				...this.configs,
				...args?.configs
			},
			deps: {
				...this.deps,
				...args?.deps
			}
		}
		writeFile(PKG_SIZE_CONFIG_PATH, JSON.stringify(content), {
			encoding: 'utf8'
		})
	}
}
