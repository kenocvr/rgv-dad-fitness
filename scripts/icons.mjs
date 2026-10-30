import sharp from 'sharp'
import { readFileSync } from 'node:fs'
const svg = readFileSync(new URL('../public/icon.svg', import.meta.url))
for (const size of [192, 512]) {
  await sharp(svg, { density: 300 }).resize(size, size).png().toFile(`public/icon-${size}.png`)
}
console.log('icons written')
