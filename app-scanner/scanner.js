const puppeteer = require('puppeteer');
const axeCore = require('axe-core');
const fs = require('fs');
const readline = require('readline');

let siteName = '';
let urlFile = '';
let scanLevel = 'aa'; // Defaults to aa
let scanMobile = false;
let resultFolder = ''; // Default, will be timestamped
let resultPrefix = 'scan_'; // Default
let urlCounter = 0;

let browser = null;
let page = null;

const appArgumentsDesc = `
  Usage: node app-scanner.js -urlFile <path> -siteName <name> [-resultFolder <path>] [-level <value>] [-mobile]
  
  Arguments:
  
  urlFile <path>   (path of the file containing urls to scan)
  siteName <name>  (name provided for the crawling - should match by convention)
  resultFolder <path> (path to the folder where the results should be stored)
  level [value=a|aa|aaa] (WCAG level that we are running against)
  mobile           (scan the mobile version of the site)
  
`;

const setUpEnvironment = async () => {
  browser = await launchPuppeteer();
  page = await newBrowserPage(browser);
};

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
    rules: [{
      tags: 'wcag2a'
    }]
  })
  axe.run()
`);
};

const writeResultsToFile = (jsonResult, fName) => {
  const data = JSON.stringify(jsonResult);
  fs.writeFileSync(fName, data);
};

const runScanOnPage = async urlFromFile => {
  await goToPage(page, urlFromFile);

  // Inject and run axe-core
  let handle = await injectAxeLib(page);

  // Get the results from `axe.run()`.
  results = await handle.jsonValue();

  // resultFolder must end with '/'
  const resultFile = resultFolder + resultPrefix + urlCounter++ + '.json';
  console.log(`Writing to file: ${resultFile}`);
  writeResultsToFile(results, resultFile);

  await handle.dispose();
};

const cleanup = async browser => {
  await browser.close();
};

const launchScanner = async () => {
  // Read the target Url links file
  try {
    await setUpEnvironment();
    const readStream = fs.createReadStream(urlFile, {
      encoding: 'utf-8'
    });
    const readLine = readline.createInterface(readStream);

    for await (const line of readLine) {
      console.log('line is: ', line);
      await runScanOnPage(line);
    }

    await cleanup(browser);
  } catch (err) {
    console.log('launchScanner error: ', err);
  }
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
        case '-siteName':
          siteName = getValue();
          resultFolder = `./scans/${siteName}/`;
          break;
        case '-urlFile':
          urlFile = getValue();
          break;
        case '-level':
          scanLevel = getValue();
          break;
        case '-resultFolder':
          // Will override the default set.
          resultFolder = getValue();
          if (!resultFolder.endsWith('/')) {
            resultFolder += '/';
          }
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

  if (
    (scanLevel !== 'a' && scanLevel !== 'aa' && scanLevel !== 'aaa') ||
    siteName === '' ||
    urlFile === ''
  ) {
    validArgs = false;
  }
  if (validArgs) {
    fs.promises
      .mkdir(resultFolder + '/', { recursive: true })
      .then(async () => {
        launchScanner();
      })
      .catch(err => {
        throw err;
      });
  } else {
    console.log(appArgumentsDesc);
  }
})();
