const { unlink } = require('fs');
const { mkdir, readdir, copyFile }= require('fs/promises');
const path = require('path');

const src = path.join(__dirname, 'files');
const dest = path.join(__dirname, 'files-copy');
  
mkdir(dest, { recursive : true });
clean();
copy();

async function clean() {
  const files = await readdir(dest);
  if(files.length) {
    for(const file of files) {
      unlink(`${dest}/${file}`, (er) => {
        if(er) throw er;
      });
    }  
  }
}

async function copy() {
  const files = await readdir(src);
  for(const file of files) {
    await copyFile(`${src}/${file}`, `${dest}/${file}`);
  }
}