import React from 'react';
import _ from 'underscore';
import {Well, Row, Col, Panel, Glyphicon} from 'react-bootstrap';
import fuzzy from 'fuzzy'
import app from '../bootstrap';

export default React.createClass({
  propTypes: {
    query: React.PropTypes.string
  },

  getInitialState() {
    return {
      loading: false,
      tracks: []
    }
  },

  componentWillMount() {
    this.filters = [
      {
        key: 'provider',
        cb: (item) => true
      }
    ];
  },

  componentDidMount() {
    this.loadData(this.props.query);
  },

  componentWillReceiveProps(nextProps) {
    this.replaceFilter('search', function (track) {
      var searchString = [
        'track:' + (track.name ? track.name : '-'),
        'artist:' + (track.artists ? _.first(track.artists).name : '-'),
        'album:' + (track.album.name ? track.album.name : '-'),
        'date:' + (track.album.date ? track.album.date : '-')
      ].join(' ');
      
      return fuzzy.test(nextProps.search || nextProps.query, searchString);
    });

    if (this.props.query !== nextProps.query) {
      this.loadData(nextProps.query);
    }

    this.forceUpdate();
  },

  componentShouldUpdate(nextProps) {
    return this.props.query !== nextProps.query;
  },

  loadData(query) {
    this.setState({
      loading: true
    });

    app.get('services.mopidy')
      .then((mopidy) => {
        return mopidy.search(query);
      })
      .then((tracks) => {
        this.setState({
          tracks: tracks,
          loading: false
        });
      });
  },

  getTracks() {
    return _.filter(this.state.tracks, (track) => {
      let filterResults = _.map(this.filters, (filter) => {
        return filter.cb(track);
      });
      console.log('filter results', filterResults);
      let passes = ! _.contains(filterResults, false);
      console.log('passes', passes);
      return passes;
    });
  },

  addFilter(key, cb) {
    this.filters.push({key, cb});
  },

  removeFilter(key) {
    this.filters = _.filter(this.filters, (filter) => {
      return filter.key !== key;
    });
  },

  replaceFilter(key, cb) {
    this.removeFilter(key);
    this.addFilter(key, cb);
  },

  filterByProvider(provider) {
    this.replaceFilter('provider', function (track) {
      return provider === 'all' || track.uri.split(':')[0] === provider;
    });
    this.forceUpdate();
  },

  renderTrack(track) {
    let images = track.album ? (track.album.images || []) : [];
    let imageUrl = _.first(_.filter(images, (image) => {
      // filter out trash
      return image !== "";
    }));
    let panelStyle = {
      position: 'relative',
      zIndex: 1
    };
    let bgStyle = {
      position: 'absolute',
      left: 0,
      right: 0,
      top: 0,
      bottom: 0,
      background: 'rgba(0, 0, 0, 0.4)',
      zIndex: 2
    };
    let provider = track.uri.split(':')[0];
    let providerBsStyleMap = {
      spotify: 'success',
      soundcloud: 'warning',
      youtube: 'danger',
      gmusic: 'info'
    };
    let bsStyle = providerBsStyleMap[provider];
    let providerLogoMap = {
      spotify: 'http://www.brandsoftheworld.com/sites/default/files/styles/logo-thumbnail/public/092014/spotify_2014_0.png',
      soundcloud: 'http://icons.iconarchive.com/icons/danleech/simple/128/soundcloud-icon.png',
      youtube: 'http://media.idownloadblog.com/wp-content/uploads/2014/08/YouTube-2.9-for-iOS-app-icon-small.png',
      gmusic: 'http://media.idownloadblog.com/wp-content/uploads/2014/10/Google-Play-Music-1.5.3184-for-iOS-app-icon-small.png'
    };
    let providerLogo = providerLogoMap[provider];
    let header = (<div><img src={providerLogo} height={20} /> &nbsp; {track.name}</div>);

    return (
      <Panel bsStyle={bsStyle} header={header} style={panelStyle}>
        <Row>
          <Col md={6} sm={12}>
            <img src={imageUrl} style={{minWidth: 150, maxWidth: 300, width: '100%'}} />
          </Col>
          <Col md={6} sm={12}>
            <table className="table table-striped">
              <tr>
                <th>Track no.</th><td>{track.track_no}</td>
              </tr>
              <tr>
                <th>Artist</th><td>{track.artists ? _.first(track.artists).name : '-'}</td>
              </tr>
              <tr>
                <th>Album</th><td>{track.album.name}</td>
              </tr>
              <tr>
                <th>Date</th><td>{track.date}</td>
              </tr>
            </table>
          </Col>
        </Row>
      </Panel>
    );
  },

  render() {
    let tracks = this.getTracks();

    return this.state.loading ? (
      <Well>
        <center>
          <span className="glyphicon glyphicon-refresh spinning" style={{fontSize: 40}}></span><br />
          <br />
          Hang in there, this might take a while...
        </center>
      </Well>
    ) : (
      <div>
        <a onClick={this.filterByProvider.bind(this, 'all')}>all</a> &nbsp; 
        <a onClick={this.filterByProvider.bind(this, 'spotify')}>spotify</a> &nbsp; 
        <a onClick={this.filterByProvider.bind(this, 'youtube')}>youtube</a> &nbsp; 
        <a onClick={this.filterByProvider.bind(this, 'soundcloud')}>soundcloud</a> &nbsp; 
        <a onClick={this.filterByProvider.bind(this, 'gmusic')}>gmusic</a>
        { tracks.length > 0 ? (
        <Well>
          {_.map(tracks, (track) => this.renderTrack(track))}
        </Well>
        ) : '' }
      </div>
    );
  }
});
