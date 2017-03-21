import React, { Component } from 'react';
import Todos from './Todos'
import Chat from './Chat'
import Json from './Json'

class App extends Component {
  render() {
    return (
      <div>
        <h1>React Examples</h1>
        <h2>Todo</h2>
        <Todos />
        <br />
        <hr />
        <h2>Chat</h2>
        <Chat />
        <br />
        <hr />
        <h2>Json</h2>
        <Json />
      </div>
    );
  }
}

export default App;
