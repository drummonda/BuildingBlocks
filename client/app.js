import React from 'react'

import { Navbar, Status, VerticalMenu } from './components'
import Routes from './routes'

const App = () => {
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

export default App
