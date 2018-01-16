const stream = require('stream')
const Gun = require('gun')

const randomString = length => {
  const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
  let text = ''
  for (var i = 0; i < length; i++) {
    text += possible[Math.floor(Math.random() * possible.length)]
  }
  return text
}

// Generator
// generates stream of json {id: "", name: "", description: ""}
class Generator extends stream.Readable {
  constructor(n) {
    super()

    this._n = n
    this._i = 0
  }

  _read(size) {
    if (this._i < this._n) {
      this.push(
        JSON.stringify({
          id: `${this._i}`,
          name: randomString(20),
          description: randomString(200)
        })
      )
      this.push('\n')
      this._i++
    } else {
      this.push(null)
    }
  }
}

// Line
// read line by line as stream comes through it
class Line extends stream.Transform {
  constructor() {
    super()
    this.buff = ''
  }

  trySendLine() {
    let index = this.buff.indexOf(`\n`)

    while (index !== -1) {
      const line = this.buff.slice(0, index)
      this.buff = this.buff.slice(index + 1)

      this.push(line)

      index = this.buff.indexOf(`\n`)
    }
  }

  _transform(chunk, enc, cb) {
    this.buff += chunk.toString()

    this.trySendLine()

    cb()
  }

  end() {
    this.trySendLine()

    if (this.buff.length > 0) {
      this.push(this.buff)
    }
  }
}

// Graph
// parse the chunk and tries to add it to table
class Graph extends stream.Transform {
  constructor() {
    super()

    this.db = new Gun({
      //file: 'graph.json'
      localStorage: false
    })
    this.items = this.db.get('items')
  }

  _transform(chunk, enc, cb) {
    const json = JSON.parse(chunk.toString())
    const item = this.db.get(json.id)

    item.put(
      {
        id: json.id,
        name: json.name,
        description: json.description
      },
      () => {
        this.items.set(item, () => {
          this.push(chunk)
          cb()
        })
      }
    )
  }
}

// Report
// shows how many item has pass through the system
class Report extends stream.Transform {
  constructor() {
    super()
    this._count = 0
  }

  _transform(chunk, enc, cb) {
    this.push(`count: ${this._count++}\r`)
    cb()
  }
}

const generator = new Generator(5000)
const line = new Line()
const graph = new Graph()
const report = new Report()

generator
  .pipe(line)
  .pipe(graph)
  .pipe(report)
  .pipe(process.stdout)