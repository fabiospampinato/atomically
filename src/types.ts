
/* TYPES */

type Callback = ( err: Exception | void ) => any;

type Data = Buffer | string | undefined;

type Disposer = () => void;

type Exception = NodeJS.ErrnoException;

type Options = string | {
  chown?: { gid: number, uid: number } | false,
  encoding?: string | null,
  fsync?: boolean,
  fsyncWait?: boolean,
  mode?: string | number | false,
  schedule?: ( filePath: string ) => Promise<Disposer>,
  timeout?: number,
  tmpCreate?: ( filePath: string ) => string,
  tmpCreated?: ( filePath: string ) => any,
  tmpPurge?: boolean
};

type Path = string;

/* EXPORT */

export {Callback, Data, Disposer, Exception, Options, Path};
