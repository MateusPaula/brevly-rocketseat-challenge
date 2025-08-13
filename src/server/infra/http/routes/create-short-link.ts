import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import z from "zod";
import { db } from "@/server/infra/db";
import { schema } from "@/server/infra/db/schemas";

export const createShortLink: FastifyPluginAsyncZod = async (server) => {
    server.post('/links', {
        schema: {
            summary: 'Create short link',
            tags: ['links'],
            body: z.object({
                originalUrl: z.string().url(),
            }),
            response: {
                201: z.object({
                    shortUrl: z.string(),
                }),
                409: z.object({
                    message: z.string().describe('The original URL already exists'),
                })
            }
        }
    }, async (request, reply) => {
        await db.insert(schema.links).values({
            originalUrl: 'https://www.google.com',
            shortUrl: 'https://brev.ly/google',
            visits: 0,
        })
        return reply.status(201).send({
            shortUrl: 'https://brev.ly/google',
        })
    })
}