const puppeteer = require('puppeteer');
const axeCore = require('axe-core');
const fs = require('fs');
const readline = require('readline');

let urlFile = '';
let scanLevel = '';
let scanMobile = false;
let resultFolder = '';
let resultPrefix = '';

let validArgs = true;

const appArgumentsDesc = `
  Usage: node app-scanner.js 
  
  Arguments:
  
  -urlFile <path>   (path of the file containing urls to scan)
  -level [a|aa|aaa] (WCAG level that we are running against)
  -mobile           (scan the mobile version of the site)
  -resultFolder <path> (path to the folder where the results should be stored)
`;

// Get the command-line arguments
(() => {
  process.argv.forEach((val, index) => {
    // console.log(`${index}: ${val}`);

    const getValue = () => {
      if (index + 1 < process.argv.length) {
        return process.argv[index + 1];
      }
      throw 'Arguments provided are not valid.';
    };

    try {
      switch (val) {
        case '-urlFile':
          urlFile = getValue();
          break;
        case '-level':
          scanLevel = getValue();
          break;
        case '-resultFolder':
          resultFolder = getValue();
          break;
        case '-prefix':
          resultPrefix = getValue();
          break;
        case '-mobile':
          scanMobile = true;
      }
    } catch (err) {
      console.log('Error: ', err);
      console.log(appArgumentsDesc);
      return;
      //break;
    }
  });

  if (scanLevel !== 'a' || scanLevel !== 'aa' || scanLevel !== 'aaa') {
    validArgs = false;
  }

  if (validArgs) {
    launchScanner();
  }
})();

// Loop through an opened file and save all the URLs into memory.
const runScanOnPage = (page, pageUrl) => {
  return page.goto(pageUrl);
};

const launchPuppeteer = () => {
  return puppeteer.launch({ headless: false });
};

const newBrowserPage = browser => {
  return browser.newPage();
};

const injectAxeLib = page => {
  return page.evaluateHandle(`
  // Inject axe source code
  ${axeCore.source}
  // Run axe
  axe.run()
`);
};

const writeResultsToFile = jsonResult => {
  const data = JSON.stringify(jsonResult);
  // console.log(results);
  fs.writeFileSync('test.json', data);
};

const launchScanner = async () => {
  const browser = await launchPuppeteer(); //puppeteer.launch({ headless: false });
  const page = await newBrowserPage(browser); //browser.newPage();

  await runScanOnPage(page, 'https://www.google.ca'); //page.goto('https://www.google.ca');

  // Inject and run axe-core
  const handle = await injectAxeLib(page);

  // await page.evaluateHandle(`
  //     // Inject axe source code
  //     ${axeCore.source}
  //     // Run axe
  //     axe.run()
  // `);

  // Get the results from `axe.run()`.
  results = await handle.jsonValue();
  // Destroy the handle & return axe results.
  await handle.dispose();

  await browser.close();

  writeResultsToFile(results);
  // const data = JSON.stringify(results);

  // fs.writeFileSync('test.json', data);
  //   fs.writeFile("test.txt", results, err => {
  //     if (err) throw err;
  //     console.log("The file has been saved!");
  //   });
};

//////launchScanner();
// (async () => {
//   const browser = await launchPuppeteer(); //puppeteer.launch({ headless: false });
//   const page = await newBrowserPage(browser); //browser.newPage();

//   await runScanOnPage(page, 'https://www.google.ca'); //page.goto('https://www.google.ca');

//   // Inject and run axe-core
//   const handle = await injectAxeLib(page);

//   // await page.evaluateHandle(`
//   //     // Inject axe source code
//   //     ${axeCore.source}
//   //     // Run axe
//   //     axe.run()
//   // `);

//   // Get the results from `axe.run()`.
//   results = await handle.jsonValue();
//   // Destroy the handle & return axe results.
//   await handle.dispose();

//   await browser.close();

//   writeResultsToFile(results);
//   // const data = JSON.stringify(results);

//   // fs.writeFileSync('test.json', data);
//   //   fs.writeFile("test.txt", results, err => {
//   //     if (err) throw err;
//   //     console.log("The file has been saved!");
//   //   });
// })();
