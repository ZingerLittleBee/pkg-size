import { getPackageStats } from 'package-build-stats'
import { GetPackageStatsOptions } from 'package-build-stats/build/common.types'
import { Cache } from './cache'
import { depDone, depFinish } from './emitter'

const cache = Cache.getInstance()

export const getPackageFullName = (packageName: string, version?: string) => {
	return `${packageName}@${version ? version : 'latest'}`
}

export const build = async (
	packageName: string,
	version?: string,
	options?: GetPackageStatsOptions
) => {
	try {
		const res = await getPackageStats(
			getPackageFullName(packageName, version),
			{
				...options
			}
		)
		console.log(
			`${packageName}@${version} build success, size: ${res.size}, gzip: ${res.gzip}`
		)
		cache.set(getPackageFullName(packageName, version), {
			size: res.size,
			gzip: res.gzip,
			time: new Date().getTime()
		})
	} catch (e) {
		console.error(`${packageName}@${version} build failed, will skip`)
		console.error(e)
		cache.set(getPackageFullName(packageName, version), {
			isSkip: true,
			time: new Date().getTime()
		})
	}
}

export const batchBuild = async (
	packages: { packageName: string; version: string }[]
) => {
	let taskNumber = packages.length
	packages.forEach(p => {
		const packageName = p.packageName
		const version = p.version
		const infoInCache = cache.get(getPackageFullName(packageName, version))
		if (infoInCache) {
			if (!infoInCache.isSkip) {
				depFinish(getPackageFullName(packageName, version))
			}
		} else {
			build(packageName, version, {
				limitConcurrency: true
			}).then(() => {
				depFinish(getPackageFullName(packageName, version))
			})
		}
		taskNumber--
		if (taskNumber === 0) {
			depDone()
		}
	})
}
