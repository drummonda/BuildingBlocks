import React, { Component } from 'react'
import Blockchain from './blockchain'
import BlockchainExplain from './blockchainExplain'

/**
 * COMPONENT
 */
export default class UserHome extends Component {
  render() {
    return (
      <div>
        <BlockchainExplain />
        <h3>Welcome to Building Blocks!!</h3>
        <Blockchain />
      </div>
    )
  }
}


