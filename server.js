/*globals require,console*/
var http = require('http'),
    fs = require('fs'),
    path = require('path'),
    mime = require('mime'),
    cache = {},
    chatServer = require('./lib/chat_server');

var send404 = function(response) {
    'use strict';

    response.writeHead(404, {'Content-Type': 'text/plain'});
    response.write('Error 404: resource not found.');
    response.end();
};

var sendFile = function(response, filePath, fileContents) {
    'use strict';

    response.writeHead(200, {
        'Content-Type': mime.lookup(path.basename(filePath))}
    );
    response.end(fileContents);
};

var serveStatic = function(response, cache, absPath) {
    'use strict';

    if(cache[absPath]) {
        sendFile(response, absPath, cache[absPath]);
    } else {
        fs.exists(absPath, function (exists) {
            if (exists) {
                fs.readFile(absPath, function(err, data) {
                    if (err) {
                        send404(response);
                    } else {
                        cache[absPath] = data;
                        sendFile(response, absPath, data);
                    }
                });
            } else {
                send404(response);
            }
        });
    }
};

var server = http.createServer(function(request, response) {
    'use strict';

    var filePath;

    if(request.url === '/') {
        filePath = './public/index.html';
    } else if (request.url.indexOf('node_modules') !== -1) {
        filePath = '../' + request.url;
    } else {
        filePath = './public' + request.url;
    }

    serveStatic(response, cache, filePath);
});

server.listen(3000, function() {
    'use strict';

    console.log('Server listening on port 3000.');
});

chatServer.listen(server);