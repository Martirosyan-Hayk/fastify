import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import fastifyJwt from '@fastify/jwt';
import rateLimit from '@fastify/rate-limit';
import dotenv from 'dotenv';
import fastify from 'fastify';

import { loadRouts } from './modules/index';
import {setupSwagger} from 'common-crm';

dotenv.config();

// eslint-disable-next-line canonical/no-unused-exports
export async function start() {
  const app = fastify({
    logger: true,
  });

  await app.register(cors, {});
  await app.register(helmet);
  await app.register(rateLimit, { max: 100 });

  await app.register(fastifyJwt, {
    secret: {
      private: process.env.JWT_PRIVATE_KEY!,
      public: process.env.JWT_PUBLIC_KEY!,
    },
    sign: {
      algorithm: 'RS256',
    },
    verify: {
      algorithms: ['RS256'],
    },
  });

  if (process.env.ENABLE_DOCUMENTATION) {
    await setupSwagger(app);
  }

  await app.register(loadRouts);

  app.listen(
    {
      port: Number(process.env.PORT!),
    },
    (err: Error | null, address: string) => {
      if (err) {
        app.log.error(err);
      }

      app.log.info(`server running on ${address}`);
    },
  );

  return app;
}

// eslint-disable-next-line unicorn/prefer-top-level-await
void start();
