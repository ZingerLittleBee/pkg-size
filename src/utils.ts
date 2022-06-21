export const fsFormat = (size: number) => {
	const units = ['B', 'KiB', 'MiB', 'GiB', 'TiB', 'PiB', 'EiB', 'ZiB', 'YiB']
	let i = 0
	while (size >= 1024) {
		size /= 1024
		i++
	}
	return `${size.toFixed(1)} ${units[i]}`
}

export const getDirectorySize = async (path: string) => {
	return 0
}

export const getOrInsert = (
	map: Map<string, number>,
	key: string,
	insertValue: number
) => {
	if (map.get(key)) {
		return map.get(key)
	}
	map.set(key, insertValue)
	return insertValue
}
