/**
 * Created by Paul on 9/8/2016.
 */

let Obj = {
  is: function (o) {
    return !o || !o.constructor ? false : o.constructor === Object ? true : !o.constructor.call || o.constructor.toString().match(/\[native\ code\]/) ? false : true
  }
};
Obj.put = function (o, f, v) {
  return (o || {})[f] = v, o;
};

Obj.del = function (o, k) {
  if (!o) {
    return;
  }
  o[k] = null;
  delete o[k];
  return true;
};

Obj.ify = function (o) {
  if (Obj.is(o)) {
    return o;
  }
  try {
    o = JSON.parse(o);
  } catch (e) {
    o = {};
  }

  return o;
};

Obj.copy = function (o) { // because http://web.archive.org/web/20140328224025/http://jsperf.com/cloning-an-object/2
  return !o ? o : JSON.parse(JSON.stringify(o)); // is shockingly faster than anything else, and our data has to be a subset of JSON anyways!
};

Obj.as = function (b, f, d) {
  return b[f] = b[f] || (arguments.length >= 3 ? d : {});
};

Obj.has = function (o, t) {
  return o && Object.prototype.hasOwnProperty.call(o, t);
};
Obj.empty = function (o, n) {
  if (!o) {
    return true;
  }
  return Obj.map(o, function (v, i) {
    if (n && (i === n || (Obj.is(n) && Obj.has(n, i)))) {
      return;
    }
    if (i) {
      return true;
    }
  }) ? false : true;
};

export default Obj;
