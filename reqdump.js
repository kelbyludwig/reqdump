const CDP = require('chrome-remote-interface');
const commandLineArgs = require('command-line-args')

// command line options
const optionDefinitions = [
  { name: 'url', alias: 'u', type: String },
  { name: 'ignore', alias: 'i', type: String, multiple: true },
]
const options = commandLineArgs(optionDefinitions)

// command line option processing
if (!("url" in options)) {
    console.error("please provide a url via --url");
    return
}

function requestLogger(options) {
    if ("ignore" in options) {
        exts = options.ignore
        function log(url) {
            ext = url.split(".").pop();
            if (exts.indexOf(ext) == -1) {
                console.log(url);
            }
        }
        return log
    }
    return console.log
}

CDP((client) => {

    const {Network, Page} = client;

    //add handler to log all requests
    logger = requestLogger(options);
    Network.requestWillBeSent((params) => {
        logger(params.request.url);
    });

    //add handler to close client after page is done loading
    Page.loadEventFired(() => {
        client.close();
    });

    // enable events then start!
    Promise.all([
        Network.enable(), // "Enables network tracking, network events will now be delivered to the client."
        Page.enable()     // "Enables page domain notifications."
    ]).then(() => {
        return Page.navigate({url: options.url});
    }).catch((err) => {
        console.error(err);
        client.close();
    });
}).on('error', (err) => {
    // cannot connect to the remote endpoint
    console.error(err);
    console.error("have you started a chrome debug server?");
});
