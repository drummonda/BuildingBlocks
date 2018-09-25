import {Link} from 'react-router-dom'
import React, { Component, Fragment } from 'react'
import { Input, Menu } from 'semantic-ui-react'

export default class Navbar extends Component {

  render() {

    return (
      <div>

        <Menu inverted>

          <Menu.Item id="logo">
            <img src='cube.png' />
            Building Blocks
          </Menu.Item>

          <Menu.Menu position='right'>
            <Menu.Item>
              <Input icon='search' placeholder='This does nothing!' />
            </Menu.Item>
          </Menu.Menu>

        </Menu>

      </div>
    )
  }
}
