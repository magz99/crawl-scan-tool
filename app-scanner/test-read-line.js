const fs = require('fs');
const readline = require('readline');

const readStream = fs.createReadStream('./sites/rangle.io-links.txt', {
  encoding: 'utf-8'
});

const readLine = readline.createInterface(readStream);

readLine.on('line', line => {
  console.log('line is: ', line);
});

//console.log(readStream.read(100));
