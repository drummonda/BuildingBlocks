import React, { Component } from 'react';
import {connect} from 'react-redux';
import { Message, Icon } from 'semantic-ui-react';
import { fetchPeers } from '../store/message';

class Status extends Component {

  componentDidMount() {
    setInterval(() => {
      this.props.fetchPeers();
    }, 1000);
  }

  componentDidUpdate(prevProps) {
    const { status } = this.props;
    if(status !== prevProps.status) {
      this.props.fetchPeers();
    }
  }

  render() {
    const { status } = this.props;

    return (
      <Message positive icon>
        <Icon name='circle notched' loading />
        <Message.Content>
          <Message.Header>Searching for connections</Message.Header>
          {status}
        </Message.Content>
      </Message>
    )
  }


}

const mapStateToProps = state => ({
  blockchain: state.blockchain,
  status: state.message.status,
})

const mapDispatchToProps = dispatch => ({
  fetchPeers: () => dispatch(fetchPeers())
})

export default connect(mapStateToProps, mapDispatchToProps)(Status);
