const fs = require('fs');
const path = require('path');
const process = require('process');
const readline = require('readline');

const { stdin: input, stdout: output } = process;

const rl = readline.createInterface({ input, output });

const pathToOutFile = path.join(__dirname, 'text.txt');
const writeStream = fs.createWriteStream(pathToOutFile, 'utf8');

console.log('Hi, type something...');

rl.on('line', (input) => {
  if(input === 'exit') {
    rl.close();
  } else {
    writeStream.write(input);
    writeStream.write('\n');
  }
});

process.on('beforeExit', () => {
  console.log('Thank you for typing...');
});