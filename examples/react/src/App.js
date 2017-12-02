import React, { Component } from 'react'
import Gun from 'gun/gun'
import Todos from './Todos'
import Chat from './Chat'
import Json from './Json'

class App extends Component {
  constructor() {
    super();
    this.gun = Gun(location.origin + '/gun')
  }
  
  render() {
    return (
      <div>
        <h1>React Examples</h1>
        <h2>Todo</h2>
        <Todos gun={this.gun} />
        <br />
        <hr />
        <h2>Chat</h2>
        <Chat gun={this.gun} />
        <br />
        <hr />
        <h2>Json</h2>
        <Json gun={this.gun} />
      </div>
    );
  }
}

export default App;
