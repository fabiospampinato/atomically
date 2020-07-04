
/* CONSTS */

const DEFAULT_ENCODING = 'utf8';

const DEFAULT_MODE = 0o666;

const DEFAULT_OPTIONS = {};

const DEFAULT_TIMEOUT_ASYNC = 5000;

const DEFAULT_TIMEOUT_SYNC = 100;

const IS_POSIX = !!process.getuid;

const IS_USER_ROOT = process.getuid ? !process.getuid () : false;

const LIMIT_BASENAME_LENGTH = 128; //TODO: fetch the real limit from the filesystem //TODO: fetch the whole-path length limit too

const NOOP = () => {};

/* EXPORT */

export {DEFAULT_ENCODING, DEFAULT_MODE, DEFAULT_OPTIONS, DEFAULT_TIMEOUT_ASYNC, DEFAULT_TIMEOUT_SYNC, IS_POSIX, IS_USER_ROOT, LIMIT_BASENAME_LENGTH, NOOP};
