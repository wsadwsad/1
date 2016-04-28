var io = require('socket.io').listen(1337);

console.log('listening on port 1337')
io.sockets.on('connection', function(socket) {

    io.set('log level', 1);

    socket.on('start', function(){
        socket.emit('setRemoteId', socket.id);
        console.log("broadcast new player with remote id "+socket.id);
        socket.broadcast.emit('join', {remoteId:socket.id});

        //send all existing clients to new
        for(var i in io.sockets.sockets){
            socket.emit('join', {remoteId: i});
        }
    });

    socket.on('impactconnectbroadcasting', function(data) {
        socket.broadcast.emit(data.name, data.data);
    });

    socket.on('announce', function(data) {
        io.sockets.emit('announced', data);
    });

    socket.on('disconnect', function() {
        console.log("disconnecting: "+socket.id);
        socket.broadcast.emit('removed', {remoteId: socket.id});
    });

});