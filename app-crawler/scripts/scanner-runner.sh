#!/bin/bash
cd /home/magz/workspace/crawl-scan-tool/app-scanner
node scanner.js -urlFile $1 -siteName $2 -urlCrawled $3
