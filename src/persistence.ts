import { readFile, writeFile } from 'fs/promises'
import { homedir } from 'os'

const PKG_SIZE_CONFIG_NAME = '.pkg-size'
const PKG_SIZE_CONFIG_PATH = `${homedir()}/${PKG_SIZE_CONFIG_NAME}`

export type BuildInfo = {
	size?: number
	gzip?: number
	time?: number
	isSkip?: boolean
}

// const checkConfigFile = () => {
// 	if (!exists(PKG_SIZE_CONFIG_NAME)) {
// 		console.log(`Config file ${configFile} not found.`)
// 		process.exit(1)
// 	}
// }

export const overriedConfig = async (content: string) => {
	writeFile(PKG_SIZE_CONFIG_PATH, content, {
		encoding: 'utf8'
	})
}

export const getConfig = async (): Promise<Record<string, BuildInfo>> => {
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
