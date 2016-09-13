/**
 * Created by Paul on 9/7/2016.
 */

let each = function (obj, cb) {
  if (!obj || !cb) {
    return
  }
  for (var i in obj) {
    if (obj.hasOwnProperty(i)) {
      cb(obj[i], i);
    }
  }
};

export default function (reServer) {

  let jsonp = function (opt, cb) {
    if (typeof window === "undefined") {
      return cb("JSONP is currently browser only.");
    }
    //Gun.log("jsonp send", opt);
    jsonp.ify(opt, function (url) {
      //Gun.log(url);
      if (!url) {
        return;
      }
      jsonp.send(url, function (reply) {
        //Gun.log("jsonp reply", reply);
        cb(null, reply);
        jsonp.poll(opt, reply);
      }, opt.jsonp);
    });
  };
  jsonp.send = function (url, cb, id) {
    var js = document.createElement('script');
    js.src = url;
    window[js.id = id] = function (res) {
      cb(res);
      cb.id = js.id;
      js.parentNode.removeChild(js);
      window[cb.id] = null; // TODO: BUG: This needs to handle chunking!
      try {
        delete window[cb.id];
      } catch (e) {
      }
    };
    js.async = true;
    document.getElementsByTagName('head')[0].appendChild(js);
    return js;
  };
  jsonp.poll = function (opt, res) {
    if (!opt || !opt.base || !res || !res.headers || !res.headers.poll) {
      return;
    }
    (jsonp.poll.s = jsonp.poll.s || {})[opt.base] = jsonp.poll.s[opt.base] || setTimeout(function () { // TODO: Need to optimize for Chrome's 6 req limit?
        //Gun.log("polling again");
        var o = {base: opt.base, headers: {pull: 1}};
        each(opt.headers, function (v, i) {
          o.headers[i] = v;
        });
        jsonp(o, function (err, reply) {
          delete jsonp.poll.s[opt.base];
          while (reply.body && reply.body.length && reply.body.shift) { // we're assuming an array rather than chunk encoding. :(
            var res = reply.body.shift();
            //Gun.log("-- go go go", res);
            if (res && res.body) {
              reServer(res, opt.base);
            } // emit extra events.
          }
        });
      }, res.headers.poll);
  };
  jsonp.ify = function (opt, cb) {
    var uri = encodeURIComponent, q = '?';
    if (opt.url && opt.url.pathname) {
      q = opt.url.pathname + q;
    }
    q = opt.base + q;
    each((opt.url || {}).query, function (v, i) {
      q += uri(i) + '=' + uri(v) + '&'
    });
    if (opt.headers) {
      q += uri('`') + '=' + uri(JSON.stringify(opt.headers)) + '&'
    }
    if (jsonp.max < q.length) {
      return cb()
    }
    q += uri('jsonp') + '=' + uri(opt.jsonp = 'P' + Math.floor((Math.random() * 65535) + 1));
    if (opt.body) {
      q += '&';
      var w = opt.body, wls = function (w, l, s) {
        return uri('%') + '=' + uri(w + '-' + (l || w) + '/' + (s || w)) + '&' + uri('$') + '=';
      };
      if (typeof w != 'string') {
        w = JSON.stringify(w);
        q += uri('^') + '=' + uri('json') + '&';
      }
      w = uri(w);
      var i = 0, l = w.length
        , s = jsonp.max - (q.length + wls(l.toString()).length);
      if (s < 0) {
        return cb()
      }
      while (w) {
        cb(q + wls(i, (i = i + s), l) + w.slice(0, i));
        w = w.slice(i);
      }
    } else {
      cb(q);
    }
  };
  jsonp.max = 2000;

  return jsonp;
}
