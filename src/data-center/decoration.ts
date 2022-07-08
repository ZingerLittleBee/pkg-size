import { Range, TextEditorDecorationType } from 'vscode'

export default class Decoration {
	// <path, <line, TextEditorDecorationType>>
	private decorationMap: Map<string, Map<number, TextEditorDecorationType>>
	private decorationTypeMap: WeakMap<TextEditorDecorationType, Range[]>
	// TextEditorDecorationType
	private decorationTypeSet: Set<TextEditorDecorationType>
	static instace: Decoration
	static getInstance() {
		if (!this.instace) {
			this.instace = new Decoration()
		}
		return this.instace
	}
	constructor() {
		this.decorationMap = new Map<
			string,
			Map<number, TextEditorDecorationType>
		>()
		this.decorationTypeMap = new WeakMap<
			TextEditorDecorationType,
			Range[]
		>()
		this.decorationTypeSet = new Set()
	}
	setType(
		path: string,
		line: number,
		type: TextEditorDecorationType,
		range: Range[]
	) {
		if (!this.decorationMap.get(path)) {
			const newMap = new Map<number, TextEditorDecorationType>()
			this.decorationMap.set(path, newMap)
		}
		this.decorationMap.get(path)?.set(line, type)
		this.decorationTypeMap.set(type, range)
		this.decorationTypeSet.add(type)
	}
	getTypeByPath(path: string) {
		const map = this.decorationMap.get(path)
		const types = []
		if (map) {
			for (const type of map.values()) {
				types.push(type)
			}
		}
		return types
	}
	getTypeAndRangeByPath(path: string) {
		const map = this.decorationMap.get(path)
		const types = []
		if (map) {
			for (const type of map.values()) {
				types.push({
					type: type,
					range: this.decorationTypeMap.get(type)
				})
			}
		}
		return types
	}
	dispose(path: string, line: number | number[]) {
		if (!path || line < 0) {
			return
		}
		if (!Array.isArray(line)) {
			line = [line]
		}
		line.forEach(l => this.decorationMap.get(path)?.get(l)?.dispose())
	}
	disposeByRange(path: string, range: Range) {
		const { start, end } = range
		const startLine = start.line
		const endLine = end.line
		startLine === endLine
			? this.dispose(path, startLine)
			: this.dispose(
					path,
					new Array(endLine - startLine).map((_, i) => startLine + i)
			  )
	}
	clear() {
		for (const type of this.decorationTypeSet) {
			type.dispose()
		}
	}
}
