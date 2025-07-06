const axios = require('axios');
const fs = require('fs');

const API_URL = 'https://directus.thegovlab.com/items/mobility';
const OUTPUT_FILE = 'mobility-projects.json';
const FIELDS = [
  '*.*',
  'project_name.*',
  'project_name.thumbnail.*',
];

async function fetchAllMobilityItems() {
  let allItems = [];
  let page = 1;
  const limit = 100;
  let total = null;

  while (true) {
    const url = `${API_URL}?fields=${FIELDS.join(',')}&limit=${limit}&page=${page}`;
    console.log('Fetching:', url);
    const res = await axios.get(url);
    const data = res.data.data;
    if (!Array.isArray(data) || data.length === 0) break;
    allItems = allItems.concat(data);
    if (total === null && res.data.meta && res.data.meta.total) {
      total = res.data.meta.total;
    }
    if (total !== null && allItems.length >= total) break;
    page++;
  }
  return allItems;
}

(async () => {
  try {
    const items = await fetchAllMobilityItems();
    fs.writeFileSync(OUTPUT_FILE, JSON.stringify(items, null, 2));
    console.log(`Saved ${items.length} items to ${OUTPUT_FILE}`);
  } catch (err) {
    console.error('Error fetching mobility items:', err.message);
    process.exit(1);
  }
})(); 