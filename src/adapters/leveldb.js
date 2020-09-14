
    var Gun = require('../index');

    Gun.on('create', function(root) {
      var ev  = this.to;
      var opt = root.opt;

      if (root.once) {
        return ev.next(root);
      }

      // Check if the given 'level' argument implements all the components we need
      // Intentionally doesn't check for levelup explicitly, to allow different handlers implementing the same api
      if (
        (!opt.level) ||
        ('object' !== typeof opt.level) ||
        ('function' !== typeof opt.level.get) ||
        ('function' !== typeof opt.level.put) ||
        ('function' !== typeof opt.level.createReadStream)
      ) {
        return ev.next(root);
      }

      // How to write
      root.on('put', function(msg){
        this.to.next(msg);

        var put   = msg.put;
        var soul  = put['#'];
        var key   = put['.'];
        var val   = put[':'];
        var state = put['>'];

        // only ack non-acks.
        if (!msg['@']) {
          (acks[msg['#']] = (tmp = (msg._||'').lot || {})).lS = (tmp.lS||0)+1;
        }

        // Fetch current state
        opt.level.get(soul, function(err, data) {
          if (data) data = JSON.parse(data);

          // Serialize & store
          var toStore = JSON.stringify(Gun.state.ify(data, key, state, val, soul));
          opt.level.put(soul, toStore, function(err, data) {
            if (err) return;
            // TODO: ack here?
          });
        });

      });

      // How to read
      root.on('get', function(msg){
        this.to.next(msg);
        var get  = msg.get;
        var soul = get['#'];
        opt.level.get(soul, function(err, data) {
          if (err) return;
          if (data) data = JSON.parse(data);
          root.on('in', {'@': soul, put: Gun.graph.node(data), lS: 1});
        });

      });

    });

  