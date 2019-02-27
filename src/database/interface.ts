export interface KeyValueDataBase {
  save: (key: string, value: object) => Promise<void>;
  load: (key: string) => Promise<object>;
  list: () => Promise<string[]>;
  remove: (key: string) => Promise<void>;
}
