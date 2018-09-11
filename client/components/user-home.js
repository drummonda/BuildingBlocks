import React from 'react'
import PropTypes from 'prop-types'
import {connect} from 'react-redux'
import Blockchain from './blockchain'

/**
 * COMPONENT
 */
export const UserHome = props => {
  const {email} = props

  return (
    <div>
      <h3>Welcome to Building Blocks, {email}</h3>
      <Blockchain />
    </div>
  )
}

/**
 * CONTAINER
 */
const mapState = state => {
  return {
    email: state.user.email
  }
}

export default connect(mapState)(UserHome)

/**
 * PROP TYPES
 */
UserHome.propTypes = {
  email: PropTypes.string
}
