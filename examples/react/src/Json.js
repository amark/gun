import React, { Component }  from 'react'
import Gun from 'gun'

const gun = Gun(location.origin + '/gun').get('json')
const formatJson = json =>
  Object.keys(json)
    .map(key => ({ key, val: json[key]}))
    .filter(el => el.key !== '_')

export default class Json extends Component {
  constructor() {
    super()
    this.state = { newField: '', json: [] }
  }

  componentWillMount() {
    gun.on(json => this.setState({ json: formatJson(json) }))
  }

  edit = key => e => {
    e.preventDefault()
    gun.path(key).put(e.target.value)
  }
  
  add = e => {
    e.preventDefault()
    gun.path(this.state.newField).put('value')
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

