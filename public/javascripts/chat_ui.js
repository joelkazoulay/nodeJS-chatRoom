/*globals $,io,Chat*/
function divEscapedContentElement(message) {
    'use strict';

    return $('<div></div>').text(message);
}

function divSystemContentElement(message) {
    'use strict';

    return $('<div></div>').html('<i>' + message + '</i>');
}

function processUserInput(chatApp) {
    'use strict';

    var $sendMessage = $('#send-message'),
        message = $sendMessage.val(),
        systemMessage;

    if (message.charAt(0) === '/') {
        systemMessage = chatApp.processCommand(message);

        if (systemMessage) {
            $('#message').append(divSystemContentElement(systemMessage));
        }
    } else {
            chatApp.sendMessage($('#room').text(), message);
            var $messages = $('#messages');
            $messages.append(divEscapedContentElement(message));
            $messages.scrollTop($messages.prop('scrollHeight'));
        }

        $sendMessage.val('');
}

var socket = io.connect();

$(document).ready(function() {
    'use strict';

    var chatApp = new Chat(socket),
        $room = $('#room'),
        $messages = $('#messages'),
        $sendMessages = $('#send-message');

    socket.on('nameResult', function(result) {
        var message;

        if(result.success) {
            message = 'You are now known as ' + result.name + '.';
        } else {
            message = result.message;
        }

        $('#messages').append(divSystemContentElement(message));
    });

    socket.on('joinResult', function(result) {
        $room.text(result.room);
        $messages.append(divSystemContentElement('Room changed'));
    });

    socket.on('message', function(message) {
        var newElement = $('<div></div>').text(message.text);
        $messages.append(newElement);
    });

    socket.on('rooms', function(rooms) {
        var $roomList = $('#room-list');
        $roomList.empty();

        for(var room in rooms) {
            room = room.substring(1, room.length);
            if(room !== '') {
                $roomList.append(divEscapedContentElement(room));
            }
        }

        $('#room-list div').click(function() {
            chatApp.processCommand('/join ' + $(this).text());
            $sendMessages.focus();
        });
    });

    setInterval(function() {
        socket.emit('rooms');
    }, 1000);

    $sendMessages.focus();

    $('#send-form').submit(function() {
        processUserInput(chatApp, socket);
        return false;
    });
});