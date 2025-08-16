import { eq } from 'drizzle-orm'
import z from 'zod'
import { db } from '@/server/infra/db'
import { schema } from '@/server/infra/db/schemas'
import { type Either, makeLeft, makeRight } from '@/server/infra/shared/either'
import { LinkNotFoundError } from './errors/link-not-found'

const increaseLinkVisitsInput = z.object({
  shortUrl: z.string(),
})

type IncreaseLinkVisitsOutput = {
  originalUrl: string
  shortUrl: string
  visits: number
}

type IncreaseLinkVisitsInput = z.input<typeof increaseLinkVisits>

export async function increaseLinkVisits(
  input: IncreaseLinkVisitsInput
): Promise<Either<LinkNotFoundError, IncreaseLinkVisitsOutput>> {
  const { shortUrl } = increaseLinkVisitsInput.parse(input)

  // TODO: Get the link from database and increase the visits
  const link = await db
    .select()
    .from(schema.links)
    .where(eq(schema.links.shortUrl, shortUrl))
    .limit(1)

  if (!link.length) {
    return makeLeft(new LinkNotFoundError())
  }

  await db
    .update(schema.links)
    .set({
      visits: link[0].visits + 1,
    })
    .where(eq(schema.links.shortUrl, shortUrl))

  const { originalUrl, visits } = link[0]

  return makeRight({
    originalUrl,
    shortUrl,
    visits: visits + 1,
  })
}
