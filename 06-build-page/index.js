const fs = require('fs');
const path = require('path');
const { mkdir, readdir, copyFile } = require('fs/promises');

const pathProjectDist = path.join(__dirname, 'project-dist');

(async () => {
  mkdir(pathProjectDist, { recursive : true });

  const pathTemplate = path.join(__dirname, 'template.html');
  const readStreamTemplate = fs.createReadStream(pathTemplate, 'utf8');
  let template = await getData(readStreamTemplate);

  const placeholders = template.match(/\{\w+\}/g).map(el => el.slice(1, el.length-1));
  
  const objComponents = {};
  for(let i = 0; i < placeholders.length; i++) {
    const pathComponent = path.join(__dirname, `components/${placeholders[i]}.html`);
    const readStreamComponent = fs.createReadStream(pathComponent, 'utf8');
    const component = await getData(readStreamComponent);
    objComponents[placeholders[i]] = component;  
  }  
  
  placeholders.forEach(el => {
    template = template.replace(`{{${el}}}`, objComponents[el]);  
  });
  
  writeDataToIndex(template); 
  
  mergeStyles();

  cleanDir();
  copyDir();
})();


function writeDataToIndex(template) {
  const writeStreamIndex = fs.createWriteStream(`${pathProjectDist}/index.html`, 'utf8');
  writeStreamIndex.on('error', (err) => console.log(`Err: ${err}`));
  writeStreamIndex.write(template, 'utf8');
}

function getData(stream) {
  const res = [];
  return new Promise((resolve, reject) => {
    stream.on('data', data => res.push(data));
    stream.on('error', (er) => reject(er));
    stream.on('end', () => resolve(res.join('')));
  });
}

async function mergeStyles() {
  const writeStreamStyle = fs.createWriteStream(path.join(pathProjectDist, 'style.css'), 'utf8');
  
  const files = await getNameFiles();
  
  const arrData = await Promise.all(files.map(file => {
    const pathFile = path.join(__dirname, `styles/${file}`);
    const readStreamFile = fs.createReadStream(pathFile, 'utf8');
    return getData(readStreamFile);
  }));

  arrData.forEach(el => {
    writeStreamStyle.on('error', (err) => console.log(`Err: ${err}`));
    writeStreamStyle.write(el, 'utf8');
  });
}

async function getNameFiles() {
  const filesFromStyles = await readdir(path.join(__dirname, 'styles'), {withFileTypes: true});
  const nameFiles = [];
  for(const file of filesFromStyles) {
    if(file.isFile() && path.extname(file.name) === '.css') {
      nameFiles.push(file.name);
    }
  }
  return nameFiles; 
}

function cleanDir() {
  fs.rmdir(path.join(pathProjectDist, 'assets'), {recursive : true}, (err) => {
    if(err) throw err;
  });

  /// dir not empty ERRRRR
}

async function copyDir(dir = 'assets', pathDir = __dirname, pathCopyDir = pathProjectDist) {
  mkdir(path.join(pathCopyDir, `${dir}`), { recursive : true }); 

  const files = await readdir(path.join(pathDir, dir), {withFileTypes: true});
  
  for(const file of files) {
    if(file.isDirectory()) {
      copyDir(file.name, path.join(pathDir, dir), path.join(pathCopyDir, dir));
    }
    if(file.isFile()) {
      await copyFile(path.join(pathDir, dir, file.name), path.join(pathCopyDir, dir, file.name));
    }
  }
}