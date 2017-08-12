const CDP = require('chrome-remote-interface');
const commandLineArgs = require('command-line-args')

// command line options
const optionDefinitions = [
  { name: 'url', alias: 'u', type: String },
  { name: 'ignore', alias: 'i', type: String, multiple: true },
  { name: 'no_params', alias: 'n', type: Boolean },
]
const options = commandLineArgs(optionDefinitions)

// command line option processing
if (!("url" in options)) {
    console.error("please provide a url via --url");
    return
}

function requestLogger(options) {

    filters = [];
    if ("ignore" in options) {
        exts = options.ignore;
        function ifilter(url) {
            ext = url.split(".").pop();
            ext = ext.split("?")[0];
            if (exts.indexOf(ext) == -1) {
                return url;
            }
            return ""
        }
        filters.push(ifilter);
    }

    if ("no_params" in options) {
        function pfilter(url) {
            url = url.split("?")[0];
            return url;
        }
        filters.push(pfilter);
    }

    function logger(url){
        for (var i in filters) {
            url = filters[i](url);
        }
        if (url) {
            console.log(url);
        }
    }
    return logger;
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
