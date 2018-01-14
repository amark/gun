import React, { Component }  from 'react'
import Gun from 'gun/gun'
import path from 'gun/lib/path'
import './style.css'

const formatTodos = todos => Object.keys(todos)
  .map(key => ({ key, val: todos[key] }))
  .filter(t => Boolean(t.val) && t.key !== '_')

export default class Todos extends Component {
  constructor({gun}) {
    super()
    this.gun = gun.get('todos');
    this.state = {newTodo: '', todos: []}
  }

  componentWillMount() {
    this.gun.on(todos => this.setState({
      todos: formatTodos(todos)
    }))
  }

  add = e => {
    e.preventDefault()
    this.gun.path(Gun.text.random()).put(this.state.newTodo)
    this.setState({newTodo: ''})
  }

  del = key => this.gun.path(key).put(null)

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

