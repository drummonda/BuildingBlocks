import React, { Component } from 'react';
import { Button, Modal, Header } from 'semantic-ui-react';

const defaultState = {
    open: false,
    first: true,
    second: false,
};

export default class Status extends Component {

  constructor() {
    super();
    this.state = defaultState;
    this.handleNext = this.handleNext.bind(this);
    this.handleClose = this.handleClose.bind(this);
    this.handleOpen = this.handleOpen.bind(this);
  }

  handleOpen() {
    const newState = {...defaultState, open: true}
    this.setState(newState);
  }

  handleClose() {
    this.setState(defaultState)
  }

  handleNext(obj) {
    const currState = {...this.state};
    const newState = {...currState, ...obj};
    this.setState(newState);
  }

  render() {
    const { open } = this.state;

    return (
      <Modal
        open={open}
        onOpen={this.handleOpen}
        onClose={this.handleClose}
        trigger={<Button>How does this work?</Button>}>
          <Modal.Header>Blockchain explained</Modal.Header>
          <Modal.Content >
            <Modal.Description>

              {this.state.first && <Welcome handleNext={this.handleNext} />}

              {this.state.second && <Mining handleClose={this.handleClose} />}

            </Modal.Description>
          </Modal.Content>
      </Modal>
    )
  }

}

const Welcome = ({ handleNext }) => {
  return (
    <div>
      <Header>Welcome!</Header>
      <p>Welcome to the blockchain explanation</p>
      <p>This app represents an implementation of a very simple blockchain</p>
      <p>Follow the arrows to get a clearer picture of what's going on behind the scense</p>

      <Button onClick={() => handleNext({ first: false, second: true })}>
        Next
      </Button>
    </div>
  )
}

const Mining = ({ handleClose }) => {
  return (
    <div>
      <Header>How does mining work?</Header>
      <p>Some cool stuff</p>
      <Button onClick={() => handleClose()}>
        Finish
      </Button>
    </div>
  )
}
