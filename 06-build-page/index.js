const fs = require('fs');
const path = require('path');
const { mkdir, readdir, copyFile, rm } = require('fs/promises');

const dist = path.join(__dirname, 'project-dist');
const dist_Assets = path.join(dist, 'assets');

mkdir(dist_Assets, { recursive : true })
  .then(async () => {
    createHTML();
    createCSS();
    await cleanDistAssets();
  })
  .then(async () => {
    await copyDir();
  })
  .catch((err) => console.log(err));

async function cleanDistAssets() {
  const files = await readdir(dist_Assets, {withFileTypes: true});
  await Promise.all(files.map(async file => {
    await rm(`${dist_Assets}/${file.name}`, {recursive: true});    
  }));
}
  
async function createHTML() {
  let template = await getDataTemplate();
  const placeholders = await template.match(/\{\w+\}/g).map(el => el.slice(1, el.length-1)); 
  const objComponents = await getDataComponents(placeholders);

  placeholders.forEach(el => {
    template = template.replace(`{{${el}}}`, objComponents[el]);  
  });
  
  writeDataToHTML(template); 
}

async function getDataTemplate() {
  const pathTemplate = path.join(__dirname, 'template.html');
  const readStream = fs.createReadStream(pathTemplate, 'utf8');
  return await getData(readStream);
}

async function getDataComponents(array) {
  const res = {};
  for(let i = 0; i < array.length; i++) {
    const pathComponent = path.join(__dirname, `components/${array[i]}.html`);
    const readStream = fs.createReadStream(pathComponent, 'utf8');
    const component = await getData(readStream);
    res[array[i]] = component;  
  } 
  return res;
}

function writeDataToHTML(template) {
  const writeStream = fs.createWriteStream(`${dist}/index.html`, 'utf8');
  writeStream.on('error', (err) => console.log(`Err: ${err}`));
  writeStream.write(template, 'utf8');
}

function getData(stream) {
  const res = [];
  return new Promise((resolve, reject) => {
    stream.on('data', data => res.push(data));
    stream.on('error', (er) => reject(er));
    stream.on('end', () => resolve(res.join('')));
  });
}
  
async function createCSS() {
  const writeStream = fs.createWriteStream(path.join(dist, 'style.css'), 'utf8');
  
  const files = await getNameFiles();
  
  const arrData = await Promise.all(files.map(file => {
    const pathFile = path.join(__dirname, `styles/${file}`);
    const readStream = fs.createReadStream(pathFile, 'utf8');
    return getData(readStream);
  }));

  arrData.forEach(el => {
    writeStream.on('error', (err) => console.log(`Err: ${err}`));
    writeStream.write(el, 'utf8');
    writeStream.write('\n');
  });
}

async function getNameFiles() {
  const files = await readdir(path.join(__dirname, 'styles'), {withFileTypes: true});
  const nameFiles = [];
  if(files.length) {
    for(const file of files) {
      if(file.isFile() && path.extname(file.name) === '.css') {
        nameFiles.push(file.name);
      }
    }
  }
  return nameFiles; 
}

async function copyDir(dir = 'assets', pathSrcDir = __dirname, pathCopyDir = dist) {
  mkdir(path.join(pathCopyDir, `${dir}`), { recursive : true }); 

  const files = await readdir(path.join(pathSrcDir, dir), {withFileTypes: true});
  if(files.length) {
    for(const file of files) {
      if(file.isDirectory()) {
        copyDir(file.name, path.join(pathSrcDir, dir), path.join(pathCopyDir, dir));  
      }
      if(file.isFile()) {
        await copyFile(path.join(pathSrcDir, dir, file.name), path.join(pathCopyDir, dir, file.name));  
      }
    }
  }
}