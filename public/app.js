const socket = io();

const text = document.getElementsByClassName('text');
const messages = document.getElementsByClassName('messages');
const userName = document.getElementsByClassName('user-name');
const userNikname = document.getElementsByClassName('user-nick');
const usersListWrap = document.getElementsByClassName('usersList');
const enterButton = document.getElementsByClassName('enter-button');
const sendButton = document.getElementsByClassName('send-message');


text[0].addEventListener('focus', () =>{
    socket.emit('typing');
});

text[0].addEventListener('blur', () =>{
    socket.emit('stop typing');
});

enterButton[0].addEventListener('click', () =>{
    if (userName[0].value.length > 0 && userNikname[0].value.length > 0 ){
        socket.emit('add user', userName[0].value, userNikname[0].value);
        document.getElementsByClassName('enter')[0].classList.add('none');
        userName[0].value = '';
        userNikname[0].value = '';
    } else {
        if (userName[0].value.length === 0) {
            document.getElementsByClassName('not-valid')[0].innerHTML = 'name is important';
        }
        if (userNikname[0].value.length === 0) {
            document.getElementsByClassName('not-valid')[0].innerHTML = 'nick name is important';
        }
    }
});

sendButton[0].addEventListener('click', ()=> {
    if (text[0].value.length > 0) {
        socket.emit('chat message', text[0].value);
        text[0].value= '';
        socket.emit('stop typing');
    }
})

text[0].addEventListener('keypress', function(e) {
    if (e.keyCode === 13) {
        if (text[0].value.length > 0) {
            socket.emit('chat message', text[0].value);
            text[0].value= '';
            socket.emit('stop typing');
        }
    }
})


socket.on('name is busy', (username, userNikname) =>{
    document.getElementsByClassName('enter')[0].classList.remove('none');
    userName[0].value = username;
    userNikname[0].value = userNikname;
    document.getElementsByClassName('not-valid')[0].innerHTML = 'this name is busy';
});

socket.on('chat message', function(msg, username, id, forUserId){
    insertPost(msg, username, Date(), id, socket.id, forUserId);
});

socket.on('connection', function(users, username, messages){
    insertUserList(users, socket.id)
    history(messages);
    botMessage(users, username, 'connected');
});

socket.on('disconnect', function(users, username){
    botMessage(users, username, 'disconnected')
    insertUserList(users, socket.id)
});

socket.on('update status', function(users){
    insertUserList(users, socket.id)
});

socket.on('typing', function(name){
    let el = document.getElementsByClassName('typing');
    el[0].innerHTML = '@' + name + ' is typing..';
});

socket.on('stop typing', function(name){
    let el = document.getElementsByClassName('typing');
    el[0].innerHTML = '';
});


function history(data) {
    for (var i = 0; i < data.length; i++) {
        insertPost(data[i].msg, data[i].name, data[i].time, data[i].id)
    }
}

function createPost(msg, username, time, id, socketId, forUserId) {
    let message = document.createElement('div')
    let text = document.createElement('p')
    message.classList.add('message')
    text.classList.add('message__text')

    text.innerHTML = msg

    if (id === socketId) {
        text.classList.add('my')
    } else {
        let name = document.createElement('p');
        name.classList.add('name');
        name.innerHTML = username;
        message.appendChild(name);
    }

    if (forUserId && socketId === forUserId) {
        text.classList.add('forMe')
    }

    message.appendChild(createTime(time));
    message.appendChild(text);
    return message;
}

function insertPost(msg, username, time, id, socketId, forUserId ) {
    messages[0].appendChild(createPost(msg, username, time, id, socketId, forUserId));
    if (messages[0].childElementCount > 100) {
        messages[0].removeChild(messages[0].firstElementChild)
    }
    window.scrollTo(0, messages[0].scrollHeight)
}

function createUserList(username, nickname, status, id, socketId) {

    let userElement = document.createElement('p');
    userElement.classList.add(username);

    if (id === socketId) {
        userElement.innerHTML = username + ' @' + nickname + ' (you)';
    } else {
        userElement.innerHTML = username + ' @' + nickname;
    }
    let userStatus = document.createElement('span');
    userStatus.classList.add('userStatus');
    if (status === 'offline') { userStatus.classList.add('offline') };
    userStatus.innerHTML = status;

    userElement.appendChild(userStatus);

    return userElement;
}

function insertUserList(users, socketId) {
    usersListWrap[0].innerHTML = '';

    users.forEach(el => {
        usersListWrap[0].appendChild(createUserList(el.username, el.nickname, el.status, el.id, socketId));
    })
}

function botMessage(users, username, connect) {

    let textUsers;

    let usersOnline = users.reduce(function(online, el){
        if (el.status === 'online' || el.status === 'just appeared') {
            return online + 1;
        } else {
            return online
        }
    }, 0)

    if (usersOnline === 1) {
        textUsers = 'there is one user now'
    } else {
        textUsers = 'there are ' + usersOnline + ' users now'
    }

    let botText = "<strong>" + username + "</strong>" + ' ' + connect + "<br>" + textUsers;

    insertPost(botText, 'bot', Date(), 0)
}

function createTime(t) {
    let time = document.createElement('p')
    time.classList.add('time')

    let date = new Date(t);
    let innerTimeH;
    let innerTimeM;
    let innerTimeS;
    if (date.getHours() < 10) {
        innerTimeH = '0' + date.getHours();
    } else {
        innerTimeH = date.getHours()
    }
    if (date.getMinutes() < 10) {
        innerTimeM = '0' + date.getMinutes();
    } else {
        innerTimeM = date.getMinutes()
    }
    if (date.getSeconds() < 10) {
        innerTimeS = '0' + date.getSeconds();
    } else {
        innerTimeS = date.getSeconds()
    }

    time.innerHTML = innerTimeH + ':'+ innerTimeM + ':' + innerTimeS;
    return time;
}
