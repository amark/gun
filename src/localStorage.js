/**
 * Created by Paul on 9/15/2016.
 */

export default (typeof localStorage === 'undefined') ? {
  setItem: function (key, val, cb) { cb(null); },
  removeItem: function (key, cb) { cb(null); },
  getItem: function (key, cb) { cb(null); }
} : {
  setItem: function (key, val, cb) { cb(localStorage.setItem(key, val)); },
  removeItem: function (key, cb) { cb(localStorage.removeItem(key)); },
  getItem: function (key, cb) { cb(localStorage.getItem(key)); }
};
