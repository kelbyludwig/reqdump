const CDP = require('chrome-remote-interface');
const commandLineArgs = require('command-line-args');
const { URL } = require('url');

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
            if (url) {
                url = new URL(url);
                ext = url.pathname.split(".").pop();
                if (exts.indexOf(ext) == -1) {
                    return url.href;
                }
            }
            return ""
        }
        filters.push(ifilter);
    }

    if ("no_params" in options) {
        function pfilter(url) {
            if (url) {
                url = new URL(url);
                return url.origin + url.pathname;
            }
            return ""
        }
        filters.push(pfilter);
    }

    function logger(url) {
        var url = new URL(url);
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
