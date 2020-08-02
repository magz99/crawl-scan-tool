import subprocess

def on_after_complete(crawlFilePath, filePrefix):
    print("crawl has completed")
    # /home/magz/workspace/crawls/magz-test/magz-test_2020-08-02T01-19-56.619916.txt
    
    subprocess.call(["/home/magz/workspace/crawl-scan-tool/app-crawler/scripts/scanner-runner.sh", crawlFilePath, filePrefix])



# if __name__=="__main__":
#     on_after_complete("/home/magz/workspace/crawls/magz-test/magz-test_2020-08-02T01-19-56.619916.txt", "magz-test")