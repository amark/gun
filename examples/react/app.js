import React, { Component }  from 'react'
import { render } from 'react-dom'
import Todos from './todos'
import Chat from './chat'
import Json from './json'

const App = _ =>
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

render(<App />,  document.getElementById('app'))

