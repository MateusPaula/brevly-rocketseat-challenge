import { PassThrough, Transform } from 'node:stream'
import { pipeline } from 'node:stream/promises'
import { stringify } from 'csv-stringify'
import { ilike } from 'drizzle-orm'
import z from 'zod'
import { db, pg } from '../infra/db'
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

type Link = {
  short_url: string
  original_url: string
  visits: number
  created_at: Date
}

export async function exportLinks(
  input: ExportLinksInput
): Promise<Either<never, ExportLinksOutput>> {
  const { searchQuery } = exportLinksInput.parse(input)

  const { sql, params } = db
    .select({
      shortUrl: schema.links.shortUrl,
      originalUrl: schema.links.originalUrl,
      visits: schema.links.visits,
      createdAt: schema.links.createdAt,
    })
    .from(schema.links)
    .where(
      searchQuery ? ilike(schema.links.shortUrl, `%${searchQuery}%`) : undefined
    )
    .toSQL()

  const cursor = pg.unsafe(sql, params as string[]).cursor(2)

  const csv = stringify({
    delimiter: ',',
    header: true,
    columns: [
      { key: 'shortUrl', header: 'Short URL' },
      { key: 'originalUrl', header: 'Original URL' },
      { key: 'visits', header: 'Visits' },
      { key: 'createdAt', header: 'Created At' },
    ],
  })

  const outputStream = new PassThrough()

  const convertToCSVPipeline = pipeline(
    cursor,
    new Transform({
      objectMode: true,
      transform(batch: Link[], encoding, callback) {
        for (const row of batch) {
          this.push({
            shortUrl: row.short_url,
            originalUrl: row.original_url,
            visits: row.visits,
            createdAt: row.created_at,
          })
        }
        callback()
      },
    }),
    csv,
    outputStream
  )

  const uploadToStorage = uploadCsvToStorage({
    contentType: 'text/csv',
    folder: 'downloads',
    fileName: `${new Date().toISOString()}-links.csv`,
    contentStream: outputStream,
  })

  const [{ url }] = await Promise.all([uploadToStorage, convertToCSVPipeline])

  return makeRight({
    reportUrl: url,
  })
}
