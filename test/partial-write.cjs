// Regression test for silent data corruption on a partial (short) write.
//
// Background
// ----------
// `write(2)`/`pwrite(2)` are allowed to write fewer bytes than requested (a
// "short write"), and `fs.writeSync`/`fs.write` faithfully return that smaller
// count. A common real-world trigger is a nearly-full disk: one filesystem
// block still fits, so the first write succeeds partially, and only a later
// write fails with ENOSPC.
//
// Correct handling of short writes requires looping until all data is written.
//
// Expected behavior to pass the test:
// Either the full payload lands on disk, or the call throws
// (so the destination is never replaced by a truncated file).

process.setMaxListeners(1000000);

const fs = require('fs')
const path = require('path')
const {test} = require('tap')
const rimraf = require('rimraf')
const requireInject = require('require-inject')

const workdir = path.join(__dirname, path.basename(__filename, '.cjs'))
let testfiles = 0
function tmpFile () {
  return path.join(workdir, 'test-' + (++testfiles))
}

// The first write to the temp file is truncated to this many bytes; a
// realistic "one block still fits" value.
const PARTIAL_BYTES = 4096

test('setup', t => {
  rimraf.sync(workdir)
  fs.mkdirSync(workdir, {recursive: true})
  t.end()
})

// After the write, the destination must be EITHER the full new payload (the
// short write was retried until complete) OR the untouched previous file (the
// error surfaced before the rename). Anything else -- notably a truncated
// prefix of the new data -- is silent corruption.
function assertNoCorruption (t, onDisk, data, previous, threw) {
  const content = onDisk.toString('utf8')
  const full = content === data
  const preserved = content === previous
  const outcome = full
    ? `full ${data.length}-byte payload written`
    : preserved
      ? 'previous file preserved'
      : `TRUNCATED: ${onDisk.length} of ${data.length} bytes on disk` +
        (threw ? ` (error surfaced: ${threw.code || threw.message})` : ' (no error thrown)')
  t.ok(full || preserved,
    `destination must be the full payload or the preserved previous file, never a truncated mix -- got: ${outcome}`)
}

// Normalize the two write signatures `atomically` uses into { buffer, position }:
//   writeSync(fd, string, position, encoding)
//   writeSync(fd, buffer, offset, length, position)
// and return the bytes of `buffer` that should actually be written this call.
function requestedRegion (args) {
  const [, data, arg2, arg3, arg4] = args
  if (Buffer.isBuffer(data)) {
    const offset = typeof arg2 === 'number' ? arg2 : 0
    const length = typeof arg3 === 'number' ? arg3 : data.length - offset
    const position = typeof arg4 === 'number' ? arg4 : null
    return { buffer: data.subarray(offset, offset + length), position }
  }
  const position = typeof arg2 === 'number' ? arg2 : null
  const encoding = typeof arg3 === 'string' ? arg3 : 'utf8'
  return { buffer: Buffer.from(String(data), encoding), position }
}

test('sync: a short write must not silently truncate the destination', t => {
  t.plan(1)

  const previous = 'old-content'
  const file = tmpFile()
  fs.writeFileSync(file, previous)

  // Payload larger than one short write, so a single write cannot complete it.
  const data = 'b'.repeat(10000)

  // A faithful short-write emulation:
  // Honor the caller's region/position, but cap the first write to PARTIAL_BYTES.
  // Subsequent writes behave normally, so an implementation that loops will complete,
  // while one that doesn't truncates.
  let firstWrite = true
  const {writeFileSync} = requireInject('./atomically.cjs', {
    fs: Object.assign({}, fs, {
      writeSync (fd, ...rest) {
        const { buffer, position } = requestedRegion([fd, ...rest])
        const limit = firstWrite ? Math.min(PARTIAL_BYTES, buffer.length) : buffer.length
        firstWrite = false
        return fs.writeSync(fd, buffer, 0, limit, position)
      }
    })
  })

  let threw = null
  try {
    writeFileSync(file, data, { encoding: 'utf8' })
  } catch (err) {
    threw = err
  }

  assertNoCorruption(t, fs.readFileSync(file), data, previous, threw)
})

test('async: a short write must not silently truncate the destination', t => {
  t.plan(1)

  const previous = 'old-content'
  const file = tmpFile()
  fs.writeFileSync(file, previous)

  const data = 'b'.repeat(10000)

  let firstWrite = true
  const {writeFile} = requireInject('./atomically.cjs', {
    fs: Object.assign({}, fs, {
      write (fd, ...rest) {
        const cb = rest[rest.length - 1]
        const { buffer, position } = requestedRegion([fd, ...rest])
        const limit = firstWrite ? Math.min(PARTIAL_BYTES, buffer.length) : buffer.length
        firstWrite = false
        fs.write(fd, buffer, 0, limit, position, cb)
      }
    })
  })

  writeFile(file, data, { encoding: 'utf8' }, err => {
    assertNoCorruption(t, fs.readFileSync(file), data, previous, err)
  })
})

test('cleanup', t => {
  rimraf.sync(workdir)
  t.end()
})
