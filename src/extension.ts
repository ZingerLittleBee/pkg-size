import { stat } from 'fs/promises'
import {
	commands,
	ExtensionContext,
	StatusBarAlignment,
	StatusBarItem,
	TextEditor,
	window,
	workspace
} from 'vscode'
import { batchBuild, getPackageFullName } from './build'
import { Cache } from './cache'
import { clearDecorations, updateDecorations } from './decoration'
import { depClear, depListener } from './emitter'
import { DepInfo, parse } from './parser'
import { fsFormat } from './utils'

export type PackageInfo = DepInfo & SizeInfo

type SizeInfo = {
	size?: number
	gzip?: number
}

let myStatusBarItem: StatusBarItem

const cache = Cache.getInstance()

const myCommandId = 'package-size.rebuild'

export function activate({ subscriptions }: ExtensionContext) {
	subscriptions.push(
		commands.registerCommand(myCommandId, () => {
			console.log('rebuild')
			cache.clear()
		})
	)

	// create a new status bar item that we can now manage
	myStatusBarItem = window.createStatusBarItem(StatusBarAlignment.Right, 100)

	// register some listener that make sure the status bar
	// item always up-to-date
	subscriptions.push(
		window.onDidChangeActiveTextEditor(async e => {
			if (e) {
				let path = e.document?.uri.path
				if (path) {
					try {
						const currStat = await stat(path)
						currStat.isDirectory()
							? hideStatusBarItem()
							: updateStatusBarItem(currStat.size)
					} catch (e) {
						console.error(e)
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
			window.showInformationMessage('onDidChangeTextDocument')
			if (e) {
				if (
					e.document.fileName
						.toLocaleLowerCase()
						.endsWith('package.json')
				) {
					window.activeTextEditor &&
						(await handlePackage(
							window.activeTextEditor,
							e.document.getText()
						))
				}
			}
		})
	)

	subscriptions.push(
		workspace.onDidSaveTextDocument(e => {
			window.activeTextEditor &&
				handlePackage(window.activeTextEditor, e.getText())
		})
	)
}

function updateStatusBarItem(size: number): void {
	// const n = getNumberOfSelectedLines(vscode.window.activeTextEditor)
	myStatusBarItem.text = `$(package) ${fsFormat(size)}`
	myStatusBarItem.tooltip = 'Click to rebuild'
	myStatusBarItem.command = myCommandId
	myStatusBarItem.show()
}

function hideStatusBarItem(): void {
	myStatusBarItem.hide()
}

const handlePackage = async (editor: TextEditor, text: string) => {
	if (!text) {
		return
	}
	const reflects = await parse(text)
	if (reflects?.length > 0) {
		clearDecorations()
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
				updateDecorations(editor, updatedPackageInfo)
			}
		},
		() => {
			depClear()
		}
	)
	batchBuild(
		reflects.map(r => ({
			packageName: r.name,
			version: r.version
		}))
	)
}
