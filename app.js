// Express initializes 'app' to be a function handler you can supply to an HTTP server.
var app = require('express')();
var express = require('express');
var swig = require('swig');
var path = require('path');
var http = require('http').createServer(app);
var io = require('socket.io').listen(http);
var playerlocation = 0;
var playerlist = [];

// We define a route handler / that gets called when we hit our website home.
app.get('/', function(req,res) {
   res.sendFile(path.join(__dirname,'/public/index.html'));
});

app.engine('html', swig.renderFile);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'html');

app.use(express.static(path.join(__dirname, 'public')));

// make the http server listen on port 3000
var port = process.env.PORT || '3000';
http.listen(port, function() {
    console.log('listening on port 3000');
});

//Listen on the connection event for incoming sockets and log it to the console.
io.on('connection', function (socket) {
    console.log('a user connected');
    socket.on('recievedata', function (positionx, positiony, currentanimation, gamename) {
        socket.broadcast.emit('playermove', positionx, positiony, currentanimation, gamename);
    });
    
    socket.on('initializeplayer', function (newplayername) {
        /* add a new property to socket and pass it the new player's name to divide each socket by its own name */
        socket.clientname = newplayername;
        playerlist.push(newplayername); //list of current players
        io.sockets.emit('addplayer', playerlist, newplayername);  // broadcase to every player a new player has joined
    });
});

// catch 404 and forward to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});