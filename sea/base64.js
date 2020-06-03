
    if(typeof btoa === "undefined"){
      if(typeof Buffer === "undefined") {
        global.Buffer = require("buffer").Buffer
      }
      global.btoa = function (data) { return Buffer.from(data, "binary").toString("base64"); };
      global.atob = function (data) { return Buffer.from(data, "base64").toString("binary"); };
    }
  