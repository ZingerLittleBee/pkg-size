import { stat } from 'fs/promises'
import { commands, ExtensionContext, window, workspace } from 'vscode'
import { Cache } from './cache'
import { clearDecorations } from './decoration'
import { packageDeHandler } from './handler'
import { DepInfo } from './parser'
import { SizeStatusBarItem } from './status-bar'
import { isPackage } from './utils'

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
				if (isPackage(e.document.fileName)) {
					packageDeHandler(e, e.document.getText())
				}
			}
		})
	)

	subscriptions.push(
		workspace.onDidChangeTextDocument(e => {
			if (isPackage(e.document.fileName)) {
				{
					window.activeTextEditor &&
						packageDeHandler(
							window.activeTextEditor,
							e.document.getText()
						)
				}
			}
		})
	)

	subscriptions.push(
		workspace.onDidSaveTextDocument(e => {
			window.activeTextEditor &&
				packageDeHandler(window.activeTextEditor, e.getText())
		})
	)

	const currentFileName = window.activeTextEditor?.document.fileName

	if (currentFileName && isPackage(currentFileName)) {
		packageDeHandler(
			window.activeTextEditor,
			window.activeTextEditor?.document.getText()
		)
	}
}
