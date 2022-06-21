import { stat } from 'fs/promises'
import * as vscode from 'vscode'
import { parse } from './parser'
import { fsFormat, getDirectorySize, getOrInsert } from './utils'

let myStatusBarItem: vscode.StatusBarItem

// <path or npm name, size>
let map = new Map<string, number>()

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
			if (path) {
				let size: number | undefined
				try {
					const currStat = await stat(path)
					size = currStat.isDirectory()
						? await getDirectorySize(path)
						: getOrInsert(map, path, currStat?.size)
				} catch (e) {
					console.log(e)
				}
				size && updateStatusBarItem(size)
			}
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
					console.log('reflects', reflects)
					// TODO: get deps size
				}
				// let p = new Position(1, 0)
				// let p2 = new Position(1, 100)
				// let range = new Range(p, p2)
				// e?.setDecorations(type, [range])
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
