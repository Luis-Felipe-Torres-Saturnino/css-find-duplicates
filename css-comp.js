const fs = require('fs');
const path = require('path');
const css = require('css');

// Function to parse a CSS file and generate JSON data
function parseCSSFile(filePath) {
  const fileContent = fs.readFileSync(filePath, 'utf-8');
  const parsed = css.parse(fileContent, { source: filePath });
  const selectors = {};

  function processRules(rules) {
    for (const rule of rules) {
      if (rule.type === 'rule') {
        rule.selectors.forEach(selector => {
          if (!selector.startsWith('@')) {
            selectors[selector] = {};
            rule.declarations.forEach(declaration => {
              selectors[selector][declaration.property] = declaration.value;
            });
          }
        });
      } else if (rule.type === 'media') {
        processRules(rule.rules);
      }
    }
  }

  processRules(parsed.stylesheet.rules);

  return selectors;
}

// Function to generate JSON data for an entire directory
function generateCSSData(directoryPath) {
  const cssData = {};

  fs.readdirSync(directoryPath).forEach((file) => {
    if (path.extname(file) === '.css') {
      const filePath = path.join(directoryPath, file);
      const fileData = parseCSSFile(filePath);
      cssData[path.basename(filePath, '.css')] = fileData;
    }
  });

  return cssData;
}

// Replace 'css-files-directory' with the path to your CSS files directory
const cssFilesDirectory = './original_css';

const cssData = generateCSSData(cssFilesDirectory);

// Export the CSS data to a JSON file
fs.writeFileSync('./compiledCss/css-data.json', JSON.stringify(cssData, null, 2), 'utf-8');
console.log('CSS data exported to css-data.json');
