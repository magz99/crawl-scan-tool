import argparse
import subprocess

global PROJECT_PATH
PROJECT_PATH = "/home/magz/workspace/crawl-scan-tool"

def init_argparse() -> argparse.ArgumentParser:
    parser = argparse.ArgumentParser(
        usage="%(prog)s -fp [FILE PREFIX] -url [URL TO PARSE]...",
        description="Crawl a website"
    )
    parser.add_argument(
       "-fp", "--fileprefix", 
       required="true", 
       help="provide the file prefix for your crawl folder and results file"
    )
    parser.add_argument(
        "-url", required="true",
        help="url that will be crawled"
    )

    return parser

def main() -> None:

    parser= init_argparse()
    args = parser.parse_args()

    execute_spider(args.fileprefix, args.url)

# Executes the bash script which will run the Scrapy crawl command
def execute_spider(fileName, urlToCrawl):
    print("executing the crawl spider on:", fileName, urlToCrawl)
    subprocess.call([PROJECT_PATH + "/app-crawler/scripts/crawler-runner.sh", PROJECT_PATH, fileName, urlToCrawl])

def on_after_complete(crawlFilePath, filePrefix, urlToCrawl):
    print("crawl has completed")
    # /home/magz/workspace/crawls/magz-test/magz-test_2020-08-02T01-19-56.619916.txt
    
    subprocess.call([PROJECT_PATH + "/app-crawler/scripts/scanner-runner.sh", crawlFilePath, filePrefix, urlToCrawl])


if __name__ == "__main__":
    main()