const fs = require('fs');
const mkdir = require('fs').promises.mkdir;
const readdir = require('fs').promises.readdir;
const copyFile = require('fs').promises.copyFile;
const path = require('path');

const pathSrc = path.join(__dirname, 'files');
const pathDest = path.join(__dirname, 'files-copy');



mkdir(pathDest, {recursive : true});
//read 04---- if files-copy to deleteFilesDest();
/// TODO refactor !!!!!!!!!!!!!!!!!!11
deleteFilesDest();
getFiles();

async function deleteFilesDest() {
  const files = await readdir(pathDest);
  for(const file of files) {
    fs.unlink(`${pathDest}/${file}`, (err) => {
      if(err) throw err;
    });
  }
}

async function getFiles() {
  const files = await readdir(pathSrc);
  for(const file of files) {
    await copyFile(`${pathSrc}/${file}`, `${pathDest}/${file}`);
  }
}

