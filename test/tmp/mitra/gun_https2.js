//var port = process.env.OPENSHIFT_NODEJS_PORT || process.env.VCAP_APP_PORT || process.env.PORT || process.argv[2] || 8080;

const port = 4246;

const https = require('https');
const http = require('http');
const fs = require('fs');
process.env.GUN_ENV = "false";
const Gun = require('gun');
const path = require('path');

const usehttps = false;

const options =
    usehttps ?  {
        key: fs.readFileSync('/etc/letsencrypt/live/dweb.me/privkey.pem'),
        cert: fs.readFileSync('/etc/letsencrypt/live/dweb.me/fullchain.pem'),
    }  : {};
var h = usehttps ? https : http
//var server = h.createServer(options, (req, res) => {
var server = h.createServer((req, res) => {
	if(Gun.serve(req, res)){ return } // filters gun requests!
    res.writeHead(200);
    res.end('go away - nothing for browsers here\n');

	/*
	fs.createReadStream(path.join(__dirname, req.url))
    .on('error',function(){ // static files!
        res.writeHead(200, {'Content-Type': 'text/html'});
        res.end(fs.readFileSync(path.join(__dirname, 'index.html'))); // or default to index
        })
    .pipe(res); // stream
    */
});


//TODO-GUN put this into a seperate require
function hijack(cb) {
    /* Intercept outgoing message and replace result with
        result from cb({soul, key, msg, original})
     */

    Gun.on('opt', function (root) {
        console.log("GUN: Hikacking loading trap");
        if (root.once) {
            return
        }
        root.on('out', function (msg) {
            console.log("GUN: Hikacking starting outgoing message=", msg);
            let to = this.to;
            // TODO-GUN - this wont work when running locally in a script ONLY when running in server
            if(msg['@'] && !msg.put) {
                console.log("GUN: Hikacking outgoing message", msg);
                setTimeout(function(){  // TODO-GUN its unclear why this timeout is here, other than for testing
                    let tmp = root.dup.s[msg['@']];
                    let original = tmp && tmp.it && tmp.it.get;
                    console.log("GUN: Hikacking outgoing message original=", original);
                    if (original) {
                        let soul = original['#'];
                        let key = original['.'];
                        console.log("GUN.hijack: soul=",soul,"key=", key);
                        let res;
                        try {
                            //TODO - this res now has to be async
                            res = cb({soul, key, msg, original});   // Note response can be undefined if error
                        } catch(err) {
                            console.warn("Gun.hijack callback error",err);
                            res = undefined;
                        }
                        msg.put = {
                        [soul]: {
                                _: {
                                    '#': soul,
                                    '>': {[key]: Gun.state()}
                                },
                                [key]: res    // Note undefined should (hopefully) be a valid response
                        }    };
                        console.log("GUN.hijack updated msg =", msg);
                        // NOTE: this doesn't necessarily save it back to
                        // this peers GUN data, (I (Mitra) thinks that may depend on other processes and order of Gun.on)
                    }
                    to.next(msg);
                }, 100);    //Just for testing and note that its async
            } else {
                to.next(msg); // pass to next middleware
            }
        });
        this.to.next(root); // This is next for the Gun.on('opt'), not for the root.on('out')
    });
}
hijack(function({soul=undefined, key=undefined, msg=undefined, original=undefined}={}) {
    console.log("GUN: hijack testing", soul, key, msg, original);
    return ("GUN: This is a test result");
});

var gun = new Gun({
    web: server
});


server.listen(port);

console.log(usehttps ? "HTTPS" : "HTTP", 'Server started on port ' + port + ' with /gun');
