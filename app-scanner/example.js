const puppeteer = require('puppeteer');
const axeCore = require('axe-core');
const fs = require('fs');
const readline = require('readline');

let urlFile = '';
let scanLevel = '';
let scanMobile = false;
let resultFolder = '';
let resultPrefix = '';

let browser = null;
let page = null;

const appArgumentsDesc = `
  Usage: node app-scanner.js 
  
  Arguments:
  
  -urlFile <path>   (path of the file containing urls to scan)
  -level [a|aa|aaa] (WCAG level that we are running against)
  -mobile           (scan the mobile version of the site)
  -resultFolder <path> (path to the folder where the results should be stored)
`;

// Loop through an opened file and save all the URLs into memory.
const goToPage = (page, pageUrl) => {
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
  axe.configure({
    rules: {
      tags: 'wcag2a'
    }
  })
  axe.run()
`);
};

const writeResultsToFile = (jsonResult, fName) => {
  const data = JSON.stringify(jsonResult);
  fs.writeFileSync(fName, data);
};

const cleanup = async (browser) => {
  await browser.close();
};

const launchScanner = async() => {
  // Read the target Url links file
  try {
    const readStream = fs.createReadStream(urlFile, {
      encoding: 'utf-8'
    });
    const readLine = readline.createInterface(readStream);

    await setUpEnvironment();

    readLine.on('line', line => {
      console.log('line is: ', line);
      await runScanOnPage(line);
    });

    await cleanup(browser);

  } catch (err) {
    console.log('launchScanner error: ', err);
  }
};

const setUpEnvironment = async()=> {
  browser = await launchPuppeteer();
  page = await newBrowserPage(browser);
}

const runScanOnPage = async (urlFromFile) => {
  
  await goToPage(page, urlFromFile);

  // Inject and run axe-core
  let handle = await injectAxeLib(page);

  // Get the results from `axe.run()`.
  results = await handle.jsonValue();

  

  writeResultsToFile(results, 'google-scan.json');

  await handle.dispose();
  // Destroy the handle & return axe results.

  // await goToPage(page, 'https://www.yahoo.ca');
  // handle = await injectAxeLib(page);
  // results = await handle.jsonValue();
  // writeResultsToFile(results, 'yahoo-scan.json');

  
};

// Get the command-line arguments
(() => {
  let validArgs = true;
  process.argv.forEach((val, index) => {
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
      return;
    }
  });

  if (scanLevel !== 'a' && scanLevel !== 'aa' && scanLevel !== 'aaa') {
    validArgs = false;
  }
  if (validArgs) {
    launchScanner();
  } else {
    console.log(appArgumentsDesc);
  }
})();
