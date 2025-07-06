const fs = require('fs');

const data = JSON.parse(fs.readFileSync('projects-local.json', 'utf-8'));
console.log('Available slugs:');
data.data.forEach(p => {
  if (p.slug) {
    console.log(p.slug);
  }
}); 