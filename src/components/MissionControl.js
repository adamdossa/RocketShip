import React, { Component } from 'react'
import './MissionControl.css'


class MissionControl extends Component {


  render() {
    // console.log(this.state.web3);
    console.log("Rendering...");
    return (
      <div className="info-card-wide mdl-card mdl-cell mdl-cell--6-col mdl-shadow--2dp teal lighten-2">
        <div className="mdl-card__title">
          <h2 className="mdl-card__title-text">Mission Control</h2>
        </div>
        <div className="mdl-card__supporting-text">
          Some rules...
          Some more rules...
          Even more rules...
          {this.state.blockNumber}
          Something Else...
        </div>
      </div>
    )
  }

  constructor(props) {
    super(props);
    this.state = {
      blockNumber: null
    }
    this.updateBlockNumber = this.updateBlockNumber.bind(this);
  }

  updateBlockNumber(err, block) {
    if (!err) {
      this.setState({blockNumber: block.number});
    } else {
      console.log("Error: " + err);
    }
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.web3 != null) {
      console.log("Received web3 props");
      var filter = nextProps.web3.eth.filter('latest');
      filter.watch((error, result) =>{
        nextProps.web3.eth.getBlock(result, true, this.updateBlockNumber);
      });
    }
  }

}

export default MissionControl
