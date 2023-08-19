import { type FastifyInstance } from 'fastify';

import { HelloWorldHandler } from './helloWorld/hello-world.handler';


export function loadHandlers(_fastify: FastifyInstance, _options, done) {
  new HelloWorldHandler().registerHandlers()
  done();
}
