const express = require('express');
const app = express();
const http = require('http').Server(app);
const io = require('socket.io')(http);

http.listen(3000, ()=>{
  console.log('listening on :3000');
});

app.use(express.static(__dirname + '/public'));

let users = [];
let logHistory = [];

io.on('connection', function(socket){

        socket.on('add user', function(username, userNikname) {
            if (checkUsers(username, userNikname)) {
                socket.username = username;
                users.push({username, nickname: userNikname, id: socket.id, status: 'just appeared'});

                statusToOnline(socket);

                socket.broadcast.emit('connection', users, socket.username, []);
                socket.emit('connection', users, socket.username, logHistory);

            } else {
                socket.emit('name is busy', username, userNikname);
            }
        })

        socket.on('chat message', function(msg){
            let data = {
                msg: msg,
                name: socket.username,
                time: new Date(),
                id: socket.id
            }
            logHistory.push(data)

            if (logHistory.length > 100) {
                logHistory.shift();
            }

            if (msg[0] === '@') {
                let nick = msg.split(' ')[0].split('@')[1];
                let send = false;
                for (let i = 0; i< users.length; i++) {
                    if (users[i].nickname === nick) {
                        io.emit('chat message', msg, socket.username, socket.id, users[i].id);
                        send = true;
                        break;
                    }
                }
                if (!send) {io.emit('chat message', msg, socket.username, socket.id);}
            } else {
                io.emit('chat message', msg, socket.username, socket.id);
            }
        });

        socket.on('disconnect', function () {
            users.forEach(function(el){
                if (el.id === socket.id) {
                 el.status = 'offline';
                }
            })
            io.emit('disconnect',users, socket.username)
        })

        socket.on('typing', function () {
            socket.broadcast.emit('typing',socket.username)
        });

        socket.on('stop typing', function () {
            socket.broadcast.emit('stop typing',socket.username)
        });
});


function checkUsers(username, userNikname) {
    let count = 0;
    if (users.length > 0) {
        for (let i = 0; i < users.length; i++) {
            if (users[i].username === username || users[i].username === userNikname || users[i].userNikname === username || users[i].userNikname === userNikname) {
                return false;
            } else {
                count++;
            }
        }
        if (count === users.length) {return true} else {return false};
    } else {
        return true;
    }
}

function statusToOnline(socket) {
    setTimeout(()=>{
        for (let i = 0; i< users.length; i++) {
            if (users[i].id===socket.id && users[i].status != 'offline') {
                users[i].status = 'online';
                socket.broadcast.emit('update status', users);
                socket.emit('update status', users);
                break;
            }
        }
    }, 60000);
}
