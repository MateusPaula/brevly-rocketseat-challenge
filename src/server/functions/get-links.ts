import { asc, count, desc, ilike } from 'drizzle-orm'
import { z } from 'zod'
import { db } from '@/server/infra/db'
import { schema } from '@/server/infra/db/schemas'
import { type Either, makeRight } from '@/server/infra/shared/either'

const getLinksInput = z.object({
  searchQuery: z.string().optional(),
  sortBy: z.enum(['createdAt', 'visits']).optional(),
  sortDirection: z.enum(['asc', 'desc']).optional(),
  page: z.coerce.number().default(1),
  pageSize: z.coerce.number().default(20),
})

type GetLinksInput = z.input<typeof getLinksInput>

type GetLinksOutput = {
  links: {
    shortUrl: string
    originalUrl: string
    createdAt: Date
    visits: number
  }[]
  total: number
}

export async function getLinks(
  input: GetLinksInput
): Promise<Either<never, GetLinksOutput>> {
  const { searchQuery, sortBy, sortDirection, page, pageSize } =
    getLinksInput.parse(input)

  const [links, [{ total }]] = await Promise.all([
    db
      .select({
        shortUrl: schema.links.shortUrl,
        originalUrl: schema.links.originalUrl,
        createdAt: schema.links.createdAt,
        visits: schema.links.visits,
      })
      .from(schema.links)
      .where(
        searchQuery
          ? ilike(schema.links.shortUrl, `%${searchQuery}%`)
          : undefined
      )
      .orderBy(fields => {
        if (sortBy && sortDirection === 'asc') {
          return asc(fields[sortBy])
        }
        if (sortBy && sortDirection === 'desc') {
          return desc(fields[sortBy])
        }
        return desc(fields.createdAt)
      })
      .offset((page - 1) * pageSize)
      .limit(pageSize),

    db
      .select({ total: count(schema.links.shortUrl) })
      .from(schema.links)
      .where(
        searchQuery
          ? ilike(schema.links.shortUrl, `%${searchQuery}%`)
          : undefined
      ),
  ])

  return makeRight({
    links,
    total,
  })
}
