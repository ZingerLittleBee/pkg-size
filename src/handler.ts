import { TextEditor } from 'vscode'
import { batchBuild, getPackageFullName } from './build'
import { getBuildCache, getFileHash, getParsedDep } from './data-center'
import BuildCache from './data-center/buildCache'
import { reRenderDecorations, updateDecorations } from './decoration'
import { depClear, depListener } from './emitter'
import { parse } from './parser'
import { computedHash, debounce } from './utils'

const isFileChanged = (path: string, content: string) => {
	// file not changed, just need to re-render decorations
	const currentHash = computedHash(content)
	if (getFileHash().get(path) === currentHash) {
		return false
	}
	// update file hash
	getFileHash().set(path, currentHash)
	return true
}

const packageHandler = async (editor: TextEditor, text: string) => {
	if (!text) {
		return
	}
	if (!isFileChanged(editor.document.uri.path, text)) {
		reRenderDecorations(editor)
		console.log('package not change')
	}
	const reflects = await parse(text)

	// store dep@version from parsed
	reflects.forEach(r =>
		getParsedDep().add(getPackageFullName(r.name, r.version))
	)

	let cache: BuildCache
	try {
		cache = await getBuildCache()
	} catch (e) {
		console.error(`get cache failed: ${e}`)
	}
	depListener(
		key => {
			const depInfo = reflects.find(
				r => getPackageFullName(r.name, r.version) === key
			)
			if (depInfo) {
				const size = cache?.get(key)?.size
				const gzip = cache?.get(key)?.gzip
				const updatedPackageInfo = {
					...depInfo,
					size,
					gzip
				}
				updateDecorations(editor, updatedPackageInfo)
			}
		},
		() => {
			console.log('dep build done')
			depClear()
			getFileHash().set(editor.document.uri.path, computedHash(text))
		}
	)
	batchBuild(
		reflects.map(r => ({
			packageName: r.name,
			version: r.version
		}))
	)
}

export const packageDeHandler = debounce(packageHandler, 1000)
