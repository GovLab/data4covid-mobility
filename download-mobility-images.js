const fs = require('fs');
const path = require('path');
const axios = require('axios');

const INPUT_JSON = 'mobility-projects.json';
const OUTPUT_JSON = 'mobility-projects-local.json';
const IMG_DIR = 'img';

function getFilenameFromUrl(url) {
  return url.split('/').pop().split('?')[0];
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

async function main() {
  const raw = fs.readFileSync(INPUT_JSON, 'utf-8');
  const data = JSON.parse(raw).data;
  const seen = new Set();
  let downloadCount = 0;

  for (const project of data) {
    const thumb = project.project_name && project.project_name.thumbnail && project.project_name.thumbnail.data;
    if (thumb && thumb.full_url) {
      const url = thumb.full_url.replace(/\\/g, '');
      const filename = getFilenameFromUrl(url);
      const localPath = path.join(IMG_DIR, filename);
      if (!fs.existsSync(localPath) && !seen.has(filename)) {
        console.log(`Downloading ${url} -> ${localPath}`);
        await downloadImage(url, localPath);
        downloadCount++;
      }
      seen.add(filename);
      // Rewrite JSON to use local path
      project.project_name.thumbnail.data.full_url = path.join('img', filename);
    }
  }
  fs.writeFileSync(OUTPUT_JSON, JSON.stringify({data}, null, 2));
  console.log(`Downloaded ${downloadCount} new images. Updated JSON written to ${OUTPUT_JSON}`);
}

main(); 