import mitt from './mitt'

let FINISH = Symbol('finish')
let DONE = Symbol('done')

const emitter = mitt()

export const listener = (
	finishEvent?: (key: string) => void,
	doneEvent?: () => void
) => {
	emitter.on(FINISH, key => finishEvent?.(key as string))
	emitter.on(DONE, () => doneEvent?.())
}

export const finish = (key: string) => {
	emitter.emit(FINISH, key)
}

export const done = () => {
	emitter.emit(DONE)
}

export const clear = () => {
	emitter.all.clear()
}
