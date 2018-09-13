import PropTypes from 'prop-types'
import {connect} from 'react-redux'
import {Link} from 'react-router-dom'
import {logout} from '../store'
import React, { Component, Fragment } from 'react'
import { Input, Menu } from 'semantic-ui-react'

class Navbar extends Component {

  constructor(props) {
    super(props);
    this.handleLogout = this.handleLogout.bind(this);
  }

  handleLogout(e) {
    e.preventDefault();
    this.props.logout();
  }

  render() {
    const { isLoggedIn } = this.props;

    return (
      <div>
        <Menu inverted>
          <Menu.Item id="logo">
            <img src='cube.png' />
            Building Blocks
          </Menu.Item>
          {isLoggedIn ? (
            <Fragment>
              <Menu.Item
                className='menu-item'
                name='home'
                as={Link}
                to='/home'
              />
              <Menu.Item
                className='menu-item'
                name='logout'
                as={Link}
                to='#'
                onClick={this.handleLogout}
              />
            </Fragment>
          ) : (
            <Fragment>
              <Menu.Item
                className='menu-item'
                name='login'
                as={Link}
                to='/login'
              />
              <Menu.Item
                className='menu-item'
                name='signup'
                as={Link}
                to='/signup'
              />
            </Fragment>
          )}
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

/**
 * CONTAINER
 */
const mapState = state => {
  return {
    isLoggedIn: !!state.user.id
  }
}

const mapDispatch = dispatch => {
  return {
    logout() {
      dispatch(logout())
    }
  }
}

export default connect(mapState, mapDispatch)(Navbar)

/**
 * PROP TYPES
 */
Navbar.propTypes = {
  logout: PropTypes.func.isRequired,
  isLoggedIn: PropTypes.bool.isRequired
}
