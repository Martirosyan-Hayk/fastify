import { type FastifyInstance } from 'fastify';

import { HelloWorldController } from './helloWorld/hello-world.controller';


export function loadRouts(fastify: FastifyInstance, _options, done) {
  new HelloWorldController(fastify).registerRoutes();
  done();
}
