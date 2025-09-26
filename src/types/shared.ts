export interface Type<T = any> extends Function {
  new (...args: any[]): T
}

export type LazyImportType<DefaultExport> = () => Promise<{
  default: Type<DefaultExport>
}>
