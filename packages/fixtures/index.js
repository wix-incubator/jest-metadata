const fs = require('fs');
const path = require('path');

module.exports = [];
fs.readdirSync(__dirname).forEach((file) => {
  if (file.endsWith('.json') && file !== 'package.json') {
    module.exports.push([path.basename(file, '.json'), require(`./${file}`)]);
  }
});
