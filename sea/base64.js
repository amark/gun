
    if(typeof Buffer === "undefined") {
      root.Buffer = require("buffer").Buffer
    }
    if(typeof btoa === "undefined"){
      root.btoa = function (data) { return Buffer.from(data, "binary").toString("base64"); };
      root.atob = function (data) { return Buffer.from(data, "base64").toString("binary"); };
    }
  