import * as vscode from 'vscode'
import { Position, Range } from 'vscode'
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
			let path = e?.document?.uri.path
			path && vscode.window.showInformationMessage(path)
			// if (path) {
			// 	let size: number | undefined
			// 	try {
			// 		const currStat = await stat(path)
			// 		size = currStat.isDirectory()
			// 			? await getDirectorySize(path)
			// 			: getOrInsert(map, path, currStat?.size)
			// 	} catch (e) {
			// 		console.log(e)
			// 	}
			// 	size && updateStatusBarItem(size)
			// }
			// const type = vscode.window.createTextEditorDecorationType({
			// 	after: {
			// 		contentText: '123!!'
			// 	}
			// })
			const fileName = e?.document.fileName
			if (fileName?.toLocaleLowerCase().endsWith('package.json')) {
				const text = e?.document.getText()
				if (text) {
					let reflects = await parse(text)
					depListener(
						key => {
							const depInfo = reflects.find(
								r =>
									getPackageFullName(r.name, r.version) ===
									key
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
								e && updateDecorations(e, updatedPackageInfo)
							}
						},
						() => {
							console.log('done')
							depClear()
						}
					)
					batchBuild(
						reflects
							.filter(r => {
								const fullName = getPackageFullName(
									r.name,
									r.version
								)
								let currDepInfo = map.get(fullName)
								if (!currDepInfo) {
									return true
								}
								const isBuilded =
									currDepInfo.gzip && currDepInfo.size
								if (isBuilded) {
									e && updateDecorations(e, currDepInfo)
								}
								return !isBuilded
							})
							.map(r => ({
								packageName: r.name,
								version: r.version
							}))
					)
				}
			}
		})
	)

	subscriptions.push(
		vscode.workspace.onDidRenameFiles(e => {
			vscode.window.showInformationMessage(
				`old: ${e.files[0].oldUri}, new: ${e.files[0].oldUri}`
			)
		})
	)
	subscriptions.push(
		vscode.workspace.onDidChangeWorkspaceFolders(e => {
			vscode.window.showInformationMessage('onDidChangeWorkspaceFolders')
		})
	)
	// subscriptions.push(
	// 	vscode.window.onDidChangeTextEditorSelection(updateStatusBarItem)
	// )

	// update status bar item once at start
	updateStatusBarItem(0)
}

function updateStatusBarItem(size: number): void {
	// const n = getNumberOfSelectedLines(vscode.window.activeTextEditor)
	if (size > 0) {
		myStatusBarItem.text = `$(megaphone) ${fsFormat(size)}`
		myStatusBarItem.show()
	} else {
		myStatusBarItem.hide()
	}
}

let indent = 4
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
	let start = new Position(info.lineNumber, info.length)
	let end = new Position(info.lineNumber, info.length + text.length)
	let range = new Range(start, end)
	editor.setDecorations(type, [range])
}
