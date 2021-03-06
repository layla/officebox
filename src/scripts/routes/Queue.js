import React from 'react';
import _ from 'underscore';
import {Row, Col, Panel} from 'react-bootstrap';
import {State} from 'react-router';
import {Sidebar, FilterableTracks} from '../ui';
import app from '../bootstrap';

let Queue = React.createClass({
  mixins: [State],

  getInitialState() {
    return {
      tracks: []
    };
  },

  componentWillMount() {
    app.get('services.mopidy')
      .then((mopidyService) => {
        return mopidyService.getTracklist(0, 50);
      })
      .then((tlTracks) => {
        let tracks = _.map(tlTracks, (tlTrack) => {
          return tlTrack.track;
        });
        this.setState({ tracks });
      });
  },

  render() {
    return (
      <Row>
        <Col lg={3} md={4} sm={4} xs={12}>
          <Panel bsStyle="primary" header="Menu">
            <Sidebar />
          </Panel>
        </Col>
        <Col lg={9} md={8} sm={8} xs={12}>
          <FilterableTracks tracks={this.state.tracks} />
        </Col>
      </Row>
    );
  }
});

export default Queue;
