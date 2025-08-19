import { eq } from 'drizzle-orm'
import { z } from 'zod'
import { db } from '@/server/infra/db'
import { schema } from '@/server/infra/db/schemas'
import { type Either, makeLeft, makeRight } from '@/server/infra/shared/either'
import { LinkNotFoundError } from './errors/link-not-found'

const deleteLinkInput = z.object({
  shortUrl: z.string(),
})

type DeleteLinkOutput = {
  shortUrl: string
}

type DeleteLinkInput = z.input<typeof deleteLinkInput>

export async function deleteLink(
  input: DeleteLinkInput
): Promise<Either<LinkNotFoundError, DeleteLinkOutput>> {
  const { shortUrl } = deleteLinkInput.parse(input)

  const deletedLinks = await db
    .delete(schema.links)
    .where(eq(schema.links.shortUrl, shortUrl))
    .returning()

  if (!deletedLinks.length) {
    return makeLeft(new LinkNotFoundError())
  }

  return makeRight({
    shortUrl: deletedLinks[0].shortUrl,
  })
}
