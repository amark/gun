var gun = Gun([location.origin + '/gun', 'https://gun-us.herokuapp.com/gun']);
var chat = gun.get('converse/' + location.hash.slice(1));
var chats = {};
var activeChat;

var getKey = new Promise(resolve => {
  var pair = localStorage.getItem('chatKeyPair');
  if (pair) {
    resolve(JSON.parse(pair));
  } else {
    Gun.SEA.pair(pair => {
      localStorage.setItem('chatKeyPair', JSON.stringify(pair));
      resolve(pair);
    });
  }
});
var key, myIdenticon;
getKey.then(k => {
  key = k;
  irisLib.Chat.initUser(gun, key);
  myIdenticon = $(new irisLib.Attribute({type:'keyID', value: key.pub}).identicon({width:40, showType: false}));
  $(".user-info").append(myIdenticon);
  myIdenticon.click(showSettings);
  irisLib.Chat.getChats(gun, key, addChat);
  irisLib.Chat.setOnline(gun, true);
  var chatWith = getUrlParameter('chatWith');
  if (chatWith) {
    addChat(chatWith);
    showChat(chatWith);
    window.history.pushState({}, "Iris Chat", "/"+window.location.href.substring(window.location.href.lastIndexOf('/') + 1).split("?")[0]); // remove param
  }
  gun.user().get('profile').get('name').on(name => {
    if (name && typeof name === 'string') {
      var el = $('#settings-name');
      if (!el.is(':focus')) {
        $('#settings-name').val(name);
      }
    }
  });
});

$('#paste-chat-link').on('keyup paste', event => {
  var val = $(event.target).val();
  if (val.length < 30 || val.indexOf('chatWith') === -1) {
    return;
  }
  var s = val.split('?');
  if (s.length !== 2) { return; }
  $(event.target).val('');
  var pub = getUrlParameter('chatWith', s[1]);
  addChat(pub);
  showChat(pub);
});

$('.chat-item.new').click(showNewChat);

$('#settings-name').on('keyup paste', event => {
  var name = $(event.target).val().trim();
  gun.user().get('profile').get('name').put(name);
});

function hideStuff() {
  $('.chat-item').toggleClass('active', false);
  $('.main-view').hide();
  $('#not-seen-by-them').hide();
  $(".message-form").hide();
  $("#topbar").empty();
}

function showSettings() {
  hideStuff();
  $('#topbar').text('Settings');
  $('#settings').show();
}

function showNewChat() {
  hideStuff();
  $('.chat-item.new').toggleClass('active', true);
  $('#new-chat').show();
  $("#topbar").text('Start new chat');
}

showNewChat();

$('.copy-chat-link').click(event => {
  copyToClipboard('https://chat.iris.to/?chatWith=' + key.pub);
  var t = $(event.target);
  var originalText = t.text();
  var originalWidth = t.width();
  t.width(originalWidth);
  t.text('Copied');
  setTimeout(() => {
    t.text(originalText);
    t.css('width', '');
  }, 2000);
});

$('#copy-private-key').click(event => {
  copyToClipboard(JSON.stringify(key));
  var t = $(event.target);
  var originalText = t.text();
  var originalWidth = t.width();
  t.width(originalWidth);
  t.text('Copied');
  setTimeout(() => {
    t.text(originalText);
    t.css('width', '');
  }, 2000);
});

$('#download-private-key').click(downloadKey);

function showChat(pub) {
  if (!pub || !Object.prototype.hasOwnProperty.call(chats, pub)) {
    return;
  }
  activeChat = pub;
  hideStuff();
  $('.chat-item[data-pub="' + pub +'"]').toggleClass('active', true);
  $("#message-list").empty();
  $("#message-list").show();
  $(".message-form").show();
  $(".message-form form").off('submit');
  $(".message-form form").on('submit', event => {
    event.preventDefault();
    var text = $('#new-msg').val();
    if (!text.length) { return; }
    chats[pub].send(text);
    $('#new-msg').val('');
  });
  var nameEl = $('<span class="name"></span>');
  if (chats[pub].name) {
    nameEl.text(chats[pub].name);
    nameEl.show();
  }
  $("#topbar").append(chats[pub].identicon.clone());
  $("#topbar").append(nameEl);
  $("#topbar").append($('<small class="last-seen"></small>'));
  var msgs = Object.values(chats[pub].messages);
  msgs.forEach(addMessage);
  sortMessagesByTime();
  lastSeenTimeChanged(pub);
  $('#message-list').scrollTop($('#message-list')[0].scrollHeight - $('#message-list')[0].clientHeight);
  chats[pub].setMyMsgsLastSeenTime();
  function setOnlineStatus() {
    var online = chats[pub].online;
    if (activeChat === pub) {
      if (online.isOnline) {
        $('#topbar .last-seen').text('online');
      } else if (online.lastActive) {
        $('#topbar .last-seen').text('last seen ' + formatDate(new Date(online.lastActive * 1000)));
      }
    }
  }
  if (!chats[pub].online) {
    chats[pub].online = {};
    irisLib.Chat.getOnline(gun, pub, (online) => {
      chats[pub].online = online;
      setOnlineStatus();
    });
  }
  setOnlineStatus();
}

function sortChatsByLatest() {
  var sorted = $(".chat-item").sort((a, b) => $(b).data('latestTime') - $(a).data('latestTime'));
  $(".chat-list").append(sorted);
}

function sortMessagesByTime() {
  var sorted = $(".msg").sort((a, b) => $(a).data('time') - $(b).data('time'));
  $("#message-list").append(sorted);
}

function addMessage(msg) {
  var msgEl = $(
    '<div class="msg"><div class="text">' +
    msg.text + '</div>' +
    '<div class="time"><span class="seen">✔</span> ' + formatDate(msg.time) + '</div></div>'
  );
  msgEl.toggleClass('our', msg.selfAuthored ? true : false);
  msgEl.toggleClass('their', msg.selfAuthored ? false : true);
  msgEl.data('time', msg.time);
  $("#message-list").append(msgEl); // TODO: jquery insertAfter element with smaller timestamp
  $('#message-list').scrollTop($('#message-list')[0].scrollHeight - $('#message-list')[0].clientHeight);
}

function addChat(pub) {
  if (!pub || Object.prototype.hasOwnProperty.call(chats, pub)) {
    return;
  }
  var el = $('<div class="chat-item"><span class="name"></span> <small class="latest"></small></div>');
  el.attr('data-pub', pub);
  chats[pub] = new irisLib.Chat({gun, key, participants: pub, onMessage: (msg, info) => {
    msg.selfAuthored = info.selfAuthored;
    chats[pub].messages[msg.time] = msg;
    msg.time = new Date(msg.time);
    if (!info.selfAuthored && msg.time > chats[pub].theirLastSeenTime) {
      chats[pub].theirLastSeenTime = msg.time;
      lastSeenTimeChanged(pub);
    }
    if (!chats[pub].latest || msg.time > chats[pub].latest.time) {
      chats[pub].latest = msg;
      var text = msg.text.length > 30 ? msg.text.slice(0,30) + '...' : msg.text;
      el.find('.latest').text(text);
      el.data('latestTime', msg.time);
      sortChatsByLatest();
    }
    if (activeChat === pub) {
      addMessage(msg);
      sortMessagesByTime(); // this is slow if message history is loaded while chat active
      if (chats[pub].latest.time === msg.time) {
        chats[pub].setMyMsgsLastSeenTime();
      }
    }
  }});
  chats[pub].messages = chats[pub].messages || [];
  chats[pub].identicon = $(new irisLib.Attribute({type: 'keyID', value: pub}).identicon({width:40, showType: false}));
  gun.user(pub).get('profile').get('name').on(name => {
    if (name && typeof name === 'string') {
      chats[pub].name = name;
      el.find('.name').text(name);
      if (pub === activeChat) {
        $('#topbar .name').text(name);
      }
    }
  });
  el.prepend(chats[pub].identicon);
  el.click(() => showChat(pub));
  $(".chat-list").append(el);
  chats[pub].getTheirMsgsLastSeenTime(time => {
    chats[pub].theirLastSeenTime = new Date(time);
    lastSeenTimeChanged(pub);
  });
}

function lastSeenTimeChanged(pub) {
  if (pub === activeChat) {
    if (chats[pub].theirLastSeenTime) {
      $('#not-seen-by-them').hide();
      $('.msg.our').each(function() {
        var el = $(this);
        if (el.data('time') <= chats[pub].theirLastSeenTime) {
          el.find('.seen').show();
        }
      });
      // set seen msgs
    } else {
      $('#not-seen-by-them').show();
    }
  }
}

/* Helpers */

function formatDate(date) {
  var s = date.toISOString().split('T');
  return s[0] + ' ' + s[1].slice(0,5);
}

function copyToClipboard(text) {
    if (window.clipboardData && window.clipboardData.setData) {
        // Internet Explorer-specific code path to prevent textarea being shown while dialog is visible.
        return clipboardData.setData("Text", text);
    }
    else if (document.queryCommandSupported && document.queryCommandSupported("copy")) {
        var textarea = document.createElement("textarea");
        textarea.textContent = text;
        textarea.style.position = "fixed";  // Prevent scrolling to bottom of page in Microsoft Edge.
        document.body.appendChild(textarea);
        textarea.select();
        try {
            return document.execCommand("copy");  // Security exception may be thrown by some browsers.
        }
        catch (ex) {
            console.warn("Copy to clipboard failed.", ex);
            return false;
        }
        finally {
            document.body.removeChild(textarea);
        }
    }
}

function getUrlParameter(sParam, sParams) {
    var sPageURL = sParams || window.location.search.substring(1),
        sURLVariables = sPageURL.split('&'),
        sParameterName,
        i;

    for (i = 0; i < sURLVariables.length; i++) {
        sParameterName = sURLVariables[i].split('=');
        if (sParameterName[0] === sParam) {
            return sParameterName[1] === undefined ? true : decodeURIComponent(sParameterName[1]);
        }
    }
};

function download(filename, data, type, charset, href) {
  var hiddenElement;
  if (charset == null) {
    charset = 'utf-8';
  }
  hiddenElement = document.createElement('a');
  hiddenElement.href = href || ("data:" + type + ";charset=" + charset + "," + (encodeURI(data)));
  hiddenElement.target = '_blank';
  hiddenElement.download = filename;
  return hiddenElement.click();
};

function downloadKey() {
  return download('iris_private_key.txt', JSON.stringify(key), 'text/csv', 'utf-8');
};
