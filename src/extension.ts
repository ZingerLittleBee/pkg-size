import { stat } from 'fs/promises'
import { commands, ExtensionContext, window, workspace } from 'vscode'
import { REBUILD_COMMAND_ID } from './config'
import { getBuildCache, getDecoration, getFileHash } from './data-center'
import BuildCache from './data-center/buildCache'
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

let cache: BuildCache
;(async () => {
	try {
		cache = await getBuildCache()
	} catch (e) {
		console.error(`getBuildCache error: ${e}`)
	}
})()

const sizeStatusBarItem = new SizeStatusBarItem()

export function activate({ subscriptions }: ExtensionContext) {
	subscriptions.push(
		commands.registerCommand(REBUILD_COMMAND_ID, () => {
			console.log('rebuild')
			cache.clear()
			clearDecorations()
			getFileHash().clear()
			packageDeHandler(
				window.activeTextEditor,
				window.activeTextEditor?.document.getText()
			)
		})
	)

	// register some listener that make sure the status bar
	// item always up-to-date
	subscriptions.push(
		window.onDidChangeActiveTextEditor(async e => {
			if (e) {
				let path = e.document?.uri.path
				if (path) {
					showStatusBar(path)
				}
				if (isPackage(e.document.fileName)) {
					packageDeHandler(e, e.document.getText())
				}
			}
		})
	)

	subscriptions.push(
		workspace.onDidChangeTextDocument(e => {
			if (e.document.isDirty) {
				e.contentChanges.forEach(c => {
					getDecoration().disposeByRange(e.document.uri.path, c.range)
				})
			}
			if (
				isPackage(e.document.fileName) &&
				e.contentChanges.length > 0 &&
				!e.document.isDirty
			) {
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
	showStatusBar(window.activeTextEditor?.document.uri.path)
}

export function deactivate() {
	// storage
	cache.toPersistence()
}

const showStatusBar = async (path?: string) => {
	if (!path) {
		return
	}
	try {
		const currStat = await stat(path)
		currStat.isDirectory()
			? sizeStatusBarItem.hideStatusBarItem()
			: sizeStatusBarItem.updateStatusBarItem(
					currStat.size,
					REBUILD_COMMAND_ID
			  )
	} catch (e) {
		console.error(e)
	}
}
