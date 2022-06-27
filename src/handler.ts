import { TextEditor } from 'vscode'
import { batchBuild, getPackageFullName } from './build'
import { Cache } from './cache'
import {
	clearDecorations,
	reRenderDecorations,
	updateDecorations
} from './decoration'
import { depClear, depListener } from './emitter'
import { parse } from './parser'
import { computedHash, debounce } from './utils'

const cache = Cache.getInstance()

let prePackageHash: string

const packageHandler = async (editor: TextEditor, text: string) => {
	if (prePackageHash === computedHash(text)) {
		reRenderDecorations(editor)
		console.log('package not change')
		return
	}
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
			console.log('dep build done')
			depClear()
			prePackageHash = computedHash(text)
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
