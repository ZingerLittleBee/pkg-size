import { Position, Range, TextEditor, window } from 'vscode'
import { INDENT, TEXT_COLOR } from './config'
import { getDecoration } from './data-center'
import { PackageInfo } from './extension'
import { fsFormat } from './utils'

export const updateDecorations = (editor: TextEditor, info: PackageInfo) => {
	getDecoration().dispose(editor.document.uri.path, info.lineNumber)
	const text = `${info.size ? fsFormat(info.size) : ''} ${
		info.gzip ? `(gzip: ${fsFormat(info.gzip)})` : ''
	}`
	const type = window.createTextEditorDecorationType({
		after: {
			contentText: text,
			color: TEXT_COLOR,
			margin: '0 0 0 ' + INDENT + 'px'
		}
	})
	const start = new Position(info.lineNumber, info.length)
	const end = new Position(info.lineNumber, info.length + text.length)
	const range = new Range(start, end)
	editor.setDecorations(type, [range])
	getDecoration().setType(editor.document.uri.path, info.lineNumber, type, [
		range
	])
}

export const reRenderDecorations = (editor: TextEditor) =>
	getDecoration()
		.getTypeAndRangeByPath(editor.document.uri.path)
		.forEach(tr => {
			if (tr.range) {
				editor.setDecorations(tr.type, tr.range)
			}
		})

export const clearDecorations = () => getDecoration().clear()
