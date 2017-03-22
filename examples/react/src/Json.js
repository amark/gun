import React, { Component }  from 'react'

const formatJson = json =>
  Object.keys(json)
    .map(key => ({ key, val: json[key]}))
    .filter(el => el.key !== '_')

export default class Json extends Component {
  constructor({gun}) {
    super()
    this.gun = gun.get('json');
    this.state = { newField: '', json: [] }
  }

  componentWillMount() {
    this.gun.on(json => this.setState({ json: formatJson(json) }))
  }

  edit = key => e => {
    e.preventDefault()
    this.gun.path(key).put(e.target.value)
  }
  
  add = e => {
    e.preventDefault()
    this.gun.path(this.state.newField).put('value')
    this.setState({newField: ''})
  }

  render() {
    return <div>
      <ul>
        {this.state.json.map(({ key, val }) =>
          <li key={key}><b>{key}:</b> <input value={val} onChange={this.edit(key)} /></li>
        )}
      </ul>
      <form onSubmit={this.add}>
      <input value={this.state.newField} onChange={e => this.setState({ newField: e.target.value})} />
      <button onClick={this.add}>Add Field</button>
      </form>
    </div>
  }
}

