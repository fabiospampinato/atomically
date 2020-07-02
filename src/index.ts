
/* IMPORT */

import {DEFAULT_ENCODING, DEFAULT_MODE, IS_POSIX, NOOP} from './consts';
import FS from './utils/fs';
import Lang from './utils/lang';
import Tasker from './utils/tasker';
import Temp from './utils/temp';
import {Path, Data, Disposer, Options, Callback} from './types';

/* ATOMICALLY */

const writeFile = ( filePath: Path, data: Data, options?: Options | Callback, callback?: Callback ): Promise<void> => {

  if ( Lang.isFunction ( options ) ) return writeFile ( filePath, data, {}, options );

  const promise = writeFileAsync ( filePath, data, options );

  if ( callback ) promise.then ( callback, callback );

  return promise;

};

const writeFileAsync = async ( filePath: Path, data: Data, options: Options = {} ): Promise<void> => {

  if ( Lang.isString ( options ) ) return writeFileAsync ( filePath, data, { encoding: options } );

  let taskDisposer: Disposer | null = null,
      tempDisposer: Disposer | null = null,
      tempPath: string | null = null,
      fd: number | null = null;

  try {

    taskDisposer = await Tasker.task ( filePath );

    filePath = await FS.realpath ( filePath ).catch ( NOOP ) || filePath;

    [tempPath, tempDisposer] = Temp.get ( filePath );

    const useStatChown = IS_POSIX && Lang.isUndefined ( options.chown ),
          useStatMode = Lang.isUndefined ( options.mode );

    if ( useStatChown || useStatMode ) {

      const stat = await FS.stat ( filePath ).catch ( NOOP );

      if ( stat ) {

        if ( useStatChown ) options.chown = { uid: stat.uid, gid: stat.gid };

        if ( useStatMode ) options.mode = stat.mode;

      }

    }

    fd = await FS.open ( tempPath, 'w', options.mode || DEFAULT_MODE );

    if ( options.tmpfileCreated ) options.tmpfileCreated ( tempPath );

    if ( Lang.isString ( data ) ) {

      await FS.write ( fd, data, 0, options.encoding || DEFAULT_ENCODING );

    } else if ( !Lang.isUndefined ( data ) ) {

      await FS.write ( fd, data, 0, data.length, 0 );

    }

    if ( options.fsync !== false ) await FS.fsync ( fd );

    await FS.close ( fd );

    fd = null;

    if ( options.chown ) await FS.chown ( tempPath, options.chown.uid, options.chown.gid ).catch ( FS.onChownError );

    if ( options.mode ) await FS.chmod ( tempPath, options.mode ).catch ( FS.onChownError );

    await FS.rename ( tempPath, filePath );

    tempDisposer ();

    tempPath = null;

  } finally {

    if ( fd ) await FS.close ( fd ).catch ( NOOP );

    if ( tempPath ) Temp.purge ( tempPath );

    if ( taskDisposer ) taskDisposer ();

  }

};

const writeFileSync = ( filePath: Path, data: Data, options: Options = {} ): void => {

  if ( Lang.isString ( options ) ) return writeFileSync ( filePath, data, { encoding: options } );

  let tempDisposer: Disposer | null = null,
      tempPath: string | null = null,
      fd: number | null = null;

  try {

    filePath = FS.realpathSync ( filePath ) || filePath;

    [tempPath, tempDisposer] = Temp.get ( filePath );

    const useStatChown = IS_POSIX && Lang.isUndefined ( options.chown ),
          useStatMode = Lang.isUndefined ( options.mode );

    if ( useStatChown || useStatMode ) {

      const stat = FS.statSync ( filePath );

      if ( stat ) {

        if ( useStatChown ) options.chown = { uid: stat.uid, gid: stat.gid };

        if ( useStatMode ) options.mode = stat.mode;

      }

    }

    fd = FS.openSync ( tempPath, 'w', options.mode || DEFAULT_MODE );

    if ( options.tmpfileCreated ) options.tmpfileCreated ( tempPath );

    if ( Lang.isString ( data ) ) {

      FS.writeSync ( fd, data, 0, options.encoding || DEFAULT_ENCODING );

    } else if ( !Lang.isUndefined ( data ) ) {

      FS.writeSync ( fd, data, 0, data.length, 0 );

    }

    if ( options.fsync !== false ) FS.fsyncSync ( fd );

    FS.closeSync ( fd );

    fd = null;

    if ( options.chown ) FS.chownSync ( tempPath, options.chown.uid, options.chown.gid );

    if ( options.mode ) FS.chmodSync ( tempPath, options.mode );

    FS.renameSync ( tempPath, filePath );

    tempDisposer ();

    tempPath = null;

  } finally {

    if ( fd ) FS.closeSyncLoose ( fd );

    if ( tempPath ) Temp.purge ( tempPath );

  }

};

/* EXPORT */

export {writeFile, writeFileSync};