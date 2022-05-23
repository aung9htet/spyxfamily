exports.init = function(io) {

    // the chat namespace
    const chat= io
        .of('/chat')
        .on('connection', function (socket) {
            try {
                /**
                 * it creates or joins a room
                 */
                socket.on('create or join', function (room, userId) {
                    socket.join(room);
                    chat.to(room).emit('joined', room, userId);
                });

                socket.on('chat', function (room, userId, chatText) {
                    chat.to(room).emit('chat', room, userId, chatText);
                });

                socket.on('draw', function (room, userId, x, y, x1, y1, x2, y2, painting, color, line, mode) {
                    console.log("Drawing emitted")
                    socket.broadcast.to(room).emit('draw', room, userId, x, y, x1, y1, x2, y2, painting, color, line, mode);
                });

                socket.on('send', function (room, userId, resultId, resultName, resultDescription, resultUrl, resultColor) {
                    console.log("Sending")
                    socket.broadcast.to(room).emit('send', room, userId, resultId, resultName, resultDescription, resultUrl, resultColor);
                });

                socket.on('disconnect', function(){
                    console.log('someone disconnected');
                });
            } catch (e) {
            }
        });
}
