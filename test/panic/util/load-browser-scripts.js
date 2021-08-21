module.exports = {
  /**
   * Loads scripts in PANIC clients
   * @param browsers a Panic.ClientList of browsers
   * @param paths an array of paths to desired .js files
   * @returns Promise which will resolve when all browsers have loaded all dependencies
   */
  loadBrowserScripts: function (browsers, paths) {
    var promises = [];
    browsers.each(function (client, id) {
      promises.push(client.run(function (test) {
        test.async();
        var env = test.props;
        var imports = env.paths || [];
        /** Loads a single script in the browser */
        function load(src, cb) {
          var script = document.createElement('script');
          script.onload = cb; script.src = src;
          document.head.appendChild(script);
        }
        /** Loads scripts in order, waiting on each to load before proceeding */
        function loadAll(src, cb) {
          if (src.length === 0) {
            cb();
            return;
          }
          var cur = src.shift();
          // console.log('loading library:', cur);
          load(cur, function () {
            loadAll(src, cb);
          });
        }

        loadAll(imports, function () {
          test.done();
        });
      }, {paths: paths}));
    });
    return Promise.all(promises);
  }
};