function input(msg){
	var ev = this, cat = this.as, gun = msg.gun, at = gun._, change = msg.put, rel, tmp;
	// dispatch to chain listeners.
	// dispatch to children.
	// dispatch to echoes.
	if(u === change){
		// Here are the possible options:
		// 1. We think the data does not exist because peers/disk cannot find it.
		// 2. We know the data does not exist because a parent is or was changed to a primitive.
		// Souls can only (1) because they have no parent.
		// Has can be (1) or (2).
		// Gets and chains can be (1) or (2).
		if(cat.soul || cat.has){
			// a soul can never become undefined.
			// a soul can only not be found.
			if(cat.soul && u !== cat.put){
				return;
			}
			// a key may sometimes might not be found.
			// a key on a soul can not become undefined,
			// but the chain might be on a chain that
			// does not exist, and therefore can be undefined.
			ev.to.next(msg); // ex, notify val and stuff.
			echo(cat, msg, ev); // ex, notify a sub-object pointer like `mark.pet`! // TODO: BUG ON VAL, it will still not get called because it checks !node when it should also check ack.
			if(cat.soul){ return }
			obj_map(cat.next, unknown); // notify children.
		}
		if(cat.has){
			if()
		}
		return;
	}
	if(cat.soul){
		return;
	}
	if(cat.has){
		return;
	}
	if(cat.get){
		return;
	}
	ev.to.next(msg);
}

function unknown(ref, key){
	(ref = (ref._)).put = u;
	ref.on('in', {get: key, put: u, gun: ref.gun});
}

gun.get('users').map().map().get('who').get('say').map().on(cb);