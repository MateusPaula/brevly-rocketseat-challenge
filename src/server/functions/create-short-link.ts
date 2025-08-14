import { eq } from "drizzle-orm";
import z from "zod";

import { db } from "@/server/infra/db";
import { schema } from "@/server/infra/db/schemas";

const createShortLink = z.object({
    originalUrl: z.url()
})

type CreateShortLink = z.input<typeof createShortLink>

export async function createLink(input: CreateShortLink) {
    const { originalUrl } = createShortLink.parse(input);

    // Check if original URL exists
    const existingLinks = await db.select().from(schema.links).where(eq(schema.links.originalUrl, originalUrl.toString()));

    // Generate base short URL (e.g. "google" from "https://google.com")
    const urlObj = new URL(originalUrl);
    const baseShortUrl = urlObj.hostname.split('.')[1];

    // TODO: Add the domain to the shortUrl
    let shortUrl = `${process.env.DOMAIN || 'localhost:5432'}/${baseShortUrl}`;

    // If URL exists, append incrementing number
    if (existingLinks.length > 0) {
        const existingShortUrls = existingLinks.map(link => link.shortUrl);
        let counter = 1;
        
        while (existingShortUrls.includes(shortUrl)) {
            shortUrl = `${process.env.DOMAIN || 'localhost:5432'}/${baseShortUrl}-${counter}`;
            counter++;
        }
    }

    await db.insert(schema.links).values({
        originalUrl: originalUrl.toString(),
        shortUrl: shortUrl,
        visits: 0,
    })

    return {
        shortUrl,
    }
}