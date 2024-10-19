import '../../../gun/gun.js'
const gun = window.Gun(location.origin + '/gun');

const database = {}
const logs = {}

export function insights() {
  return logs
}

function insight(name, link) {
  if(!logs[`${name}:${link}`]) {
    logs[`${name}:${link}`] = 0
  }
  logs[`${name}:${link}`] += 1
}

const CREATE_EVENT = 'create'

const observableEvents = [CREATE_EVENT]

function update(link, target, compositor, lifeCycle={}) {
  insight('module:update', link)
  if(lifeCycle.beforeUpdate) {
    lifeCycle.beforeUpdate(target)
  }

  const html = compositor(target)
  if(html) target.innerHTML = html

  if(lifeCycle.afterUpdate) {
    lifeCycle.afterUpdate(target)
  }
}

function draw(link, compositor, lifeCycle={}) {
  insight('module:draw', link)
  listen(CREATE_EVENT, link, (event) => {
    gun.get(this.seed).get(link).on(cache => {
      database[link] = JSON.parse(cache) || {}
      update(link, event.target, compositor, lifeCycle)
    })
  })
}

function style(link, stylesheet) {
  insight('module:style', link)
  const styles = `
    <style type="text/css" data-link="${link}">
      ${stylesheet.replaceAll('&', link)}
    </style>
  `;

  document.body.insertAdjacentHTML("beforeend", styles)
}

export function learn(link) {
  insight('module:learn', link)
  return database[link] || {}
}

export function teach(link, knowledge, nuance = (s, p) => ({...s,...p})) {
  insight('module:teach', link)
  gun.get(this.seed).get(link).once(cache => {
    const data = cache ? JSON.parse(cache) : {}
    const latest = nuance(data, knowledge);
    gun.get(this.seed).get(link).put(JSON.stringify(latest))
  })
}

export function when(link1, type, link2, callback) {
  const link = `${link1} ${link2}`
  insight('module:when:'+type, link)
  listen(type, link, callback)
}

export default function module(link, initialState = {}) {
  insight('module', link)
  teach.call(this, link, initialState)

  return {
    link,
    learn: learn.bind(this, link),
    draw: draw.bind(this, link),
    style: style.bind(this, link),
    when: when.bind(this, link),
    teach: teach.bind(this, link),
  }
}

export function subscribe(fun) {
  notifications[fun.toString] = fun
}

export function unsubscribe(fun) {
  if(notifications[fun.toString]) {
    delete notifications[fun.toString]
  }
}

export function listen(type, link, handler = () => null) {
  const callback = (event) => {
    if(
      event.target &&
      event.target.matches &&
      event.target.matches(link)
    ) {

      insight('module:listen:'+type, link)
      handler.call(null, event);
    }
  };

  document.addEventListener(type, callback, true);

  if(observableEvents.includes(type)) {
    observe(link);
  }

  return function unlisten() {
    if(type === CREATE_EVENT) {
      disregard(link);
    }

    document.removeEventListener(type, callback, true);
  }
}

let links = []

function observe(link) {
  links = [...new Set([...links, link])];
  maybeCreateReactive([...document.querySelectorAll(link)])
}

function disregard(link) {
  const index = links.indexOf(link);
  if(index >= 0) {
    links = [
      ...links.slice(0, index),
      ...links.slice(index + 1)
    ];
  }
}

function maybeCreateReactive(targets) {
  targets
    .filter(x => !x.reactive)
    .forEach(dispatchCreate)
}

function getSubscribers({ target }) {
  if(links.length > 0)
    return [...target.querySelectorAll(links.join(', '))];
  else
    return []
}

function dispatchCreate(target) {
  insight('module:create', target.localName)
  if(!target.id) target.id = sufficientlyUniqueId()
  target.dispatchEvent(new Event(CREATE_EVENT))
  target.reactive = true
}

new MutationObserver((mutationsList) => {
  const targets = [...mutationsList]
    .map(getSubscribers)
    .flatMap(x => x)
  maybeCreateReactive(targets)
}).observe(document.body, { childList: true, subtree: true });

function sufficientlyUniqueId() {
  // https://stackoverflow.com/a/2117523
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

tags({ registry: '/examples/gelf/tags' })
new MutationObserver(() => {
  tags({ registry: '/examples/gelf/tags' })
}).observe(document.body, { childList: true, subtree: true });
function tags({ registry }) {
  const tags = new Set(
    [...document.querySelectorAll(':not(:defined)')]
    .map(({ tagName }) => tagName.toLowerCase())
  )

  tags.forEach(async (tag) => {
    const url = `${registry || '.'}/${tag}.js`
    const exists = (await fetch(url, { method: 'HEAD' })).ok
    if(!exists) return
    let definable = true
    await import(url).catch((e) => {
      definable = false
      console.error(e)
    })
    try {
      definable = definable && document.querySelector(tag) && document.querySelector(tag).matches(':not(:defined)')
      if(definable) {
        customElements.define(tag, class WebComponent extends HTMLElement {
          constructor() {
            super();
          }
        });
      }
    } catch(e) {
      console.log('Error defining module:', tag, e)
    }
  })
}
