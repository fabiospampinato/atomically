
/* IMPORT */

import * as fs from 'fs';
import {promisify} from 'util';
import {IS_USER_ROOT} from '../consts';
import {Exception} from '../types';
import attemptify from './attemptify';

/* FS */

const onChownError = ( error: Exception ): void => { //URL: https://github.com/isaacs/node-graceful-fs/blob/master/polyfills.js#L315-L342

  const {code} = error;

  if ( code === 'ENOSYS' ) return;

  if ( !IS_USER_ROOT && ( code === 'EINVAL' || code === 'EPERM' ) ) return;

  throw error;

};

const FS = {

  chmod: promisify ( fs.chmod ),
  chown: promisify ( fs.chown ),
  close: promisify ( fs.close ),
  fsync: promisify ( fs.fsync ),
  open: promisify ( fs.open ),
  realpath: promisify ( fs.realpath ),
  rename: promisify ( fs.rename ),
  stat: promisify ( fs.stat ),
  write: promisify ( fs.write ),

  chmodSync: attemptify ( fs.chmodSync, onChownError ),
  chownSync: attemptify ( fs.chownSync, onChownError ),
  closeSync: fs.closeSync,
  closeSyncLoose: attemptify ( fs.closeSync ),
  fsyncSync: fs.fsyncSync,
  openSync: fs.openSync,
  realpathSync: attemptify ( fs.realpathSync ),
  renameSync: fs.renameSync,
  statSync: attemptify ( fs.statSync ),
  writeSync: fs.writeSync,

  onChownError

};

/* EXPORT */

export default FS;
