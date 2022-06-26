import { StatusBarAlignment, StatusBarItem, window } from 'vscode'
import { fsFormat } from './utils'

export class SizeStatusBarItem {
	private sizeStatusBarItem: StatusBarItem
	constructor() {
		this.sizeStatusBarItem = window.createStatusBarItem(
			StatusBarAlignment.Right,
			100
		)
	}

	updateStatusBarItem(size: number, commandId: string) {
		this.sizeStatusBarItem.text = `$(package) ${fsFormat(size)}`
		this.sizeStatusBarItem.tooltip = 'Click to rebuild deps.'
		this.sizeStatusBarItem.command = commandId
		this.sizeStatusBarItem.show()
	}

	hideStatusBarItem() {
		this.sizeStatusBarItem?.hide()
	}
}
