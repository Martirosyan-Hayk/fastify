import { HelloWorldService } from './hello-world.service';
import * as nats from 'nats';


export class HelloWorldHandler {
  private helloWorldService: HelloWorldService;

  constructor(
  ) {
    this.helloWorldService = new HelloWorldService()
  }

  async registerHandlers() {
    const nc = await nats.connect();

    nc.subscribe('auth.helloWorld', {
      callback: (err, msg) => this.helloWorldService.helloWorld(err, msg),
    });
  }
}
