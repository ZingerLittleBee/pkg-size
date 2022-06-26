import { stat } from 'fs/promises'
import * as vscode from 'vscode'
import {
	Position,
	Range,
	TextEditor,
	TextEditorDecorationType,
	window,
	workspace
} from 'vscode'
import { batchBuild, getPackageFullName } from './build'
import { Cache } from './cache'
import { depClear, depListener } from './emitter'
import { DepInfo, parse } from './parser'
import { fsFormat } from './utils'

type PackageInfo = DepInfo & SizeInfo

type SizeInfo = {
	size?: number
	gzip?: number
}

let myStatusBarItem: vscode.StatusBarItem

// <getPackageFullName(name, version), PackageInfo>
let map = new Map<string, PackageInfo>()
const cache = Cache.getInstance()

export function activate({ subscriptions }: vscode.ExtensionContext) {
	// const myCommandId = 'package-size.helloWorld'
	// subscriptions.push(
	// 	vscode.commands.registerCommand(myCommandId, () => {
	// 		const n = getNumberOfSelectedLines(vscode.window.activeTextEditor)
	// 		vscode.window.showInformationMessage(
	// 			`Yeah, ${n} line(s) selected... Keep going!`
	// 		)
	// 	})
	// )

	// create a new status bar item that we can now manage
	myStatusBarItem = vscode.window.createStatusBarItem(
		vscode.StatusBarAlignment.Right,
		100
	)
	// myStatusBarItem.command = myCommandId
	// subscriptions.push(myStatusBarItem)

	// register some listener that make sure the status bar
	// item always up-to-date
	subscriptions.push(
		vscode.window.onDidChangeActiveTextEditor(async e => {
			if (e) {
				let path = e.document?.uri.path
				if (path) {
					try {
						const currStat = await stat(path)
						currStat.isDirectory()
							? hideStatusBarItem()
							: updateStatusBarItem(currStat.size)
					} catch (e) {
						console.log(e)
					}
				}
				if (
					e.document.fileName
						.toLocaleLowerCase()
						.endsWith('package.json')
				) {
					handlePackage(e, e.document.getText())
				}
			}
		})
	)

	subscriptions.push(
		workspace.onDidChangeTextDocument(async e => {
			vscode.window.showInformationMessage('onDidChangeTextDocument')
			if (e) {
				if (
					e.document.fileName
						.toLocaleLowerCase()
						.endsWith('package.json')
				) {
					vscode.window.activeTextEditor &&
						(await handlePackage(
							vscode.window.activeTextEditor,
							e.document.getText()
						))
				}
			}
		})
	)

	subscriptions.push(
		vscode.workspace.onDidSaveTextDocument(e => {
			window.activeTextEditor &&
				handlePackage(window.activeTextEditor, e.getText())
		})
	)
}

function updateStatusBarItem(size: number): void {
	// const n = getNumberOfSelectedLines(vscode.window.activeTextEditor)
	myStatusBarItem.text = `$(megaphone) ${fsFormat(size)}`
	myStatusBarItem.show()
}

function hideStatusBarItem(): void {
	myStatusBarItem.hide()
}

// <lineNumber, TextEditorDecorationType>
const decorationMap = new Map<
	number,
	{ type: TextEditorDecorationType; info: PackageInfo }
>()
const indent = 4
function updateDecorations(editor: vscode.TextEditor, info: PackageInfo) {
	const text = `${info.size && fsFormat(info.size)} ${
		info.gzip ? `(gzip: ${fsFormat(info.gzip)})` : ''
	}`
	const type = vscode.window.createTextEditorDecorationType({
		after: {
			contentText: `${Array(indent).fill(' ').join('')}${text}`,
			color: '#22C55E'
		}
	})
	decorationMap.set(info.lineNumber, { type, info })
	const start = new Position(info.lineNumber, info.length)
	const end = new Position(info.lineNumber, info.length + text.length)
	const range = new Range(start, end)
	editor.setDecorations(type, [range])
}

const handlePackage = async (editor: TextEditor, text: string) => {
	if (!text) {
		return
	}
	const reflects = await parse(text)
	if (reflects?.length > 0) {
		for (const value of decorationMap.values()) {
			value?.type.dispose()
		}
	}
	depListener(
		key => {
			const depInfo = reflects.find(
				r => getPackageFullName(r.name, r.version) === key
			)
			if (depInfo) {
				const size = cache.get(key)?.size
				const gzip = cache.get(key)?.gzip
				const updatedPackageInfo = {
					...depInfo,
					size,
					gzip
				}
				map.set(key, updatedPackageInfo)
				updateDecorations(editor, updatedPackageInfo)
			}
		},
		() => {
			depClear()
		}
	)
	batchBuild(
		reflects
			// .filter(r => {
			// 	const fullName = getPackageFullName(r.name, r.version)
			// 	let currDepInfo = map.get(fullName)
			// 	if (!currDepInfo) {
			// 		return true
			// 	} else {
			// 		map.set(fullName, { ...currDepInfo, ...r })
			// 	}
			// 	const isBuilded = currDepInfo.gzip && currDepInfo.size
			// 	if (isBuilded) {
			// 		updateDecorations(editor, currDepInfo)
			// 	}
			// 	return !isBuilded
			// })
			.map(r => ({
				packageName: r.name,
				version: r.version
			}))
	)
}
