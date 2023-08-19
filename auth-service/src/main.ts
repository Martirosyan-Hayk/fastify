import fastify from 'fastify';

import { loadHandlers } from './modules/index';

// eslint-disable-next-line canonical/no-unused-exports
export async function start() {
  const app = fastify({
    logger: true,
  });

  // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-require-imports, @typescript-eslint/no-var-requires
  await app.register(require('fastify-nats'), {
    // url: 'nats:demo.nats.io:4222',
    Port: 4222,
    queue: 'auth_queue',
  });

  app.register(loadHandlers);
  app.listen(
    {
      port: 1234,
    },
    (err: Error | null, address: string) => {
      if (err) {
        app.log.error(err);
      }

      app.log.info(`server running on ${address}`);
    },
  );
  console.info('Microservice started successfully');

  // const nc = await nats.connect();
  // nc.subscribe('payment.completed', {
  //   queue: 'auth_queue',
  //   callback(_err, msg) {
  //     console.info(msg);
  //     console.log(msg.subject.toString());
  //     console.log(msg.data.toString());
  //     console.log(msg.data);
  //   },
  // });

  return app;
}

// eslint-disable-next-line unicorn/prefer-top-level-await
void start();
