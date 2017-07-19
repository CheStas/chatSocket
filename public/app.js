const text = document.getElementsByClassName('text');
const messages = document.getElementsByClassName('messages');
const userName = document.getElementsByClassName('user-name');
const userNikname = document.getElementsByClassName('user-nick');
const usersListWrap = document.getElementsByClassName('usersList');
const enterButton = document.getElementsByClassName('enter-button');
const sendButton = document.getElementsByClassName('send-message');

let user = {
    name: 'name',
    nick: 'nick'
}

enterButton[0].addEventListener('click', () =>{
    signIn();
});


sendButton[0].addEventListener('click', ()=> {
    sendMessage();
})

text[0].addEventListener('keypress', function(e) {
    if (e.keyCode === 13) {
        sendMessage();
    }
})

function signIn() {
    if (userName[0].value.length > 0 && userNikname[0].value.length > 0 ){
        user.name = userName[0].value;
        user.nick = userNikname[0].value;

        const xmlHttp = new XMLHttpRequest();
        xmlHttp.open('GET', '/checkUsers/' + user.name + '/' + user.nick, true);
        xmlHttp.setRequestHeader('Content-Type', 'application/json');
        xmlHttp.send();

        if (xmlHttp.responseText === false) {
            document.getElementsByClassName('not-valid')[0].innerHTML = 'name is busy';
        } else {
            postUser();
        }

    } else {
        if (userName[0].value.length === 0) {
            document.getElementsByClassName('not-valid')[0].innerHTML = 'name is important';
        }
        if (userNikname[0].value.length === 0) {
            document.getElementsByClassName('not-valid')[0].innerHTML = 'nick name is important';
        }
    }
}

function postUser() {
    ajaxRequest({
        method: 'POST',
        url: '/users',
        data: user
    })

    document.getElementsByClassName('enter')[0].classList.add('none');
    userName[0].value = '';
    userNikname[0].value = '';

    setInterval(()=>{
        getData();
    }, 1000)
}

function getData() {
    ajaxRequest({
        method: 'GET',
        url: '/messages',
        callback: function(data) {
            data = JSON.parse(data);
            insertPost(data)
        }
    });
    ajaxRequest({
        method: 'GET',
        url: '/users',
        callback: function(data) {
            data = JSON.parse(data);
            insertUserList(data)
        }
    });

}

function sendMessage() {
    if (text[0].value.length > 0) {
        ajaxRequest({
            method: 'POST',
            url: '/messages',
            data: {
                text: text[0].value,
                name: user.name,
                nick: user.nick
            }
        })
        text[0].value= '';
    }
}

function ajaxRequest(options) {
    const url = options.url || '/';
    const method = options.method || 'GET';
    const callback = options.callback || function() {};
    const data = options.data || {};
    const xmlHttp = new XMLHttpRequest();

    xmlHttp.open(method, url);
    xmlHttp.setRequestHeader('Content-Type', 'application/json');
    xmlHttp.send(JSON.stringify(data));

    xmlHttp.onreadystatechange = function () {
        if (xmlHttp.status == 200 && xmlHttp.readyState == 4) {
            callback(xmlHttp.responseText)
        }
    }
}

function createPost(msg, username, nickname, time, forUser) {
    let message = document.createElement('div')
    let text = document.createElement('p')
    message.classList.add('message')
    text.classList.add('message__text')

    text.innerHTML = msg

    if (username === user.name) {
        text.classList.add('my')
    } else {
        let name = document.createElement('p');
        name.classList.add('name');
        name.innerHTML = username;
        message.appendChild(name);
    }

    if (forUser && forUser === user.nick) {
        text.classList.add('forMe')
    }

    message.appendChild(createTime(time));
    message.appendChild(text);
    return message;
}

function insertPost(data) {
    messages[0].innerHTML = '';
    data.forEach(el=>{
        messages[0].appendChild(createPost(el.text, el.name, el.nick, el.time, el.forUser));
    })

    if (messages[0].childElementCount > 100) {
        messages[0].removeChild(messages[0].firstElementChild)
    }
}

function createUserList(username, nickname) {

    let userElement = document.createElement('p');
    userElement.classList.add(username);

    if (username === user.name) {
        userElement.innerHTML = username + ' @' + nickname + ' (you)';
    } else {
        userElement.innerHTML = username + ' @' + nickname;
    }

    return userElement;
}

function insertUserList(users) {
    usersListWrap[0].innerHTML = '';

    users.forEach(el => {
        usersListWrap[0].appendChild(createUserList(el.name, el.nick));
    })
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
