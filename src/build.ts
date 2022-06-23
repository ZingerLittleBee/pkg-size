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
): Promise<{ size: number; gzip: number }> => {
	let size = 0
	let gzip = 0
	try {
		const res = await getPackageStats(
			getPackageFullName(packageName, version),
			{
				minifier: 'esbuild',
				...options
			}
		)
		size = res.size
		gzip = res.gzip
	} catch (e) {
		console.error(e)
	}
	cache.set(getPackageFullName(packageName, version), {
		size,
		gzip
	})
	return {
		size,
		gzip
	}
}

export const batchBuild = (
	packages: { packageName: string; version: string }[]
) => {
	let taskNumber = packages.length
	packages.forEach(p => {
		build(p.packageName, p.version).then(() => {
			depFinish(getPackageFullName(p.packageName, p.version))
			taskNumber--
			if (taskNumber === 0) {
				depDone()
			}
		})
	})
}
