# Setup

- make sure you have node installed. I am currently using v13.0.1
- do an `npm install` due to requiring the axe-core library and puppeteer

# Running the scanner

- run `node scanner.js` from the app-scanner folder, it will produce a cmd output indicating parameters you should be using.

- Typical run:
  `node app-scanner.js -urlFile <path> -siteName <name>`
- the urlFile path is the location of your file containing the website urls. ie. `./sites/rangle.io-links.txt`
- the siteName is generally the website hostname, for easy identification of the crawls and scan results.

- The default scans result folder to house the result JSON will be: `./scans/${siteName}/`

# Assumptions

- We already assume that the site has been crawled, and that a file containing all its urls has been created before running this script.

# Next Steps and Improvements

- The next steps for this include:
  -- writing test cases?
  -- cleaning up the code a bit more
  -- testing the performance with really large websites (we can start by doing a full rangle.io scan)
  -- the results JSON actually need to be used to create a summary for the website (although this could potentially be done on the front-end)
  -- connecting this to AWS (once the scan is complete, upload the results to S3)
  -- logging
  -- adding timestamps to each scan (a user will have the ability to view history of scans)
