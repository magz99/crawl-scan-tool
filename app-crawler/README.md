# Setup

- make sure you have node installed. I am currently using v13.0.1
- python 3.8 needs to be installed on your local machine (I used PIP to install)
- Scrapy third party library needs to be installed as well: https://scrapy.org

# Running the crawler

- from the `/crawler/spiders/` folder, run `scrapy crawl myspider -a filename=file-to-save-urls -a url=base-url-to-crawl`
  -- `scrapy` may not be required if you have installed this globally on your machine
  -- The `filename` and `url` parameters are required
  -- filename indicates where the file containing the list of urls will be called. It will be created in the same folder.
  -- filename should not have an extension. A txt file with a timestamp will be created.
  -- url will be the base url to begin your crawl. Please make sure the protocol is specified.

# Next Steps and Improvements

- The next steps for this include:
  -- writing test cases?
  -- cleaning up the code a bit more
  -- need to use best practices for Python.
  -- testing the performance with really large websites (we could try on the microsoft.com site?)
  -- ability to specify the `path` to where the file will be saved
  -- logging
  -- connecting this to AWS (once the crawl is complete, upload the results to S3)
