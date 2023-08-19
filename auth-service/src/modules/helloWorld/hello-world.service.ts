import { HelloWorldDto } from "common-crm";

export class HelloWorldService {
  constructor() {}


  async helloWorld(err, msg) {
    if(err){
      throw err;
    }

    msg.respond(JSON.stringify( HelloWorldDto.create({ value: 'Hello World' })));
  }

}
