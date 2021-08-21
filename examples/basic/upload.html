<!DOCTYPE html>

<div class="model" style="display: none;">
  <video width="100%" controls autoplay></video>
  <audio width="100%" controls autoplay></audio>
  <img style="max-width: 100%;">
</div>
<center>
  <p>Drag & drop videos, songs, or images! <input id="upload" type="file" multiple></p>
</center>

<script src="../../../gun/lib/yson.js"></script>
<script src="../../../gun/gun.js"></script>
<script src="../../../gun/lib/dom.js"></script>
<script src="../../../gun/lib/upload.js"></script>

<script>
gun = GUN(location.origin + '/gun');

$('html, #upload').upload(function resize(eve, up){
  if(up){ return up.shrink(eve, resize, 1024) }
  var b64 = (eve.base64 || ((eve.event || eve).target || eve).result || eve); // which one? try all!
  gun.get('test').get((eve.id+(new Date).getUTCSeconds()) % 60).put(b64); // limit uploads to 1 of 60 slots.
});

gun.get('test').map().once(function(data){
  if("string" != typeof data){ return }
  var type = data.split(';')[0], ui;
  if(type.indexOf('image') + 1){ ui = $("img").get(0) }
  if(type.indexOf('video') + 1){ ui = $('video').get(0) }
  if(type.indexOf('audio') + 1){ ui = $('audio').get(0) }
  if(!ui){ return }
  $(ui).clone().prependTo('center').get(0).src = data;
});
</script>