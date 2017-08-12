## reqdump

dumps all requests issued when a particular page is loaded

## setup

```
$ npm install chrome-remote-interface command-line-args
$ chrome --disable-gpu --headless --remote-debugging-port=9222 &
$ CPID=$!
$ node reqdump.js --url https://www.google.com
$ node reqdump.js --url https://www.google.com -i js -i jpg -i css -i png -i woff2 # ignore certain extensions
$ kill $CPID
```
