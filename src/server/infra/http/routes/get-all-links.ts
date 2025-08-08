import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import z from "zod";

// type LinkInfo = {
//     id: string;
//     shortUrl: string;
//     originalUrl: string;
//     createdAt: string;
//     updatedAt: string;
//     visits: number;
// }

// interface UserLink {
//     userId: string;
//     links: LinkInfo[];
// }

export const getAllLinksRoute: FastifyPluginAsyncZod = async (server) => {
    server.get('/links', {
        schema: {
            summary: 'List all links',
            tags: ['links'],
            // todo: add query strings
            response: {
                200: z.object({
                    userId: z.string().uuid(),
                    links: z.array(z.object({
                        id: z.string().uuid(),
                        shortUrl: z.string(),
                        originalUrl: z.string(),
                        createdAt: z.string().datetime(),
                        updatedAt: z.string().datetime(),
                        visits: z.number().int(),
                    }))
                })
            }
        }
    }, async (request, reply) => {
        return reply.status(200).send({
            userId: '5dade12a-4753-4c99-a145-b8fafde9f004',
            links: [
                {
                    id: '5dade12a-4753-4c99-a145-b8fafde9f004',
                    shortUrl: 'https://short.url',
                    originalUrl: 'https://original.url',
                    createdAt: new Date().toISOString(),
                    updatedAt: new Date().toISOString(),
                    visits: 100,
                }
            ]
        })
    })
}