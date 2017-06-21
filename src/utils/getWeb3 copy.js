import Web3 from 'web3'
// var web3Global = window.web3

let getWeb3 = new Promise(function(resolve, reject) {
  // Wait for loading completion to avoid race conditions with web3 injection timing.
  window.addEventListener('load', function() {
    var results
    var web3Result
    var web3Global = window.web3

    // Checking if Web3 has been injected by the browser (Mist/MetaMask)
    if (typeof web3Global !== 'undefined') {
      // Use Mist/MetaMask's provider.
      web3Result = new Web3(web3Global.currentProvider)

      results = {
        web3: web3Result
      }

      console.log('Injected web3 detected.');

      resolve(results)
    } else {
      // Fallback to localhost if no web3 injection.
      var provider = new Web3.providers.HttpProvider('http://localhost:8545')

      web3Result = new Web3(provider)

      results = {
        web3: web3Result
      }

      console.log('No web3 instance injected, using Local web3.');

      resolve(results)
    }
  })
})

export default getWeb3
