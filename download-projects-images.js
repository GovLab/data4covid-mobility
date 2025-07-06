const fs = require('fs');
const path = require('path');
const axios = require('axios');

const INPUT_JSON = 'projects.json';
const OUTPUT_JSON = 'projects-local.json';
const IMG_DIR = 'img';
const IMAGE_EXTENSIONS = ['.jpg', '.jpeg', '.png', '.gif', '.svg', '.webp'];
const DIRECTUS_ORIGINALS = 'https://directus.thegovlab.com/uploads/data4covid/originals/';

function getFilenameFromUrl(url) {
  return url.split('/').pop().split('?')[0];
}

function looksLikeImageUrl(str) {
  if (typeof str !== 'string') return false;
  return IMAGE_EXTENSIONS.some(ext => str.toLowerCase().includes(ext));
}

function isDirectusFilename(str) {
  // UUID or filename with image extension, no slashes
  return (
    typeof str === 'string' &&
    IMAGE_EXTENSIONS.some(ext => str.toLowerCase().endsWith(ext)) &&
    !str.includes('/') &&
    str.length > 10 // crude check for uuid/filename
  );
}

async function downloadImage(url, dest) {
  try {
    const writer = fs.createWriteStream(dest);
    const response = await axios({
      url,
      method: 'GET',
      responseType: 'stream',
    });
    response.data.pipe(writer);
    return new Promise((resolve, reject) => {
      writer.on('finish', resolve);
      writer.on('error', reject);
    });
  } catch (err) {
    console.error(`Failed to download ${url}: ${err.message}`);
  }
}

async function findAndDownloadImages(obj, seen) {
  if (Array.isArray(obj)) {
    for (const item of obj) {
      await findAndDownloadImages(item, seen);
    }
  } else if (typeof obj === 'object' && obj !== null) {
    for (const key of Object.keys(obj)) {
      const val = obj[key];
      if (typeof val === 'string' && looksLikeImageUrl(val)) {
        let url = val.replace(/\\/g, '');
        let filename = getFilenameFromUrl(url);
        let localPath = path.join(IMG_DIR, filename);
        // If it's just a filename/UUID, construct the Directus URL
        if (isDirectusFilename(val)) {
          url = DIRECTUS_ORIGINALS + filename;
        }
        if (fs.existsSync(localPath)) {
          console.log(`Found locally: ${localPath}`);
        } else if (!seen.has(filename)) {
          console.log(`Downloading ${url} -> ${localPath}`);
          await downloadImage(url, localPath);
        }
        seen.add(filename);
        obj[key] = path.join('img', filename);
      } else if (typeof val === 'object' && val !== null) {
        await findAndDownloadImages(val, seen);
      }
    }
  }
}

async function main() {
  const raw = fs.readFileSync(INPUT_JSON, 'utf-8');
  const json = JSON.parse(raw);
  const data = json.data;
  const seen = new Set();
  await findAndDownloadImages(data, seen);
  fs.writeFileSync(OUTPUT_JSON, JSON.stringify({data}, null, 2));
  console.log(`Downloaded images and updated JSON written to ${OUTPUT_JSON}`);
}

main(); 