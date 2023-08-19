import { type FastifyReply, type FastifyRequest } from 'fastify';

export const createPost = (_request: FastifyRequest, reply: FastifyReply) => {
  void reply.send({ message: 'Hello, World!' });
};
