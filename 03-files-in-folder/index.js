const { readdir } = require('fs/promises');
const { stat } = require('fs');
const path = require('path');

(async (way) => {
  const files = await readdir(way, {withFileTypes: true});

  for(const file of files) {
    if(file.isFile()) {
      const name = path.basename(file.name, path.extname(file.name));
      const ext = path.extname(file.name).slice(1);
      stat(`${way}/${file.name}`, (err, stats) => {
        if(err) throw err;
        if(name && ext) {
          console.log(`${name} - ${ext} - ${(+stats.size/1000)}kb`);
        }
      });
    }
  }
})(path.join(__dirname, 'secret-folder'))

// everything works
// if something goes wrong, please contact me (discord vitali-santalau#3627)