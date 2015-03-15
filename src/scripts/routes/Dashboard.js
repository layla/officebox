import React from 'react';

import {Well, Row, Col, Panel} from 'react-bootstrap';
import {Sidebar} from '../ui';

let Dashboard = React.createClass({
  render() {
    return (
      <Row>
        <Col lg={3} md={4} sm={4} xs={12}>
          <Panel bsStyle="primary">
            <Sidebar />
          </Panel>
        </Col>
        <Col lg={9} md={8} sm={8} xs={12}>
          <Well>Dash</Well>
        </Col>
      </Row>
    );
  }
});

export default Dashboard;
