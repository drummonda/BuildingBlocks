import React from 'react'

import {Navbar} from './components'
import Routes from './routes'

const App = () => {
  return (
    <div>
      <Navbar />
      <div className='main'>
        <Routes id='routes' />
      </div>
    </div>
  )
}

export default App
