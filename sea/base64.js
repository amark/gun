
    if(typeof global !== "undefined"){
      var g = global;
      g.btoa = function (data) { return Buffer.from(data, "binary").toString("base64"); };
      g.atob = function (data) { return Buffer.from(data, "base64").toString("binary"); };
    }
  