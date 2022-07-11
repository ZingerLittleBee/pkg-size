import { homedir } from 'os'

export const REBUILD_COMMAND_ID = 'pkg-size.rebuild'

// decoration margin-left: 20px
export const INDENT = 20

// decoration color: #22C55E
export const TEXT_COLOR = '#22C55E'

export const PKG_SIZE_CONFIG_NAME = '.pkg-size'
export const PKG_SIZE_CONFIG_PATH = `${homedir()}/${PKG_SIZE_CONFIG_NAME}`

export const DEFAULT_BASE_URL = 'https://bundlephobia.com/api/size'
