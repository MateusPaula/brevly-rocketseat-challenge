import { FastifyPluginAsyncZod } from "fastify-type-provider-zod"
import z from "zod"


export const increaseLinkViewRoute: FastifyPluginAsyncZod = async (server) => {
    server.post('/links/:id/views', {
        schema: {
            title: 'Increase link views',
            tags: ['links'],
            body: z.object({
                id: z.string().uuid(),
            })
        }
    }, async( request, reply ) => {
        return reply.status(200).send({
            message: 'Link views increased'
        })
    })
}