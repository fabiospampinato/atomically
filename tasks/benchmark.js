
/* IMPORT */

const os = require ( 'os' ),
      path = require ( 'path' ),
      writeFileAtomic = require ( 'write-file-atomic' ),
      {writeFile, writeFileSync} = require ( '../dist' );

/* BENCHMARK */

const DST = path.join ( os.tmpdir (), 'atomically-temp.txt' ),
      ITERATIONS = 250;

const runSingleAsync = async ( name, fn, buffer ) => {
  console.time ( name );
  for ( let i = 0; i < ITERATIONS; i++ ) {
    await new Promise ( cb => fn ( DST, buffer, cb ) );
  }
  console.timeEnd ( name );
};

const runSingleSync = async ( name, fn, buffer ) => {
  console.time ( name );
  for ( let i = 0; i < ITERATIONS; i++ ) {
    fn ( DST, buffer );
  }
  console.timeEnd ( name );
};

const runAll = async ( name, buffer ) => {
  await runSingleAsync ( `${name} -> async -> write-file-atomic`, writeFileAtomic, buffer );
  await runSingleAsync ( `${name} -> async -> write-file-atomic (fast)`, ( p, b, c ) => writeFileAtomic ( p, b, { mode: false, chown: false, fsync: false }, c ), buffer );
  await runSingleAsync ( `${name} -> async -> atomically`, writeFile, buffer );
  await runSingleAsync ( `${name} -> async -> atomically (fast)`, ( p, b, c ) => writeFile ( p, b, { mode: false, chown: false, fsync: false }, c ), buffer );
  runSingleSync ( `${name} -> sync -> write-file-atomic`, writeFileAtomic.sync, buffer );
  runSingleSync ( `${name} -> sync -> write-file-atomic (fast)`, ( p, b ) => writeFileAtomic.sync ( p, b, { mode: false, chown: false, fsync: false } ), buffer );
  runSingleSync ( `${name} -> sync -> atomically`, writeFileSync, buffer );
  runSingleSync ( `${name} -> sync -> atomically (fast)`, ( p, b ) => writeFileSync ( p, b, { mode: false, chown: false, fsync: false } ), buffer );
};

const run = async () => {
  await runAll ( '1000kb', Buffer.allocUnsafe ( 1000 * 1024 ) );
  console.log ( '-------------------' );
  await runAll ( '100kb', Buffer.allocUnsafe ( 100 * 1024 ) );
  console.log ( '-------------------' );
  await runAll ( '10kb', Buffer.allocUnsafe ( 10 * 1024 ) );
  console.log ( '-------------------' );
  await runAll ( '1kb', Buffer.allocUnsafe ( 1024 ) );
};

run ();
