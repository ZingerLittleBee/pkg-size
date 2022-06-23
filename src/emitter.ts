import mitt from './mitt'

let FINISH = Symbol('finish')
let DONE = Symbol('done')

const emitter = mitt()

export const depListener = (
	finishEvent?: (key: string) => void,
	doneEvent?: () => void
) => {
	emitter.on(FINISH, key => finishEvent?.(key as string))
	emitter.on(DONE, () => doneEvent?.())
}

export const depFinish = (key: string) => {
	emitter.emit(FINISH, key)
}

export const depDone = () => {
	emitter.emit(DONE)
}

export const depClear = () => {
	emitter.off(FINISH)
	emitter.off(DONE)
}

export const clear = () => {
	emitter.all.clear()
}
