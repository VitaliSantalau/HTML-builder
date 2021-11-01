const { readdir } = require('fs/promises');
const { stat } = require('fs');
const path = require('path');

const absolutPath = path.join(__dirname, 'secret-folder');

async function getOutput(way) {
  const files = await readdir(way, {withFileTypes: true});
  
  for(const file of files) {
    if(file.isDirectory()) {
      getOutput(`${way}/${file.name}`);
    }
    if(file.isFile()) {
      const name = path.basename(file.name, path.extname(file.name));
      const ext = path.extname(file.name).split('.')[1];
      stat(`${way}/${file.name}`, (err, stats) => {
        if(name && ext) {
          console.log(`${name}-${ext}-${(+stats.size/1000).toFixed(1)}kb`);
        }
      });
    }
  }
}

getOutput(absolutPath);