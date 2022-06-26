export const fsFormat = (size: number) => {
	const units = ['B', 'KiB', 'MiB', 'GiB', 'TiB', 'PiB', 'EiB', 'ZiB', 'YiB']
	let i = 0
	while (size >= 1024) {
		size /= 1024
		i++
	}
	return `${size.toFixed(1)}${units[i]}`
}

export const getDirectorySize = async (path: string) => {
	return 0
}

export const getOrInsert = <T>(
	map: Map<string, T>,
	key: string,
	insertValue: T
) => {
	if (map.get(key)) {
		return map.get(key)
	}
	map.set(key, insertValue)
	return insertValue
}

export const debounce = (
	fn: (...args: any[]) => Promise<void>,
	delay: number
) => {
	let timer: NodeJS.Timeout
	return (...args: any[]) => {
		if (timer) {
			clearTimeout(timer)
		}
		timer = setTimeout(() => fn(...args), delay)
	}
}

export const isPackage = (path?: string) => {
	return path?.toLocaleLowerCase().endsWith('package.json')
}
