const CDP = require('chrome-remote-interface');
const commandLineArgs = require('command-line-args')

// command line options
const optionDefinitions = [
  { name: 'url', alias: 'u', type: String },
]
const options = commandLineArgs(optionDefinitions)

if (!("url" in options)) {
    console.error("please provide a url via --url");
    return
}

CDP((client) => {

    const {Network, Page} = client;

    //add handler to log all requests
    Network.requestWillBeSent((params) => {
        console.log(params.request.url);
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
