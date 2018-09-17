import React from 'react'
import PropTypes from 'prop-types'
import {connect} from 'react-redux'
import Blockies from 'react-blockies'
import Blockchain from './blockchain'
import BlockchainExplain from './blockchainExplain'

/**
 * COMPONENT
 */
export const UserHome = props => {
  const {email} = props

  return (
    <div>
      <BlockchainExplain />
      <h3>Welcome to Building Blocks,</h3>
      <div className='username'>
        <Blockies seed={email} />
        <p className="blockies">{email}</p>
      </div>
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
