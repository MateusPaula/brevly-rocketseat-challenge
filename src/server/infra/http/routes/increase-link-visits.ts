import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod'
import z from 'zod'
import { increaseLinkVisits } from '@/server/functions/increase-link-visits'
import { isRight, unwrapEither } from '../../shared/either'

export const increaseLinkVisitsRoute: FastifyPluginAsyncZod = async server => {
  server.post(
    '/links/visits',
    {
      schema: {
        summary: 'Increase link visits',
        tags: ['links'],
        body: z.object({
          shortUrl: z.string(),
        }),
        response: {
          200: z.object({
            originalUrl: z.string(),
            shortUrl: z.string(),
            visits: z.number(),
          }),
          404: z.object({
            message: z.string(),
          }),
        },
      },
    },
    async (request, reply) => {
      const { shortUrl } = request.body

      const result = await increaseLinkVisits({ shortUrl })

      if (isRight(result)) {
        const { originalUrl, shortUrl, visits } = unwrapEither(result)

        return reply.status(200).send({
          originalUrl,
          shortUrl,
          visits,
        })
      }

      const error = unwrapEither(result)

      switch (error.constructor.name) {
        case 'LinkNotFoundError':
          return reply.status(404).send({
            message: 'Link not found',
          })
      }
    }
  )
}
