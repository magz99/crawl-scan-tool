#!/bin/bash
cd $1/app-crawler/crawler/spiders
scrapy crawl myspider -a filename=$2 -a url=$3