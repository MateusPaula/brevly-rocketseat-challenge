import type { FastifyPluginAsyncZod } from 'fastify-type-provider-zod'
import z from 'zod'
import { getLinks } from '@/server/functions/get-links'
import { unwrapEither } from '../../shared/either'

export const getLinksRoute: FastifyPluginAsyncZod = async server => {
  server.get(
    '/links',
    {
      schema: {
        summary: 'List all links',
        tags: ['links'],
        querystring: z.object({
          searchQuery: z.string().optional(),
          sortBy: z.enum(['createdAt', 'visits']).optional(),
          sortDirection: z.enum(['asc', 'desc']).optional(),
          page: z.coerce.number().default(1),
          pageSize: z.coerce.number().default(20),
        }),
        response: {
          200: z.object({
            links: z.array(
              z.object({
                shortUrl: z.string(),
                originalUrl: z.string(),
                createdAt: z.date(),
                visits: z.number(),
              })
            ),
            total: z.number(),
          }),
        },
      },
    },
    async (request, reply) => {
      const { searchQuery, sortBy, sortDirection, page, pageSize } =
        request.query
      const result = await getLinks({
        searchQuery,
        sortBy,
        sortDirection,
        page,
        pageSize,
      })

      const { links, total } = unwrapEither(result)

      return reply.status(200).send({
        links,
        total,
      })
    }
  )
}
