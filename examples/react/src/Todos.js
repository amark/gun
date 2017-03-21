import './style.css'
import React, { Component }  from 'react'
import Gun from 'gun'

const gun = Gun(location.origin + '/gun').get('todos')
const formatTodos = todos => Object.keys(todos)
  .map(key => ({ key, val: todos[key] }))
  .filter(t => Boolean(t.val) && t.key !== '_')

export default class Todos extends Component {
  constructor() {
    super()
    this.state = {newTodo: '', todos: []}
  }
  componentWillMount() {
    gun.on(todos => this.setState({
      todos: formatTodos(todos)
    }))
  }
  add = e => {
    e.preventDefault()
    gun.path(Gun.text.random()).put(this.state.newTodo)
    this.setState({newTodo: ''})
  }
  del = key => gun.path(key).put(null)
  handleChange = e => this.setState({ newTodo: e.target.value})
  render() {
    return <div>
      <form onSubmit={this.add}>
      <input value={this.state.newTodo} onChange={this.handleChange} />
      <button onClick={this.add}>Add</button>
      </form>
      <br />
      <ul>
        {this.state.todos.map(todo => <li key={todo.key} onClick={_=>this.del(todo.key)}>{todo.val}</li>)}
      </ul>
    </div>
  }
}

