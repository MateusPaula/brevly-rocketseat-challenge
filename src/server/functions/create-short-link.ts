import { eq } from 'drizzle-orm'
import z from 'zod'

import { db } from '@/server/infra/db'
import { schema } from '@/server/infra/db/schemas'
import { type Either, makeLeft, makeRight } from '@/server/infra/shared/either'
import { ShortLinkAlreadyExistsError } from './errors/short-link-already-exists'

const createShortLink = z.object({
  originalUrl: z.url(),
  shortUrl: z.string(),
})

type CreateShortLink = z.input<typeof createShortLink>

async function checkIfShortUrlExists(shortUrl: string): Promise<boolean> {
  const existingLinks = await db
    .select()
    .from(schema.links)
    .where(eq(schema.links.shortUrl, shortUrl))
  return existingLinks.length > 0
}

export async function createLink(
  input: CreateShortLink
): Promise<
  Either<
    ShortLinkAlreadyExistsError,
    { shortUrl: string; originalUrl: string; visits: number }
  >
> {
  const { originalUrl, shortUrl } = createShortLink.parse(input)

  const shortUrlExists = await checkIfShortUrlExists(shortUrl)

  if (shortUrlExists) {
    return makeLeft(new ShortLinkAlreadyExistsError())
  }

  await db.insert(schema.links).values({
    originalUrl: originalUrl.toString(),
    shortUrl: shortUrl,
    visits: 0,
  })

  return makeRight({
    shortUrl,
    originalUrl,
    visits: 0,
  })
}
