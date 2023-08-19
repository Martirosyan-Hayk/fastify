import * as nats from 'nats';
import { HelloWorldDto } from "common-crm";

export class HelloWorldService {
  constructor() {}


  async helloWorld(_request, _reply) {
    const nc = await nats.connect();

    const response = await nc.request('auth.helloWorld');

    return HelloWorldDto.create(JSON.parse(response.data.toString()));
  }

}
