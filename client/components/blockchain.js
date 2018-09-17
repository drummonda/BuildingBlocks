import {connect} from 'react-redux'
import { fetchBlockchain, mineBlock } from '../store'
import React, { Component } from 'react'
import { Form, Input, Button } from 'semantic-ui-react'
import Chain from './chain'

class Blockchain extends Component {

  constructor() {
    super();
    this.state = {
      data: '',
    }
    this.handleChange = this.handleChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.addBlock = this.addBlock.bind(this);
  }

  componentDidMount() {
    this.props.fetchBlockchain();

  }

  handleChange(evt) {
    this.setState({
      data: evt.target.value
    })
  }

  handleSubmit(evt) {
    evt.preventDefault();
    const { data } = this.state;
    this.addBlock(data);
  }

  addBlock(blockData) {
    this.props.mineBlock(blockData);
  }

  render() {
    const { data } = this.state;

    return (
      <div>
        <Chain />
        <Form onSubmit={this.handleSubmit}>
          <Input
            name='data'
            value={data}
            placeholder='Data for yo block...'
            onChange={this.handleChange}
          />
          <Button primary>
            Mine block!
          </Button>
        </Form>
      </div>
    )
  }
}

const mapStateToProps = state => ({
  blockchain: state.blockchain
});

const mapDispatchToProps = dispatch => ({
  fetchBlockchain: () => dispatch(fetchBlockchain()),
  mineBlock: blockData => dispatch(mineBlock(blockData)),
});

export default connect(mapStateToProps, mapDispatchToProps)(Blockchain);
