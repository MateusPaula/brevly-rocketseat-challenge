import { randomUUID } from 'node:crypto'
import { Readable } from 'node:stream'
import { Upload } from '@aws-sdk/lib-storage'
import { z } from 'zod'
import { env } from '@/server/env'
import { r2 } from './client'

const uploadCsvToStorageInput = z.object({
  contentStream: z.instanceof(Readable),
  contentType: z.string(),
  folder: z.enum(['downloads']),
  fileName: z.string(),
})

type UploadCsvToStorageInput = z.input<typeof uploadCsvToStorageInput>

export async function uploadCsvToStorage(input: UploadCsvToStorageInput) {
  const { contentStream, contentType, folder, fileName } =
    uploadCsvToStorageInput.parse(input)

  const uniqueFileName = `${folder}/${randomUUID()}-${fileName}`

  const upload = new Upload({
    client: r2,
    params: {
      Bucket: env.CLOUDFLARE_BUCKET,
      Key: uniqueFileName,
      Body: contentStream,
      ContentType: contentType,
    },
  })

  await upload.done()

  return {
    key: uniqueFileName,
    url: new URL(uniqueFileName, env.CLOUDFLARE_PUBLIC_URL).toString(),
  }
}
