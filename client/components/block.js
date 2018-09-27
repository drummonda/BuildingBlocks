import React from 'react'
import { Card, Modal, Button, Header } from 'semantic-ui-react'

const Block = ({ block }) => {

  return (
    <div className='block' >
      <Card color='teal'>
        <Card.Content>
          <Card.Header>Block #{block.index}</Card.Header>
        </Card.Content>
        <Modal trigger={<Button>Details</Button>}>
          <Modal.Header>Block #{block.index} Details</Modal.Header>
          <Modal.Content >
            <Modal.Description>

              <Header>Block Hash:</Header>
              <p>{block.hash}</p>

              <Header>Block Timestamp:</Header>
              <p>{block.timestamp}</p>

              <Header>Previous Block Hash:</Header>
              <p>{block.previousHash}</p>

              <Header>Block Transactions:</Header>
              <ul>
                {block.data.map(t => <li key={t.id}>Transaction: {t.id}</li>)}
              </ul>

            </Modal.Description>
          </Modal.Content>
        </Modal>
      </Card>

    </div>
  )
}

export default Block;
