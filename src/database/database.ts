import { readFile, writeFile, mkdirSync, existsSync, readdir, unlink } from 'fs';
import { promisify } from 'util';
import { KeyValueDataBase } from './interface';

const readFilePromise = promisify(readFile);
const writeFilePromise = promisify(writeFile);
const readDirPromise = promisify(readdir);
const unlinkPromise = promisify(unlink);

const PATH = './database';
if (!existsSync(PATH)) mkdirSync(PATH);

const fsDataBase : KeyValueDataBase = {
  save: (key, value) => writeFilePromise(`${PATH}/${key}.bin`, JSON.stringify(value)),
  load: async (key) => {
    const rawValue = await readFilePromise(`${PATH}/${key}.bin`);
    return JSON.parse(rawValue.toString());
  },
  list: () => readDirPromise(PATH),
  remove: key => unlinkPromise(key),
};

export default fsDataBase;
