import Gun = require('../../index');
Gun().opt({
    uuid: function () {
      return Math.floor(Math.random() * 4294967296);
    }
  })