import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod'
import { z } from 'zod'

import { createLink } from '@/server/functions/create-short-link'
import { isRight, unwrapEither } from '../../shared/either'

export const createShortLinkRoute: FastifyPluginAsyncZod = async server => {
  server.post(
    '/links',
    {
      schema: {
        summary: 'Create short link',
        tags: ['links'],
        body: z.object({
          originalUrl: z.url(),
          shortUrl: z.string(),
        }),
        response: {
          201: z.object({
            shortUrl: z.string(),
            originalUrl: z.string(),
            visits: z.number(),
          }),
          409: z.object({
            message: z.string().describe('The original URL already exists'),
          }),
        },
      },
    },
    async (request, reply) => {
      const { originalUrl, shortUrl } = request.body

      const result = await createLink({ originalUrl, shortUrl })

      if (isRight(result)) {
        const { shortUrl, originalUrl, visits } = unwrapEither(result)
        return reply.status(201).send({
          shortUrl,
          originalUrl,
          visits,
        })
      }

      const error = unwrapEither(result)

      switch (error.constructor.name) {
        case 'ShortLinkAlreadyExistsError':
          return reply.status(409).send({
            message: 'The short link already exists',
          })
      }
    }
  )
}
