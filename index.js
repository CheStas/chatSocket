const express = require('express');
const app = express();
const http = require('http').Server(app);
const bodyParser = require('body-parser');

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

http.listen(3000, ()=>{
  console.log('listening on :3000');
});

app.use(express.static(__dirname + '/public'));

let users = [];
let logHistory = [];

app.get('/messages', (req, res) =>{
    res.json(logHistory);
})
app.get('/users', (req, res) =>{
    res.json(users);
})

app.post('/messages', (req, res) =>{
    let msg = req.body;
    let data = {
        text: msg.text,
        name: msg.name,
        nick: msg.nick,
        time: new Date()
    }

    if (data.text[0] === '@') {
        let nick = data.text.split(' ')[0].split('@')[1];
        for (let i = 0; i < users.length; i++) {
            if (users[i].nick === nick) {
                data.forUser = nick;
                break;
            }
        }
    }
    logHistory.push(data)

    if (logHistory.length > 100) {
        logHistory.shift();
    }
})
app.post('/users', (req, res) =>{
    users.push(req.body);
})

app.get('/checkUsers/:name/:nick', (req, res) => {
    res.json(checkUsers(req.params.name, req.params.nick));
})

function checkUsers(username, userNikname) {
    let count = 0;
    if (users.length > 0) {
        for (let i = 0; i < users.length; i++) {
            if (users[i].name == username || users[i].name == userNikname || users[i].nick == username || users[i].nick == userNikname) {
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
