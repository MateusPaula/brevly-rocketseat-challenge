import { FastifyPluginAsyncZod } from 'fastify-type-provider-zod'
import z from 'zod'
import { deleteLink } from '@/server/functions/delete-link'
import { isLeft, isRight, unwrapEither } from '../../shared/either'

export const deleteLinkRoute: FastifyPluginAsyncZod = async server => {
  server.delete(
    '/:shortUrl',
    {
      schema: {
        summary: 'Delete a link',
        tags: ['links'],
        params: z.object({
          shortUrl: z.string(),
        }),
        response: {
          200: z.object({
            message: z.string().describe('The link was deleted successfully'),
          }),
          404: z.object({
            message: z.string().describe('The link was not found'),
          }),
        },
      },
    },
    async (request, reply) => {
      const { shortUrl } = request.params

      const result = await deleteLink({
        shortUrl,
      })

      if (isRight(result)) {
        const { shortUrl } = unwrapEither(result)
        return reply.status(200).send({
          message: `The link ${shortUrl} was deleted successfully`,
        })
      }

      const error = unwrapEither(result)

      switch (error.constructor.name) {
        case 'LinkNotFoundError':
          return reply.status(404).send({
            message: 'The link was not found',
          })
      }
    }
  )
}
