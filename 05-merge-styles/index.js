const fs = require('fs');
const path = require('path');
const { readdir } = require('fs/promises');

const src = path.join(__dirname, 'styles');
const dist = path.join(__dirname, 'project-dist/bundle.css');

const writeStream = fs.createWriteStream(dist, 'utf8');

(async () => {
  const files = await getNameFiles();
  const arrData = await Promise.all(files.map(file => {
    const pathFile = path.join(__dirname, `styles/${file}`);
    const readStreamFile = fs.createReadStream(pathFile, 'utf8');
    return getData(readStreamFile);
  }));
  
  arrData.forEach(el => {
    writeStream.on('error', (err) => console.log(`Err: ${err}`));
    writeStream.write(el, 'utf8');
  });
})();

async function getNameFiles() {
  const filesFromSrc = await readdir(src, {withFileTypes: true});
  const nameFiles = [];
  for(const file of filesFromSrc) {
    if(file.isFile() && path.extname(file.name) === '.css') {
      nameFiles.push(file.name);
    }
  }
  return nameFiles; 
}

async function getData(stream) {
  const res = [];
  return new Promise((resolve, reject) => {
    stream.on('data', data => res.push(data));
    stream.on('error', (er) => reject(er));
    stream.on('end', () => resolve(res.join('')));
  });
}

// everything works
// if something goes wrong, please contact me (discord vitali-santalau#3627)