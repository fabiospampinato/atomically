
/* IMPORT */

import {Disposer} from '../types';

/* VARIABLES */

const Queues: Record<string, Function[] | undefined> = {};

/* TASKER */

//TODO: Maybe publish this as a standalone package

const Tasker = {

  next: ( id: string ): void => {

    const queue = Queues[id];

    if ( !queue ) return;

    queue.shift ();

    const job = queue[0];

    if ( job ) {

      job ( () => Tasker.next ( id ) );

    } else {

      delete Queues[id];

    }

  },

  task: ( id: string ): Promise<Disposer> => {

    return new Promise ( resolve => {

      let queue = Queues[id];

      if ( !queue ) queue = Queues[id] = [];

      queue.push ( resolve );

      if ( queue.length > 1 ) return;

      resolve ( () => Tasker.next ( id ) );

    });

  }

};

/* EXPORT */

export default Tasker;
