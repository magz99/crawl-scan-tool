import argparse


def main(args):
    return


if __name__ == "__main__":
    # get an arg parser
    parser = argparse.ArgumentParser()

    parser.add_argument('-f', '--filename', )

    args = parser.parse_args()

    # os.system(...).format(..)

    # scrapy crawl myspider -a filename=file-to-save-urls.txt -a url=base-url-to-crawl
