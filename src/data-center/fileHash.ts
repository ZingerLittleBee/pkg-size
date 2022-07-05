export default class FileHash {
	private fileMap: Map<string, string>
	static instace: FileHash
	static getInstance() {
		if (!this.instace) {
			this.instace = new FileHash()
		}
		return this.instace
	}
	constructor() {
		this.fileMap = new Map()
	}
	set(path: string, value: string) {
		this.fileMap.set(path, value)
	}
	get(path: string) {
		return this.fileMap.get(path)
	}
	clear() {
		this.fileMap.clear()
	}
}
