import Gun from '../..';

Gun().opt({
  uuid: function () {
    return Math.floor(Math.random() * 4294967296).toString();
  },
});
