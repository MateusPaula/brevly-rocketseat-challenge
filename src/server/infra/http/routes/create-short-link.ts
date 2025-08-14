import type { FastifyPluginAsyncZod } from "fastify-type-provider-zod";
import z from "zod";
import { db } from "@/server/infra/db";
import { schema } from "@/server/infra/db/schemas";
import { createLink } from "@/server/functions/create-short-link";

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
        const { originalUrl } = request.body

        if (!originalUrl) {
            return reply.status(400).send({
                message: 'Original URL is required.',
            })
        }

        const { shortUrl } = await createLink({ originalUrl });

        return reply.status(201).send({
            shortUrl,
        })
    })
}