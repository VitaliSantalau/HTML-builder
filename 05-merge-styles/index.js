const fs = require('fs');
const path = require('path');
const { readdir } = require('fs/promises');
const readline = require('readline');

const src = path.join(__dirname, 'styles');
const dist = path.join(__dirname, 'project-dist/bundle.css');

// const src = path.join(__dirname, 'test-files/styles');
// const dist = path.join(__dirname, 'test-files/bundle.css');

const writeStream = fs.createWriteStream(dist, 'utf8');

(async () => {
  const files = await getNameFiles();
  const arrData = await Promise.all(files.map(file => getData(file)));
  
  arrData
    .reduce((acc, el) => {
      acc.push(...el);
      return acc;
    }, [])
    .forEach(el => {
      try {
        writeStream.write(el);
      } catch (error) {
        console.log(error);
      }
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

async function getData(file) {
  const pathFile = path.join(__dirname, `styles/${file}`);
  // const pathFile = path.join(__dirname, `test-files/styles/${file}`);
  const input =  fs.createReadStream(pathFile, 'utf8');

  const res = await new Promise((resolve, reject) => {
    const string = [];
    const rl = readline.createInterface({ input });
    rl.on('line', (line) => string.push(line));
    rl.on('close', () => resolve(string));
    rl.on('error', (err) => reject(err));  
  });
  return res;
}