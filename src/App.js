import React, { Component } from 'react'
// import SimpleStorageContract from '../build/contracts/SimpleStorage.json'
import getWeb3 from './utils/getWeb3'
import MissionControl from './components/MissionControl.js'
import './App.css'

class App extends Component {
  constructor(props) {
    super(props)

    this.state = {
      web3: null
    }
  }

  componentWillMount() {
    // Get network provider and web3 instance.
    // See utils/getWeb3 for more info.

    getWeb3
    .then(results => {
      this.setState({
        web3: results.web3
      })
      // Instantiate contract once web3 provided.
      // this.instantiateContract()
    })
    .catch((err) => {
      console.log('Error finding web3.' + err)
    })
  }
  //
  // instantiateContract() {
  //   /*
  //    * SMART CONTRACT EXAMPLE
  //    *
  //    * Normally these functions would be called in the context of a
  //    * state management library, but for convenience I've placed them here.
  //    */
  //
  //   const contract = require('truffle-contract')
  //   const simpleStorage = contract(SimpleStorageContract)
  //   simpleStorage.setProvider(this.state.web3.currentProvider)
  //
  //   // Declaring this for later so we can chain functions on SimpleStorage.
  //   var simpleStorageInstance
  //
  //   // Get accounts.
  //   this.state.web3.eth.getAccounts((error, accounts) => {
  //     simpleStorage.deployed().then((instance) => {
  //       simpleStorageInstance = instance
  //
  //       // Stores a given value, 5 by default.
  //       return simpleStorageInstance.set(5, {from: accounts[0]})
  //     }).then((result) => {
  //       // Get the value from the contract to prove it worked.
  //       return simpleStorageInstance.get.call(accounts[0])
  //     }).then((result) => {
  //       // Update state with the result.
  //       return this.setState({ storageValue: result.c[0] })
  //     })
  //   })
  // }

  render() {
    return (
      <div className="info-layout-transparent mdl-layout mdl-js-layout">
        <header className="mdl-layout__header mdl-layout__header--transparent">
          <div className="mdl-layout-icon"></div>
          <div className="mdl-layout__header-row">
            <span className="mdl-layout-title"><h1>Rocket Ship Raider</h1></span>
            <div className="mdl-layout-spacer"></div>
          </div>
        </header>
        <div className="mdl-layout__drawer">
          <nav className="mdl-navigation">    <MissionControl/>
            <a className="mdl-navigation__link" href="">Rules</a>
            <a className="mdl-navigation__link" href="">Buy Ticket</a>
            <a className="mdl-navigation__link" href="">About</a>
          </nav>
        </div>
        <main className="mdl-layout__content">
          <div className="mdl-grid">
            <MissionControl web3={this.state.web3}/>
          </div>
        </main>
      </div>
    );
  }
}

export default App
