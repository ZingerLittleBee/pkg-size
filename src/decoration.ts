import {
	Position,
	Range,
	TextEditor,
	TextEditorDecorationType,
	window
} from 'vscode'
import { PackageInfo } from './extension'
import { fsFormat } from './utils'

// <lineNumber, TextEditorDecorationType>
const decorationMap = new Map<number, TextEditorDecorationType>()
const decorations = new WeakMap<TextEditorDecorationType, Range[]>()
const indent = 8

export const updateDecorations = (editor: TextEditor, info: PackageInfo) => {
	const text = `${info.size ? fsFormat(info.size) : ''} ${
		info.gzip ? `(gzip: ${fsFormat(info.gzip)})` : ''
	}`
	const type = window.createTextEditorDecorationType({
		after: {
			contentText: `${Array(indent).fill(' ').join('')}${text}`,
			color: '#22C55E'
		}
	})
	decorationMap.set(info.lineNumber, type)
	const start = new Position(info.lineNumber, info.length)
	const end = new Position(info.lineNumber, info.length + text.length)
	const range = new Range(start, end)
	decorations.set(type, [range])
	editor.setDecorations(type, [range])
}

export const reRenderDecorations = (editor: TextEditor) => {
	for (const type of decorationMap.values()) {
		let ranges = decorations.get(type)
		if (ranges) {
			editor.setDecorations(type, ranges)
		}
	}
}

export const clearDecorations = () => {
	for (const value of decorationMap.values()) {
		value?.dispose()
	}
	decorationMap.clear()
}
