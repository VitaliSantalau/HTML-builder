const fs = require('fs');
const path = require('path');
const readline = require('readline');
const process = require('process')
const { stdin: input, stdout: output } = process;

const rl = readline.createInterface({ input, output })

const writeStream = fs.createWriteStream(
  path.join(__dirname, 'text.txt'),
  'utf8'
)

console.log('Hi, type something...');

rl.on('line', (input) => {
    if(input === 'exit') {
      rl.close();
    } else {
      writeStream.write(input); // after typing, check the file text.txt(or update opened file) and you can see added line
      writeStream.write('\n'); // if you wish to glue lines, comment this
    }
  });

process.on('beforeExit', () => {
  console.log('Thank you for typing...');
});

// everything works
// if something goes wrong, please contact me (discord vitali-santalau#3627)