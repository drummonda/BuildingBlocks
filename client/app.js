import React from 'react'

import { Navbar, Status } from './components'
import Routes from './routes'

export default class App {
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
