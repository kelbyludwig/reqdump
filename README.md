## reqdump

dumps all requests issued when a particular page is loaded

## setup

```
$ npm install
$ chrome --disable-gpu --headless --remote-debugging-port=9222 &
$ node reqdump.js --url google.com
```
