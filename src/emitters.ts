export class Emitters {
	private static instance: Emitters = new Emitters()
	static getInstance() {
		return this.instance
	}
	private map: Map<string, Function[]>
	constructor() {
		this.map = new Map()
	}

	on(event: string, fn: (...args: any[]) => void) {
		const preFns = this.map.get(event)
		if (preFns) {
			this.map.set(event, [...preFns, fn])
		} else {
			this.map.set(event, [fn])
		}
	}

	off(event: string) {
		this.map.delete(event)
	}

	emit(event: string, ...payload: any[]) {
		const listeners = this.map.get(event)
		listeners?.forEach(fn => {
			fn(...payload)
		})
	}

	clear() {
		// this.map.clear()
	}
}
