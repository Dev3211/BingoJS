var login = require('./handlers/handleLogin');
    client = require('./handlers/client'),
    logger = require('js-logs'),
    log = require('js-logs'),
	config = require("./config"),
    net = require('net');

Login1 = config.ports.Login;

function Login() {
    console.log(log.success('The source is starting!'));
    var server = net.createServer(function(socket) {
        console.log('A client has connected' + "\r\n");
        var clientObj = new client(socket);
        socket.on('data', function(data) {
            data = data.toString().split('\0')[0];
	        console.log('Incoming data: ' + data + "\r\n");
            var dataType = data.charAt(0);
            if (dataType == '<') {
                login.handleXml(data, clientObj);
            }
        });
    });

    server.listen(Login1, function() {
        console.log('Server is listening on port 6112');
    });

}

Login();
