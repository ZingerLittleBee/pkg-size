import BuildCache from './buildCache'
import Config from './config'
import Decoration from './decoration'
import FileHash from './fileHash'
import ParsedDep from './parsedDep'

export const getParsedDep = () => ParsedDep.getInstance()

export const getBuildCache = async () => BuildCache.getInstance()

export const getFileHash = () => FileHash.getInstance()

export const getDecoration = () => Decoration.getInstance()

export const getConfig = async () => Config.getInstance()
