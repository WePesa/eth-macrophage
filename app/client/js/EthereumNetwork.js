import {MICROBE} from './lib/globals.js';
import {macrophageManager} from './MacrophageManager.js';
import {EthereumNode} from './EthereumNode.js';

class EthereumNetwork {}

EthereumNetwork._ip = '127.0.0.1';
//using multiple data structures to store nodeIDs for better lookup
EthereumNetwork._members = {};
EthereumNetwork._nodeFilterCallbacks = [];

EthereumNetwork._defaultBootnode;
EthereumNetwork._currentNonce = {};

EthereumNetwork._selectedMicrobe = null;
EthereumNetwork.macrophageManager = macrophageManager;

/**
* get an array of all node IDs
* @return {[string]}
*/
EthereumNetwork.getNodeIDs = function () {
  return Object.keys(EthereumNetwork._members);
};

/**
* get a singular EthereumNode
* @param  {string} id
* @return {EthereumNode}
*/
EthereumNetwork.getNodeByID = function (id) {
  return EthereumNetwork._members[id];
};

/**
* Does the work of creating an EthereumNode and fufils the Promise with
* the node when complete
* @return {Promise}
*/
EthereumNetwork.createNode = function (isMiner, serverIP, serverPort) {
  let nonceKey = serverIP + serverPort;
  if(!EthereumNetwork._currentNonce[nonceKey]) {
    EthereumNetwork._currentNonce[nonceKey] = 0;
  }

  let currentNonce = EthereumNetwork._currentNonce[nonceKey]++;
  let defer = new Promise((resolve, reject) => {
    let newNode = new EthereumNode(currentNonce, serverIP, serverPort);

    newNode.callWS(
      {flag: 'createGethInstance', nonce: currentNonce, isMiner: isMiner},
      (node, {err, rpcport}) => {
        if(err) {
          console.error(err);
        }else {
          newNode.initializeConnection(rpcport)
          .then( () => {
            EthereumNetwork.addNode(newNode);
            resolve(newNode);
          });
        }
      }
    );
  });

  return defer;
};

/**
* @param {EthereumNode} node
*/
EthereumNetwork.addNode = function (node) {
  if(EthereumNetwork._members[node.nodeID]) {
    return;
  }
  EthereumNetwork._members[node.nodeID] = node;

  this._nodeFilterCallbacks.forEach((callback) => {
    callback(node);
  });
};

/**
* @param {EthereumNode} bootnode
*/
EthereumNetwork.setDefaultBootnode = function (bootnode) {
  EthereumNetwork._defaultBootnode = bootnode;
};

/**
* @return {EthereumNode}
*/
EthereumNetwork.getDefaultBootnode = function () {
  return EthereumNetwork._defaultBootnode;
};

/**
* Provide a callback to be invoked whenever a new node is created
* @param  {Function} callback(theNewNode)
*/
EthereumNetwork.nodeFilter = function (callback) {
  EthereumNetwork._nodeFilterCallbacks.push(callback);
};

EthereumNetwork.toggleMicrobe = function (_microbe) {
  if(_microbe.getRole() === MICROBE) {
    this._selectedMicrobe = null;
    _microbe.setRole('');
    return;
  }

  let alreadySelected = false;
  EthereumNetwork.getMacrophages().some((macrophage, i) => {
    if(macrophage === this._selectedMicrobe) {
      alreadySelected = true;
      return;
    }
  });
  if(alreadySelected) {
    return;
  }

  this._selectedMicrobe = _microbe;
  _microbe.setRole(MICROBE);
};

EthereumNetwork.getMicrobe = function () {
  return this._selectedMicrobe;
};

EthereumNetwork.toggleMacrophage = function (_macrophage) {
  if(_macrophage === this._selectedMicrobe) {
    return;
  }

  EthereumNetwork.macrophageManager.toggleMacrophage(_macrophage);
};

EthereumNetwork.getMacrophages = function () {
  return EthereumNetwork.macrophageManager.getMacrophages();
};

window.EthereumNetwork = EthereumNetwork;
export {EthereumNetwork};