const fs = require('fs');
const path = require('path');
const stdout = require('process').stdout;

const absolutPath = path.join(__dirname, 'text.txt');
const readStream = fs.createReadStream(absolutPath, 'utf8');

readStream.pipe(stdout); // or take a look below 

// *** OR *** 

// readStream.on('data', function(chunk) {
//   console.log(chunk);
// });  
