const fs = require('fs');
const path = require('path');
const { stdout } = require('process');

fs
  .createReadStream(path.join(__dirname, 'text.txt'), 'utf8')
  .pipe(stdout);