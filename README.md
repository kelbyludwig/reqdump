## reqdump

dumps all requests issued when a particular page is loaded

## setup

```
$ npm install chrome-remote-interface command-line-args
$ chrome --disable-gpu --headless --remote-debugging-port=9222 &
$ CPID=$!
$ node reqdump.js --url https://www.google.com
$ kill $CPID
```
