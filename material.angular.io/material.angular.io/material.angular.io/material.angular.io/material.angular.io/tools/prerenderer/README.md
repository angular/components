To prerender:

    $ npm install # I added mkdirp dip 
    $ ./node_modules/.bin/webdriver-manager update # Only necessary if chromedriver isn't already installed
    $ npm start
    $ # Then in separate shell:
    $ npm run prerender

This will run the get-all-urls script to get the URLs of all pages in the dist/pages/, 
and then generate a JSON file of all the urls. The URLs are sharded into 10 chunks, 
and then separate spec files are created in prerender-specs/ for each shard so that 
protractor can launch 10 browser instances to concurrently prerender pages.

Note that it would probably take around 10 minutes to render all 6600 pages. 
Some pages will 404. So in order to get a quick sample you could just kill the prerender 
process after it's successfully saved a couple of pages to dist/prerendered/.