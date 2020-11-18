# The goal is to execute the spider with the correct command-line arguments
# The user should only interact with this main script via command-line
import argparse

def main():
    parser = argparse.ArgumentParser(description="Execute a site crawl and save the crawled urls in a file")
    parser.add_argument("--savefile", default="", type=str, required=True, help="The name of the folder and file prefix where the urls will be saved")
    parser.add_argument("--url", default="", type=str, required=True, help="The url to crawl. Must have the protocol specified")
    args = parser.parse_args()


if __name__ == "__main__":
    main()