var Chat = function(socket) {
    'use strict';

    this.socket = socket;
};

Chat.prototype.sendMessage = function(room, text) {
    'use strict';

    var message = {
        room: room,
        text: text
    };

    this.socket.emit('message', message);
};

Chat.prototype.changeRoom = function(room) {
    'use strict';

    this.socket.emit('join', {
        newRoom: room
    });
};

Chat.prototype.processCommand = function(command) {
    'use strict';

    var words = command.split(' '),
        Command = words[0]
            .substring(1, words[0].length)
            .toLowerCase(),
        message = false;

    switch(Command) {
        case 'join':
            words.shift();
            var room = words.join(' ');
            this.changeRoom(room);
            break;

        case 'nick':
            words.shift();
            var name = words.join(' ');
            this.socket.emit('nameAttempt', name);
            break;

        default:
            message = 'Unrecognized command.';
            break;
    }

    return message;
};