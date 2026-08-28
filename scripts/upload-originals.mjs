/**
 * Uploads full-resolution wallpapers to Vercel Blob with PRIVATE access, so
 * they are only reachable through /api/download with a signed link.
 *
 * These files must never be committed to public/ — anything there is fetchable
 * by URL, and people would simply skip the cart.
 *
 * Usage:
 *   BLOB_READ_WRITE_TOKEN=... node scripts/upload-originals.mjs <folder>
 *
 * Expects files already named as the download endpoint will ask for them:
 *   <id>-iphone.jpg, <id>-16x9.jpg, <id>-16x10.jpg, <id>-4x3.jpg, <id>-5x4.jpg
 */
import { readdir, readFile } from 'node:fs/promises'
import { join } from 'node:path'
import { put } from '@vercel/blob'

const dir = process.argv[2]
if (!dir) {
  console.error('Usage: node scripts/upload-originals.mjs <folder>')
  process.exit(1)
}
if (!process.env.BLOB_READ_WRITE_TOKEN) {
  console.error('BLOB_READ_WRITE_TOKEN is not set.')
  process.exit(1)
}

const files = (await readdir(dir)).filter((f) => /\.jpg$/i.test(f))
if (!files.length) {
  console.error(`No .jpg files in ${dir}`)
  process.exit(1)
}

let done = 0
for (const name of files) {
  const body = await readFile(join(dir, name))
  await put(`originals/${name}`, body, {
    access: 'private',
    addRandomSuffix: false,
    contentType: 'image/jpeg',
  })
  done += 1
  console.log(`${done}/${files.length}  ${name}`)
}

console.log(`\nUploaded ${done} file(s) to originals/ (private).`)
