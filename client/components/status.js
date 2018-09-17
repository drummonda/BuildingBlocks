import React, { Component } from 'react';
import {connect} from 'react-redux';
import { Feed, Icon } from 'semantic-ui-react';

class Status extends Component {

  render() {
    const { status } = this.props;
    const recent = status.slice(-2);

    return (
      <Feed className='message'>
          {recent.map(msg => (
            <Feed.Event>
              <Feed.Label icon='rss' summary='Event'/>
              <Feed.Content summary={msg}/>
            </Feed.Event>
          ))}
      </Feed>
    )
  }


}

const mapStateToProps = state => ({
  blockchain: state.blockchain,
  status: state.message.status,
})

export default connect(mapStateToProps, null)(Status);
