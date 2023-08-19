import { type FastifyInstance } from 'fastify';
import { HelloWorldService } from './hello-world.service';

export class HelloWorldController {
  private helloWorldService: HelloWorldService;

  constructor(
    private fastify: FastifyInstance,
  ) {
    this.helloWorldService = new HelloWorldService()
  }

  registerRoutes() {
    this.fastify.route({
      method: 'GET',
      url: '/hello-world',
      schema: {
        // swagger options
      },
      handler: this.helloWorldService.helloWorld,
    });

  }
}
