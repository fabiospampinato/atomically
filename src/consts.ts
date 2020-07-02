
/* CONSTS */

const DEFAULT_ENCODING = 'utf8';

const DEFAULT_MODE = 0o666;

const IS_POSIX = !!process.getuid;

const IS_USER_ROOT = process.getuid ? !process.getuid () : false;

const NOOP = () => {};

/* EXPORT */

export {DEFAULT_ENCODING, DEFAULT_MODE, IS_POSIX, IS_USER_ROOT, NOOP};
