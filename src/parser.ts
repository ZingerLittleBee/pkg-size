import { createInterface } from 'readline'
import { Readable } from 'stream'

export type DepInfo = {
	name: string
	version: string
	lineNumber: number
	length: number
}

export const parse = (text: string) => {
	let lineNumber = -1
	// https://stackoverflow.com/questions/12755997/how-to-create-streams-from-string-in-node-js
	const s = new Readable()
	s._read = () => {}
	s.push(text)
	s.push(null)
	const rl = createInterface({
		input: s,
		crlfDelay: Infinity
	})
	let isDep = false
	const depStartRegex = /"dependencies"\s*:/
	const depEndRegex = /}/

	let promise = new Promise<DepInfo[]>((resolve, reject) => {
		const reflects: DepInfo[] = []
		rl.on('line', line => {
			const depRegex =
				/"([a-z0-9\-\/@]+)"\s*:\s*"[\^~]?(\d+(?:\.[\dx]+)?(?:[\.\dx]*)?(?:\-[a-z0-9\.]+)?)"/g
			lineNumber++
			// dep block
			if (depStartRegex.test(line)) {
				isDep = true
			}
			if (isDep) {
				const res = depRegex.exec(line.trim())
				if (res) {
					reflects.push({
						name: res[1],
						version: res[2],
						length: line.length,
						lineNumber
					})
				}
				if (depEndRegex.test(line)) {
					isDep = false
					resolve(reflects)
				}
			}
		})
	})
	return promise
}
