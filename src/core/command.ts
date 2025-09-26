import { BaseCommand } from '../types/command.js'
import { RESULT_TYPE_SYMBOL } from './constants.js'

export class Command<T> implements BaseCommand {
  declare readonly [RESULT_TYPE_SYMBOL]: T
}
