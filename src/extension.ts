import { stat } from 'fs/promises'
import {
	commands,
	ExtensionContext,
	TextEditor,
	window,
	workspace
} from 'vscode'
import { batchBuild, getPackageFullName } from './build'
import { Cache } from './cache'
import { clearDecorations, updateDecorations } from './decoration'
import { depClear, depListener } from './emitter'
import { DepInfo, parse } from './parser'
import { SizeStatusBarItem } from './status-bar'

export type PackageInfo = DepInfo & SizeInfo

type SizeInfo = {
	size?: number
	gzip?: number
}

const cache = Cache.getInstance()

const rebuildCommandId = 'package-size.rebuild'

export function activate({ subscriptions }: ExtensionContext) {
	subscriptions.push(
		commands.registerCommand(rebuildCommandId, () => {
			console.log('rebuild')
			cache.clear()
			clearDecorations()
		})
	)

	const sizeStatusBarItem = new SizeStatusBarItem()

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
							? sizeStatusBarItem.hideStatusBarItem()
							: sizeStatusBarItem.updateStatusBarItem(
									currStat.size,
									rebuildCommandId
							  )
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
