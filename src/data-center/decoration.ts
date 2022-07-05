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
	dispose(path: string, line: number) {
		this.decorationMap.get(path)?.get(line)?.dispose()
	}
	clear() {
		for (const type of this.decorationTypeSet) {
			type.dispose()
		}
	}
}
