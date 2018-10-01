import React, { Component } from 'react'
import {connect} from 'react-redux'
import { Card, Button } from 'semantic-ui-react'
import { fetchBlockchain } from '../store'
import Block from './block'

class Chain extends Component {

  componentDidMount() {
    this.props.fetchBlockchain();
  }

  render() {
    const { blockchain } = this.props;

    return (
      <div>
        <Button
          primary
          onClick={() => this.props.fetchBlockchain()}
        >
          Refresh
        </Button>

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
});

export default connect(mapStateToProps, mapDispatchToProps)(Chain);
