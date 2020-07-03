
/* IMPORT */

import * as fs from 'fs';
import {promisify} from 'util';
import {attemptifyAsync, attemptifySync} from './attemptify';
import Handlers from './fs_handlers';

/* FS */

const FS = {

  close: promisify ( fs.close ),
  fsync: promisify ( fs.fsync ),
  open: promisify ( fs.open ),
  rename: promisify ( fs.rename ),
  write: promisify ( fs.write ),

  chmodAttempt: attemptifyAsync ( promisify ( fs.chmod ), Handlers.onChownError ),
  chownAttempt: attemptifyAsync ( promisify ( fs.chown ), Handlers.onChownError ),
  closeAttempt: attemptifyAsync ( promisify ( fs.close ) ),
  realpathAttempt: attemptifyAsync ( promisify ( fs.realpath ) ),
  statAttempt: attemptifyAsync ( promisify ( fs.stat ) ),
  unlinkAttempt: attemptifyAsync ( promisify ( fs.unlink ) ),

  closeSync: fs.closeSync,
  fsyncSync: fs.fsyncSync,
  openSync: fs.openSync,
  renameSync: fs.renameSync,
  writeSync: fs.writeSync,

  chmodSyncAttempt: attemptifySync ( fs.chmodSync, Handlers.onChownError ),
  chownSyncAttempt: attemptifySync ( fs.chownSync, Handlers.onChownError ),
  closeSyncAttempt: attemptifySync ( fs.closeSync ),
  realpathSyncAttempt: attemptifySync ( fs.realpathSync ),
  statSyncAttempt: attemptifySync ( fs.statSync ),
  unlinkSyncAttempt: attemptifySync ( fs.unlinkSync )

};

/* EXPORT */

export default FS;
