const fs = require('fs');
const path = require('path');
const cheerio = require('cheerio');

// Function to parse an HTML or PHP file and generate JSON data
function parseFile(filePath) {
  const fileContent = fs.readFileSync(filePath, 'utf-8');
  const $ = cheerio.load(fileContent);

  const elements = [];

  $('[style], [class]').each(function () {
    const styleAttribute = $(this).attr('style') || '';
    const styleObject = {};

    const styleProperties = styleAttribute.split(';');

    styleProperties.forEach((property) => {
      const [key, value] = property.split(':');
      if (key && value) {
        styleObject[key.trim()] = value.trim();
      }
    });

    const element = {
      tag: this.name,
      style: styleObject,
      classes: $(this).attr('class') ? $(this).attr('class').split(' ') : [],
    };
    elements.push(element);
  });

  return elements;
}

// Function to generate JSON data for a folder
function generateHTMLData(directoryPath, recursive) {
  const htmlData = [];
  
  const scanDirectory = (currentPath) => {
    fs.readdirSync(currentPath).forEach((file) => {
      const filePath = path.join(currentPath, file);
      const extname = path.extname(file).toLowerCase();

      if (extname === '.html' || extname === '.php') {
        const fileData = parseFile(filePath);
        htmlData.push(...fileData);
      } else if (recursive && fs.lstatSync(filePath).isDirectory()) {
        scanDirectory(filePath);
      }
    });
  };

  scanDirectory(directoryPath);

  return htmlData;
}

// Command line argument to enable recursive scanning
const recursiveFlag = process.argv.includes('--recursive');

// Replace 'html-files-directory' with the path to your HTML files directory
/* const htmlFilesDirectory = 'K:/Sistema AVA/luisf/AVA/programas/admRelatorioSedex'; */
const htmlFilesDirectory = './sus';
const outputFolder = "./compiledHtml"

const htmlData = generateHTMLData(htmlFilesDirectory, recursiveFlag);

// Export the HTML data to a JSON file
fs.writeFileSync(outputFolder+'/html-data.json', JSON.stringify(htmlData, null, 2), 'utf-8');
console.log('HTML data exported to html-data.json');