import React, { Component } from 'react'
import {connect} from 'react-redux'
import { Card } from 'semantic-ui-react'
import { fetchBlockchain, postBlockchain } from '../store'
import Block from './block'

class Chain extends Component {

  componentDidMount() {
    this.props.fetchBlockchain();
  }

  render() {
    const { blockchain } = this.props;
    console.log(blockchain);

    return (
      <div>
        <Card.Group>
          { blockchain.map(block => (
            <Block key={block.index} block={block} />
          ))}
        </Card.Group>
      </div>
    )
  }
}

const mapStateToProps = state => ({
  blockchain: state.blockchain
});

const mapDispatchToProps = dispatch => ({
  fetchBlockchain: () => dispatch(fetchBlockchain()),
  postBlockchain: blockchain => dispatch(postBlockchain(blockchain)),
});

export default connect(mapStateToProps, mapDispatchToProps)(Chain);
