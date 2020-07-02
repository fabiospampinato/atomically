
/* TYPES */

type Callback = ( err: Exception | void ) => any;

type Data = Buffer | string | undefined;

type Disposer = () => void;

type Exception = NodeJS.ErrnoException;

type Options = string | {
  /* BUILT-INS */
  encoding?: string | null,
  flag?: string,
  mode?: string | number,
  /* EXTRAS */ //TODO
  chown?: {
    uid: number,
    gid: number
  },
  fsync?: boolean,
  tmpfileCreated?: ( filePath: string ) => any
};

type Path = string;

/* EXPORT */

export {Callback, Data, Disposer, Exception, Options, Path};
