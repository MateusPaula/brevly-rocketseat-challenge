import { fastify } from "fastify";
import {fastifyCors} from '@fastify/cors';
import {fastifySwagger} from '@fastify/swagger';
import swaggerUI from '@fastify/swagger-ui';
import { validatorCompiler, serializerCompiler, jsonSchemaTransform, hasZodFastifySchemaValidationErrors } from "fastify-type-provider-zod";
import { getAllLinksRoute } from "@/server/infra/http/routes/get-all-links";
import { increaseLinkViewRoute } from "@/server/infra/http/routes/increase-link-views";


const server = fastify();

server.setValidatorCompiler(validatorCompiler);
server.setSerializerCompiler(serializerCompiler)


server.setErrorHandler((error, request, reply) => {
    if (hasZodFastifySchemaValidationErrors(error)) {
        return reply.status(400).send({
            message: 'Validation error',
            issues: error.validation
        })
    }

    return reply.status(500).send({ message: 'Internal server error' })
})

server.register(fastifyCors, {
    origin: '*'
})

server.register(fastifySwagger, {
    openapi: {
        info: {
            title: 'Link Shortener API',
            version: '1.0.0'
        }
    },
    transform: jsonSchemaTransform,
})

server.register(swaggerUI, {
    routePrefix: '/docs'
})

server.register(getAllLinksRoute)
server.register(increaseLinkViewRoute)

server.listen({ port: 3333 }).then(() => {
    console.log('HTTP server running!')
})