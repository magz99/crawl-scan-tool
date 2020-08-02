# crawl-scan-tool

## Running the Crawler

- cd into the app-crawler folder
- from there run: `python3 main.py -fp <your file prefix> -url <url to crawl>`
- the File prefix is simply the name of the folder/files (without the extension) for your crawl
- url should be formatted to include the protocol: `https://` 


## Running the Scanner

- cd into the app-scanner folder
- from there run: `node app-scanner.js -urlFile <path> -siteName <name>`