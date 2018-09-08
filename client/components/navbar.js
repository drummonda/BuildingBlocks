import PropTypes from 'prop-types'
import {connect} from 'react-redux'
import {Link} from 'react-router-dom'
import {logout} from '../store'
import React, { Component, Fragment } from 'react'
import { Input, Menu, Segment } from 'semantic-ui-react'

class Navbar extends Component {

  constructor(props) {
    super(props);
    this.state = { activeItem: 'home' }
    this.handleItemClick = this.handleItemClick.bind(this);
    this.handleLogout = this.handleLogout.bind(this);
  }

  componentDidMount() {
    const { isLoggedIn } = this.props;
    if(!isLoggedIn) this.setState({ activeItem: 'login' });
  }

  handleItemClick(e, { name }) {
    this.setState({ activeItem: name });
  }

  handleLogout(e, { name }) {
    this.setState({ activeItem: name });
    this.props.logout();
  }

  render() {
    const { activeItem } = this.state;
    const { isLoggedIn } = this.props;

    return (
      <div>
        <Menu pointing>
          <Menu.Item
              name='BuildingBlocks'
          />
          {isLoggedIn ? (
            <Fragment>
              <Menu.Item
                name='home'
                as={Link}
                to='/home'
                active={activeItem === 'home'}
                onClick={this.handleItemClick}
              />
              <Menu.Item
                name='logout'
                as={Link}
                to='#'
                active={activeItem === 'logout'}
                onClick={this.handleLogout}
              />
            </Fragment>
          ) : (
            <Fragment>
              <Menu.Item
                name='login'
                as={Link}
                to='/login'
                active={activeItem === 'login'}
                onClick={this.handleItemClick}
              />
              <Menu.Item
                name='signup'
                as={Link}
                to='/signup'
                active={activeItem === 'signup'}
                onClick={this.handleItemClick}
              />
            </Fragment>
          )}
          <Menu.Menu position='right'>
            <Menu.Item>
              <Input icon='search' placeholder='This does nothing' />
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
