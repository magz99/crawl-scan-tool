# crawl-scan-tool

## Running the Crawling and Scanning workflow

- run: `python3 app-crawler/main.py -fp <your file prefix> -url <url to crawl>`
- Example: `python3 app-crawler/main.py -fp magz-a11y -url https://www.magzb.ca`
- the File prefix is simply the name of the folder/files (without the extension) for your crawl
- url should be formatted to include the protocol: `https://`

1. The scrapy crawling will happen on the url to collect all the webpages containing the same path
2. A text file containing a list of valid urls will be generated
3. The scanning tool then runs, and launches a Chrome browser
4. The axe accessibility script is injected, and each url will generate a JSON result
5. After all the pages have been scanned, a master JSON file will be generated that contains:
   a) a sum of total violations
   b) a count of violation types
   c) a mapping of urls to their respective JSON result file
6. The AWS s3 script is then execute to upload these results to the cloud
