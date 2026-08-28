import type { VercelRequest, VercelResponse } from '@vercel/node'
import { head } from '@vercel/blob'
import { verifyDownload } from './_lib/catalogue'

/**
 * Serves a purchased file, but only against a valid, unexpired signature
 * issued by the webhook. Full-resolution originals live in Vercel Blob with
 * private access — never in public/, where they'd be freely fetchable.
 *
 * Env: DOWNLOAD_SECRET, BLOB_READ_WRITE_TOKEN
 */
export default async function handler(req: VercelRequest, res: VercelResponse) {
  const secret = process.env.DOWNLOAD_SECRET
  if (!secret) return res.status(500).send('Downloads are not configured.')

  const file = String(req.query.file ?? '')
  const expires = Number(req.query.expires ?? 0)
  const sig = String(req.query.sig ?? '')

  // Reject traversal attempts outright before doing anything else.
  if (!/^[a-z0-9-]+\.jpg$/i.test(file)) return res.status(400).send('Bad request')

  if (!verifyDownload(file, expires, sig, secret)) {
    return res.status(403).send('This link has expired or is invalid.')
  }

  try {
    const blob = await head(`originals/${file}`)
    const upstream = await fetch(blob.url)
    if (!upstream.ok || !upstream.body) return res.status(404).send('File not found')

    res.setHeader('Content-Type', 'image/jpeg')
    res.setHeader('Content-Disposition', `attachment; filename="${file}"`)
    res.setHeader('Cache-Control', 'private, no-store')

    const buffer = Buffer.from(await upstream.arrayBuffer())
    return res.status(200).send(buffer)
  } catch (error) {
    console.error('Download failed for', file, error)
    return res.status(404).send('File not found')
  }
}
