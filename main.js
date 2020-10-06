/**Routing
Start a HTTP server on port 3000
Handle routes:
/: return some welcome page
/players: return a list of dummy players
Request
Add a form to the welcome page
Add a “playername” <input>
Submit a request to /create-player
Add route /create-player and parse the incoming data
Log the received player name to the console
Response
Write the player name to a file
List available players on route /players
Add the option to delete a player
*/
const http = require("http");
const url = require("url");
const { parse } = require('querystring');
const fs = require('fs');
const path = require('path');

var port = 3000;
const fileName = "playersName.json"

// Props go to https://gist.github.com/prof3ssorSt3v3/8d9fc6be89d3aefd3ea84b92f923181a
const server = http.createServer(function(req, res) {
    let parsedURL = url.parse(req.url, true);
    let path = parsedURL.pathname;
    // parsedURL.pathname  parsedURL.query
    // standardize the requested url by removing any '/' at the start or end
    // '/folder/to/file/' becomes 'folder/to/file'
    path = path.replace(/^\/+|\/+$/g, "");
    let qs = parsedURL.query;
    let headers = req.headers;
    let method = req.method.toLowerCase();

    let body = '';
  
    req.on("data", chunk => {
      console.log(`got some data:  $(chunk)`, chunk);
      body += chunk.toString();
      //if no data is passed we don't see this messagee
      //but we still need the handler so the "end" function works.
    });
    req.on("end", function() {
      //request part is finished... we can send a response now
      //we will use the standardized version of the path
      let route =
        typeof routes[path] !== "undefined" ? routes[path] : routes["notFound"];
      let data = {
        path: path,
        queryString: qs,
        headers: headers,
        method: method,
        body: body
      };
      //pass data incase we need info about the request
      //pass the response object because router is outside our scope
      route(data, res);
    
    });
});
server.listen(port, function() {
    console.log('Server running at http://127.0.0.1:' + port + '/');
  });





const routes = {
    '': function (data, res) {
        //this one is home
        res.setHeader("Content-Type", "text/html");
        fs.readFile('./index.html', null, function (error, data) {
            if (error) {
                res.writeHead(404);
                res.write('Whoops! File not found!');
            } else {
                res.write(data);
            }
            res.end();
        });
    },
    "players" : function (data, res) {
        let players = null;
        var contents = '';
        try {
            contents = fs.readFileSync(fileName, 'utf8');
            let playerNamesJson = JSON.parse(contents);
            console.log("Players are:", playerNamesJson);
            let payloadStr = JSON.stringify(playerNamesJson);
            res.setHeader("Content-Type", "text/html");
            res.setHeader("Access-Control-Allow-Origin", "*");
            res.writeHead(200);
            let listenItems = ``;
    
            playerNamesJson.forEach(element => {
                listenItems += `<li>${element.playerName}</li>`;
            });
            res.write(`
            <!doctype html>
            <html>
            <body>
                <label>Playernames: </label>
                <ul>
                    ${listenItems}
                </ul>
                <a href="/"> Back To Home </a>
            </body>
            </html>
        `);
        res.end("\n");
        }
        catch {
            console.log("File does not exist");
        }
       
        
       
        

    },
    "create-player" : function(data, res) {
        let outputData = parse(data.body);
        let playerName = outputData.playerName;
        let outputText = `Player could not be created`;
        if(playerName!= null && playerName !== ""){
            writeToFile(playerName);
            outputText = `Player ${playerName} has been created`;
        }
        
        res.setHeader("Content-Type", "text/html");
        res.setHeader("Access-Control-Allow-Origin", "*");
        res.writeHead(200);
        res.write(`
        <!doctype html>
        <html>
        <body>
            <label>${outputText}</label>
            <div> <a href="/"> Back To Home </a></div> 
            <div> <a href="/players"> See all players </a></div>
        </body>
        </html>
    `);
        res.end("\n");
    },
    "notFound": function(data, res) {
        //this one gets called if no route matches

        res.setHeader("Content-Type", "text/html");
        fs.readFile('./notFound.html', null, function (error, data) {
            if (error) {
                res.writeHead(404);
                res.write('Whoops! File not found!');
            } else {
                res.write(data);
            }
            res.end();
        });
    }


};

function writeToFile(playerName){
    const playerNameObjectJson = {playerName: playerName};
    const playerNameArrayObjectJson = [playerNameObjectJson];

    fs.stat(fileName, function(err, stat) {
        if(err == null) {
            console.log('File exists');
            // Get Json Data from File
            let rawdata = fs.readFileSync(path.resolve(__dirname, fileName));
            let playerNamesJson = JSON.parse(rawdata);
            // console.log("playerNamesJson:", playerNamesJson);
            playerNamesJson.push(playerNameObjectJson);
            fs.writeFileSync(path.resolve(__dirname, fileName), JSON.stringify(playerNamesJson));

        } else if(err.code === 'ENOENT') {
            // file does not exist
            fs.writeFileSync(path.resolve(__dirname, fileName), JSON.stringify(playerNameArrayObjectJson));
        } else {
            console.log('Some other error: ', err.code);
        }
    });
};

