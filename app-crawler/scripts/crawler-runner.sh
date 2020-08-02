#!/bin/bash
cd ../crawler/spiders
scrapy crawl myspider -a filename=$1 -a url=$2