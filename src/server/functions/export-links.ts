import { stringify } from 'csv-stringify/sync'
import { ilike } from 'drizzle-orm'
import { z } from 'zod'
import { db } from '@/server/infra/db'
import { schema } from '../infra/db/schemas'
import { type Either, makeRight } from '../infra/shared/either'
import { uploadCsvToStorage } from '../infra/storage/upload-csv-to-storage'

const exportLinksInput = z.object({
  searchQuery: z.string().optional(),
})

type ExportLinksInput = z.input<typeof exportLinksInput>

type ExportLinksOutput = {
  reportUrl: string
}

export async function exportLinks(
  input: ExportLinksInput
): Promise<Either<never, ExportLinksOutput>> {
  const { searchQuery } = exportLinksInput.parse(input)

  // Buscar todos os links do banco
  const links = await db
    .select({
      shortUrl: schema.links.shortUrl,
      originalUrl: schema.links.originalUrl,
      createdAt: schema.links.createdAt,
      visits: schema.links.visits,
    })
    .from(schema.links)
    .where(
      searchQuery ? ilike(schema.links.shortUrl, `%${searchQuery}%`) : undefined
    )

  // Converter para CSV
  const csvContent = stringify(links, {
    header: true,
    columns: [
      { key: 'shortUrl', header: 'Short URL' },
      { key: 'originalUrl', header: 'Original URL' },
      { key: 'visits', header: 'Visits' },
      { key: 'createdAt', header: 'Created At' },
    ],
  })

  // Upload para o Cloudflare R2
  const { url } = await uploadCsvToStorage({
    content: csvContent,
    contentType: 'text/csv',
    folder: 'downloads',
    fileName: `links-export-${new Date().toISOString}}.csv`,
  })

  return makeRight({ reportUrl: url })
}
