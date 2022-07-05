export default class ParsedDep {
	private depSet: Set<string>
	static instace: ParsedDep
	static getInstance() {
		if (!this.instace) {
			this.instace = new ParsedDep()
		}
		return this.instace
	}
	constructor() {
		this.depSet = new Set()
	}
	add(dep: string) {
		this.depSet.add(dep)
	}
	getAll() {
		const deps: string[] = []
		for (const dep of this.depSet) {
			deps.push(dep)
		}
		return deps
	}
}
