const puppeteer = require('puppeteer');
const axeCore = require('axe-core');
const fs = require('fs');
const readline = require('readline');
const shell = require('shelljs');

const PROJECT_PATH = '/home/magz/workspace/crawl-scan-tool/app-scanner';

let siteName = '';
let urlFile = '';
let scanLevel = 'aa'; // Defaults to aa
let scanMobile = false; // TODO: Implement this feature
let resultFolder = ''; // Default, will be a timestamp
let resultFolderPath = ''; // absolute path to timestamped folder
let resultPrefix = 'scan_'; // Default
let urlCounter = 0;
let urlCrawled = '';

let browser = null;
let page = null;

let masterObj = {};

const appArgumentsDesc = `
  Usage: node scanner.js -urlFile <path> -siteName <name> -urlCrawled <url> [-resultFolder <path>] [-level <value>] [-mobile]
  
  Arguments:
  
  urlFile <path>   (path of the file containing urls to scan)
  siteName <name>  (name provided for the crawling - should match by convention)
  urlCrawled <url> (url of the site that was crawled, required for the results)
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

const newBrowserPage = (browser) => {
  return browser.newPage();
};

const injectAxeLib = (page) => {
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

const runScanOnPage = async (urlFromFile) => {
  await goToPage(page, urlFromFile);

  // Inject and run axe-core
  let handle = await injectAxeLib(page);

  // Get the results from `axe.run()`.
  results = await handle.jsonValue();

  // resultFolder must end with '/'
  const resultFile = `${resultFolderPath}${resultFolder}/${resultPrefix}${urlCounter++}.json`;
  console.log(`Writing to file: ${resultFile}`);
  writeResultsToFile(results, resultFile);

  await handle.dispose();
};

const cleanup = async (browser) => {
  await browser.close();
  createMasterJSON(`${resultFolderPath}${resultFolder}/`, 'results');
};

const readScanDir = async (scanFolderPath) => {
  return new Promise((resolve, reject) => {
    fs.readdir(scanFolderPath, (err, items) => {
      if (err) {
        reject(err);
      } else {
        resolve(items);
      }
    });
  });
};

const mergeJSONData = (fileArray, scanFolderPath) => {
  return fileArray.map((fName) => {
    // Read the JSON file
    return new Promise((resolve, reject) => {
      fs.readFile(scanFolderPath + fName, 'utf8', (err, data) => {
        if (err) {
          reject(err);
        } else {
          const jsonResult = JSON.parse(data);
          const violations = jsonResult.violations;
          let totalViolations = 0;
          let topViolations = {
            critical: 0,
            serious: 0,
            moderate: 0,
            minor: 0,
          };

          violations.forEach((violation) => {
            totalViolations += violation.nodes.length;
            topViolations[violation.impact] += violation.nodes.length;
          });

          // Updates the masterObject
          masterObj.totalViolations += totalViolations;
          masterObj.scannedPages.push({
            url: jsonResult.url,
            filename: fName,
          });

          masterObj.topViolations = {
            critical: masterObj.topViolations.critical + topViolations.critical,
            serious: masterObj.topViolations.serious + topViolations.serious,
            moderate: masterObj.topViolations.moderate + topViolations.moderate,
            minor: masterObj.topViolations.minor + topViolations.minor,
          };

          resolve(true);
        }
      });
    });
  });
};

const createMasterJSON = async (scanFolderPath, resultFileName) => {
  console.log('Creating master JSON file.');
  const fileArray = await readScanDir(scanFolderPath);

  const mergedJSONData = mergeJSONData(fileArray, scanFolderPath);

  Promise.all(mergedJSONData).then(() => {
    // Write the masterJSON file
    fs.writeFile(
      scanFolderPath + resultFileName + '.json',
      JSON.stringify(masterObj),
      (err) => {
        if (err) {
          console.log('Error: Master JSON file not created!');
          console.log(err);
        } else {
          onScanningCompleted();
        }
      }
    );
  });
};

const launchScanner = async () => {
  // Read the target Url links file
  try {
    await setUpEnvironment();
    const readStream = fs.createReadStream(urlFile, {
      encoding: 'utf-8',
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

// Function called when the scanning is completed and the master file
// has been created.
// Do any post-scanning stuff here.
const onScanningCompleted = () => {
  // execute shell script
  const scriptCmd = `${PROJECT_PATH}/scripts/aws-s3.sh "${resultFolderPath}" "${resultFolder}" "${siteName}"`;
  shell.exec(scriptCmd);
};

let testFeat = false;
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
        case '-masterOnly':
          testFeat = true;
          siteName = 'magz-test';
          resultFolderPath = `${PROJECT_PATH}/scans/magz-test/`;
          resultFolder = '2020-08-02T18-30-20.460Z';
          urlCrawled = 'https://www.magzb.ca';
          urlFile =
            '/home/magz/workspace/crawls/magz-test/magz-test_2020-08-02T01-19-56.619916.txt';
          break;
        case '-urlCrawled':
          urlCrawled = getValue();
          break;
        case '-siteName':
          siteName = getValue();
          resultFolderPath = `${PROJECT_PATH}/scans/${siteName}/`;
          // resultFolder = `${PROJECT_PATH}/scans/${siteName}/`;
          break;
        case '-urlFile':
          urlFile = getValue();
          break;
        case '-level':
          scanLevel = getValue();
          break;
        case '-siteFolder':
          // Will override the default set.
          let siteFolder = getValue();
          if (!siteFolder.endsWith('/')) {
            siteFolder += '/';
          }
          resultFolderPath = `${PROJECT_PATH}/scans/${siteFolder}`;
          break;
        case '-prefix':
          resultPrefix = getValue();
          break;
        case '-mobile':
          scanMobile = true;
          break;
      }
    } catch (err) {
      console.log('Error: ', err);
      return;
    }
  });

  if (
    (scanLevel !== 'a' && scanLevel !== 'aa' && scanLevel !== 'aaa') ||
    siteName === '' ||
    urlFile === '' ||
    urlCrawled === ''
  ) {
    validArgs = false;
  }
  if (validArgs) {
    if (testFeat) {
      onScanningCompleted();
    } else {
      // Initialize the master JSON which will contain a summary of counts,
      // and the mapping of sitepage url -> result file JSON.
      masterObj = {
        urlScanned: urlCrawled,
        totalViolations: 0,
        scannedPages: [],
        topViolations: {
          critical: 0,
          serious: 0,
          moderate: 0,
          minor: 0,
        },
      };
      // create a folder that is timestamped
      const tstamp = new Date().toISOString().replace(/:/g, '-');
      resultFolder = tstamp;
      fs.promises
        .mkdir(resultFolderPath + tstamp, { recursive: true })
        .then(async () => {
          // resultFolderPath = resultFolder; // + tstamp + '/';
          launchScanner();
        })
        .catch((err) => {
          throw err;
        });
    }
  } else {
    console.log(appArgumentsDesc);
  }
})();
