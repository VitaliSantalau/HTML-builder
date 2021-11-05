const fs = require('fs');
const path = require('path');
const { stdout } = require('process');

fs
  .createReadStream(path.join(__dirname, 'text.txt'), 'utf8')
  .pipe(stdout);

// everything works
// if something goes wrong, please contact me (discord vitali-santalau#3627)