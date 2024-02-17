const http = require('http');
    fs= require('fs'),
    url= require('url');

http.createServer((request, reponse) => {
    let addr = request.url,
        q = new URL(addr, 'http://' + request.headers.host),
        filePath = '';
    fs.appendFile('log.txt', 'URL: ' + addr + '\nTimestamp: ' + new Date() + '\n\n', (err) => {
        if (err) {
            console.log(err);
        } else {
            console.log('Added to log.');
        }
    });

    if (q.pathname.includes('documentation')) {
        filePath = (_dirname + '/documentation.html');
    } else {
        filePath = 'index.html';
    }

    fs.readFile(filePath, (err, data) => {
        if (err) {
            throw err;
        }
        reponse.writeHead(200, {'Content-Type': 'text/html'});
        reponse.write(data);
        reponse.end();

    });
}).listen(8080);
console.log('My test serveris running on Port 8080.');