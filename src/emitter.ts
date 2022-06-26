import { Emitters } from './emitters'

const emitter = Emitters.getInstance()

export const depListener = (
	finishEvent?: (key: string) => void,
	doneEvent?: () => void
) => {
	emitter.on('finish', key => finishEvent?.(key as string))
	emitter.on('done', () => doneEvent?.())
}

export const depFinish = (key: string) => {
	emitter.emit('finish', key)
}

export const depDone = () => {
	emitter.emit('done')
}

export const depClear = () => {
	emitter.off('finish')
	emitter.off('done')
}

export const clear = () => {
	emitter.clear()
}
