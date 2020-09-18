const gun = new Gun();

const size = 20;
const gunNode = gun.get('posts');

function debounce(func, wait, immediate) {
  var timeout;
  return function() {
    var context = this, args = arguments;
    var later = function() {
      timeout = null;
      if (!immediate) func.apply(context, args);
    };
    var callNow = immediate && !timeout;
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
    if (callNow) func.apply(context, args);
  };
};

let topSentinelPreviousY = 0;
let topSentinelPreviousRatio = 0;
let bottomSentinelPreviousY = 0;
let bottomSentinelPreviousRatio = 0;
let previousUpIndex = previousDownIndex = -1;

const render = elements => {
  const t = new Date();
  elements.reverse().forEach((data, j) => {
    var date = new Date(data.date);
    $('#date' + j).text(date.toLocaleDateString() + ' ' + date.toLocaleTimeString());
    $('#text' + j).text(data.text);
    $('#img' + j).attr('src', '');
    $('#img' + j).attr('src', _getCatImg(date.getTime()));
    $('#post' + j).css({visibility: 'visible'});
  });
  console.log('rendering took', new Date().getTime() - t.getTime(), 'ms');
  window.onRender && window.onRender(elements);
};

const onChange = debounce(render, 20);

const scroller = new ScrollWindow(gunNode, {size, stickTo: 'top', onChange});

const initList = () => {
  for (var n = 0; n < size; n++) {
    var el = $("<div>").addClass('post').attr('id', 'post' + n).css({visibility: 'hidden'});
    el.append($('<b>').attr('id', 'date' + n));
    el.append($('<span>').attr('id', 'text' + n));
    el.append($('<img>').attr('id', 'img' + n).attr('height', 100).attr('width', 100));
    $('#container').append(el);
  }
}

const _getCatImg = (n) => {
  const url = "https://source.unsplash.com/collection/139386/100x100/?sig=";
  return url + n % 999999;
};

const getNumFromStyle = numStr => Number(numStr.substring(0, numStr.length - 2));

const adjustPaddings = isScrollDown => {
  const container = document.getElementById("container");
  const currentPaddingTop = getNumFromStyle(container.style.paddingTop);
  const currentPaddingBottom = getNumFromStyle(container.style.paddingBottom);
  const remPaddingsVal = 198 * (size / 2); // TODO: calculate actual element heights
  if (isScrollDown) {
    container.style.paddingTop = currentPaddingTop + remPaddingsVal + "px";
    container.style.paddingBottom = currentPaddingBottom === 0 ? "0px" : currentPaddingBottom - remPaddingsVal + "px";
  } else {
    container.style.paddingBottom = currentPaddingBottom + remPaddingsVal + "px";
    if (currentPaddingTop === 0) {
      $(window).scrollTop($('#post0').offset().top + remPaddingsVal);
    } else {
      container.style.paddingTop = currentPaddingTop - remPaddingsVal + "px";
    }
  }
}

const topSentCallback = entry => {
  const container = document.getElementById("container");

  const currentY = entry.boundingClientRect.top;
  const currentRatio = entry.intersectionRatio;
  const isIntersecting = entry.isIntersecting;

  // conditional check for Scrolling up
  if (
    currentY > topSentinelPreviousY &&
    isIntersecting &&
    currentRatio >= topSentinelPreviousRatio &&
    scroller.center !== previousUpIndex && // stop if no new results were received
    scroller.opts.stickTo !== 'top'
  ) {
    previousUpIndex = scroller.center;
    adjustPaddings(false);
    scroller.up(size / 2);
  }
  topSentinelPreviousY = currentY;
  topSentinelPreviousRatio = currentRatio;
}

const botSentCallback = entry => {
  const currentY = entry.boundingClientRect.top;
  const currentRatio = entry.intersectionRatio;
  const isIntersecting = entry.isIntersecting;

  // conditional check for Scrolling down
  if (
    currentY < bottomSentinelPreviousY &&
    currentRatio > bottomSentinelPreviousRatio &&
    isIntersecting &&
    scroller.center !== previousDownIndex &&  // stop if no new results were received
    scroller.opts.stickTo !== 'bottom'
  ) {
    previousDownIndex = scroller.center;
    adjustPaddings(true);
    scroller.down(size / 2);
  }
  bottomSentinelPreviousY = currentY;
  bottomSentinelPreviousRatio = currentRatio;
}

const initIntersectionObserver = () => {
  const options = {
    //rootMargin: '190px',
  }

  const callback = entries => {
    entries.forEach(entry => {
      if (entry.target.id === 'post0') {
        topSentCallback(entry);
      } else if (entry.target.id === `post${size - 1}`) {
        botSentCallback(entry);
      }
    });
  }

  var observer = new IntersectionObserver(callback, options); // TODO: It's possible to quickly scroll past the sentinels without them firing. Top and bottom sentinels should extend to page top & bottom?
  observer.observe(document.querySelector("#post0"));
  observer.observe(document.querySelector(`#post${size - 1}`));
}

initList(size);
initIntersectionObserver();

$('#top').click(() => {
  scroller.top();
  $('#container').css({'padding-top': 0, 'padding-bottom': 0});
  $(document.body).animate({ scrollTop: 0 }, 500);
});
$('#bottom').click(() => {
  scroller.bottom();
  $('#container').css({'padding-top': 0, 'padding-bottom': 0});
  $(document.body).animate({ scrollTop: $("#container").height() }, 500);
});

$('#generate').submit(e => {
  e.preventDefault();
  const day = 24 * 60 * 60 * 1000;
  const year = 365 * day;
  const n = Number($('#number').val());
  for (let i = 0; i < n; i++) {
    const d = new Date(40 * year + i * day).toISOString();
    gunNode.get(d).put({text: 'Hello world!', date: d});
  }
});
