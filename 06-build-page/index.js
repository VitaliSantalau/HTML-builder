const fs = require('fs');
const path = require('path');
const { mkdir, rmdir, readdir, copyFile, rm } = require('fs/promises');


const dist = path.join(__dirname, 'project-dist');
const pathDistAssets = path.join(dist, 'assets');

(async () => {
  mkdir(dist, { recursive : true })
    .then(async (res) => {
      res = await mkdir(pathDistAssets, { recursive : true })
      return res;
  }).then(async (res) => {
    const files = await readdir(pathDistAssets, {withFileTypes: true});
    res = await Promise.all(files.map(file => {
      rm(`${pathDistAssets}/${file.name}`, {recursive: true}, (err) => {
        if(err) throw err;
      })
    }))
    return res;
  }).then((res) => console.log(res))
})()



// new Promise(resolve => {
//   resolve(mkdir(dist, { recursive : true }))
// }).then(() => {
//     return new Promise(resolve => {
//       resolve(mkdir(pathDistAssets, { recursive : true }))
//     })
//   })
//   .then(() => {
//     const res = new Promise(async (resolve) => {
//       console.log('start clean assets')
//       const files = await readdir(pathDistAssets, {withFileTypes: true});
//       // const res = await Promise.all(files.map(file => {
//       //   console.log(`claen ${file.name} `)
//       //   rm(`${pathDistAssets}/${file.name}`, {recursive: true}, (err) => {
//       //     if(err) throw err;
//       //     console.log(`delete:${file.name}`)
//       //   })
//       // }))
//       // resolve(res);

//     })
//     return res;
//   })
//   .then(() => console.log('after clean'))
//   .then(() => {
//     console.log('start creating')
//     return new Promise(() => {
//       createHTML();
//       createCSS();
//       copyDir();
//     }
//     )
   
//   })
//   .catch(err => console.log(err));

  

// async function cleanAssets() {
//   const files = await readdir(pathDistAssets, {withFileTypes: true});
//   for(const file of files) {
//     console.log('file')
//     rm(pathDistAssets, {recursive: true, force: true}, () => console.log(`done:${file.name}`))
//   }
// }

// async function cleanDir(way) {
//   const files = await readdir(way, {withFileTypes: true});
//   for(const file of files) {
//     if(file.isDirectory()) {
//       cleanDir(`${way}/${file.name}`);
//     }
//     if(file.isFile()) {
//       console.log('file')
//       fs.unlink(`${way}/${file.name}`, (err) => {
//         if(err) throw err;
//       });        
//     }
//   }
// }

// async function delDir(way) {
//   const files = await readdir(way, {withFileTypes: true});
//   for(const file of files) {
//     rmdir(way, {}, err => {
//       if(err) throw err;
//     })
//   }
// }

async function createHTML() {
  console.log('start HTML')
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
  console.log('start CSS')
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
  console.log('start copy')

  mkdir(path.join(pathCopyDir, `${dir}`), { recursive : true }); 

  const files = await readdir(path.join(pathSrcDir, dir), {withFileTypes: true});
  if(files.length) {
    for(const file of files) {
      if(file.isDirectory()) {
        copyDir(file.name, path.join(pathSrcDir, dir), path.join(pathCopyDir, dir));
      }
      if(file.isFile()) {
        console.log('copy')
        await copyFile(path.join(pathSrcDir, dir, file.name), path.join(pathCopyDir, dir, file.name));
      }
    }
  }
}