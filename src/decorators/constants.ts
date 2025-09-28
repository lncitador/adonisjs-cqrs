export const COMMAND_METADATA = '__command__'
export const COMMAND_HANDLER_METADATA = '__command_handler__'
export const QUERY_METADATA = '__query__'
export const QUERY_HANDLER_METADATA = '__query_handler__'

export const METADATA_MAP = {
  command: {
    subject: COMMAND_METADATA,
    handler: COMMAND_HANDLER_METADATA,
  },
  query: {
    subject: QUERY_METADATA,
    handler: QUERY_HANDLER_METADATA,
  },
}
