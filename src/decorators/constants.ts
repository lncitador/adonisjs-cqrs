export const COMMAND_METADATA = '__command__'
export const COMMAND_HANDLER_METADATA = '__commandHandler__'

// Mapeia o tipo de handler para suas chaves de metadados específicas
export const METADATA_MAP = {
  command: {
    handler: COMMAND_HANDLER_METADATA,
    subject: COMMAND_METADATA,
  },
  // query: { handler: QUERY_HANDLER_METADATA, subject: QUERY_METADATA },
} as const
