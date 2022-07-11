import axios from 'axios'
import { getBuildCache, getConfig } from './data-center'
import BuildCache from './data-center/buildCache'
import { depDone, depFinish } from './emitter'

export const getPackageFullName = (packageName: string, version?: string) => {
	return `${packageName}@${version ? version : 'latest'}`
}

export const build = async (
	packageName: string,
	cache?: BuildCache,
	version?: string
) => {
	try {
		const { data } = await axios.get(
			`${(await getConfig()).getUrl()}?package=${getPackageFullName(
				packageName,
				version
			)}&record=true`,
			{
				timeout: 2000
			}
		)
		const { size, gzip } = data
		if (!size || !gzip) {
			throw new Error(
				`request ${getPackageFullName(packageName, version)} error`
			)
		}
		console.log(
			`${packageName}@${version} build success, size: ${size}, gzip: ${gzip}`
		)
		cache?.set(getPackageFullName(packageName, version), {
			size,
			gzip,
			time: new Date().getTime()
		})
	} catch (e) {
		console.error(`${packageName}@${version} build failed: ${e}, will skip`)
		cache?.set(getPackageFullName(packageName, version), {
			isSkip: true,
			time: new Date().getTime()
		})
	}
}

export const batchBuild = async (
	packages: { packageName: string; version: string }[]
) => {
	let taskNumber = packages.length

	let cache: BuildCache
	try {
		cache = await getBuildCache()
	} catch (e) {
		console.error(`get cache failed: ${e}`)
		return
	}

	const waitBuildQueue: { packageName: string; version: string }[] = []

	packages.forEach(p => {
		const packageName = p.packageName
		const version = p.version
		const infoInCache = cache.get(getPackageFullName(packageName, version))
		if (infoInCache) {
			if (!infoInCache.isSkip) {
				depFinish(getPackageFullName(packageName, version))
			}
			taskNumber--
			if (taskNumber === 0) {
				depDone()
			}
		} else {
			waitBuildQueue.push({ packageName, version })
		}
	})
	// replace with concurrent
	while (waitBuildQueue.length > 0) {
		const item = waitBuildQueue.shift()
		if (item) {
			await build(item.packageName, cache, item.version)
			depFinish(getPackageFullName(item.packageName, item.version))
			taskNumber--
			if (taskNumber === 0) {
				depDone()
			}
		}
	}
}
