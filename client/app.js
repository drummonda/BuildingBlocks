import React, { Component } from 'react'

import { Navbar, Status } from './components'
import Routes from './routes'

export default class App extends Component {
  render() {
    return (
      <div>
        <Navbar />
        <Status />
        <div className='main'>
          <Routes id='routes' />
        </div>
      </div>
    )
  }
}
