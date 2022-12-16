const Web3 = require('web3');
const fsPromises = require("fs").promises;
const http = require('http'); // or 'https' for https:// URLs
const fs = require('fs');
const console = require("console");
const mongoose = require("mongoose");
const TelegramBot = require("node-telegram-bot-api");

const DEVELOPER_APP_SECRET = process.env.IEXEC_APP_DEVELOPER_SECRET; // JSON string with all the secret we want to share with the dApp
const CHAIN_RPC_ENDPOINT = "https://bellecour.iex.ec";
const datasetRegistryABI = [{ "inputs": [], "stateMutability": "nonpayable", "type": "constructor" }, { "anonymous": false, "inputs": [{ "indexed": true, "internalType": "address", "name": "owner", "type": "address" }, { "indexed": true, "internalType": "address", "name": "approved", "type": "address" }, { "indexed": true, "internalType": "uint256", "name": "tokenId", "type": "uint256" }], "name": "Approval", "type": "event" }, { "anonymous": false, "inputs": [{ "indexed": true, "internalType": "address", "name": "owner", "type": "address" }, { "indexed": true, "internalType": "address", "name": "operator", "type": "address" }, { "indexed": false, "internalType": "bool", "name": "approved", "type": "bool" }], "name": "ApprovalForAll", "type": "event" }, { "anonymous": false, "inputs": [{ "indexed": true, "internalType": "address", "name": "previousOwner", "type": "address" }, { "indexed": true, "internalType": "address", "name": "newOwner", "type": "address" }], "name": "OwnershipTransferred", "type": "event" }, { "anonymous": false, "inputs": [{ "indexed": true, "internalType": "address", "name": "from", "type": "address" }, { "indexed": true, "internalType": "address", "name": "to", "type": "address" }, { "indexed": true, "internalType": "uint256", "name": "tokenId", "type": "uint256" }], "name": "Transfer", "type": "event" }, { "inputs": [{ "internalType": "address", "name": "to", "type": "address" }, { "internalType": "uint256", "name": "tokenId", "type": "uint256" }], "name": "approve", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [{ "internalType": "address", "name": "owner", "type": "address" }], "name": "balanceOf", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "baseURI", "outputs": [{ "internalType": "string", "name": "", "type": "string" }], "stateMutability": "view", "type": "function" }, { "inputs": [{ "internalType": "address", "name": "_datasetOwner", "type": "address" }, { "internalType": "string", "name": "_datasetName", "type": "string" }, { "internalType": "bytes", "name": "_datasetMultiaddr", "type": "bytes" }, { "internalType": "bytes32", "name": "_datasetChecksum", "type": "bytes32" }], "name": "createDataset", "outputs": [{ "internalType": "contract Dataset", "name": "", "type": "address" }], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [{ "internalType": "uint256", "name": "tokenId", "type": "uint256" }], "name": "getApproved", "outputs": [{ "internalType": "address", "name": "", "type": "address" }], "stateMutability": "view", "type": "function" }, { "inputs": [{ "internalType": "address", "name": "_previous", "type": "address" }], "name": "initialize", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [], "name": "initialized", "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }], "stateMutability": "view", "type": "function" }, { "inputs": [{ "internalType": "address", "name": "owner", "type": "address" }, { "internalType": "address", "name": "operator", "type": "address" }], "name": "isApprovedForAll", "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }], "stateMutability": "view", "type": "function" }, { "inputs": [{ "internalType": "address", "name": "_entry", "type": "address" }], "name": "isRegistered", "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "master", "outputs": [{ "internalType": "address", "name": "", "type": "address" }], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "name", "outputs": [{ "internalType": "string", "name": "", "type": "string" }], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "owner", "outputs": [{ "internalType": "address", "name": "", "type": "address" }], "stateMutability": "view", "type": "function" }, { "inputs": [{ "internalType": "uint256", "name": "tokenId", "type": "uint256" }], "name": "ownerOf", "outputs": [{ "internalType": "address", "name": "", "type": "address" }], "stateMutability": "view", "type": "function" }, { "inputs": [{ "internalType": "address", "name": "_datasetOwner", "type": "address" }, { "internalType": "string", "name": "_datasetName", "type": "string" }, { "internalType": "bytes", "name": "_datasetMultiaddr", "type": "bytes" }, { "internalType": "bytes32", "name": "_datasetChecksum", "type": "bytes32" }], "name": "predictDataset", "outputs": [{ "internalType": "contract Dataset", "name": "", "type": "address" }], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "previous", "outputs": [{ "internalType": "contract IRegistry", "name": "", "type": "address" }], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "proxyCode", "outputs": [{ "internalType": "bytes", "name": "", "type": "bytes" }], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "proxyCodeHash", "outputs": [{ "internalType": "bytes32", "name": "", "type": "bytes32" }], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "renounceOwnership", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [{ "internalType": "address", "name": "from", "type": "address" }, { "internalType": "address", "name": "to", "type": "address" }, { "internalType": "uint256", "name": "tokenId", "type": "uint256" }], "name": "safeTransferFrom", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [{ "internalType": "address", "name": "from", "type": "address" }, { "internalType": "address", "name": "to", "type": "address" }, { "internalType": "uint256", "name": "tokenId", "type": "uint256" }, { "internalType": "bytes", "name": "_data", "type": "bytes" }], "name": "safeTransferFrom", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [{ "internalType": "address", "name": "operator", "type": "address" }, { "internalType": "bool", "name": "approved", "type": "bool" }], "name": "setApprovalForAll", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [{ "internalType": "string", "name": "_baseURI", "type": "string" }], "name": "setBaseURI", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [{ "internalType": "address", "name": "_ens", "type": "address" }, { "internalType": "string", "name": "_name", "type": "string" }], "name": "setName", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [{ "internalType": "bytes4", "name": "interfaceId", "type": "bytes4" }], "name": "supportsInterface", "outputs": [{ "internalType": "bool", "name": "", "type": "bool" }], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "symbol", "outputs": [{ "internalType": "string", "name": "", "type": "string" }], "stateMutability": "view", "type": "function" }, { "inputs": [{ "internalType": "uint256", "name": "index", "type": "uint256" }], "name": "tokenByIndex", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" }, { "inputs": [{ "internalType": "address", "name": "owner", "type": "address" }, { "internalType": "uint256", "name": "index", "type": "uint256" }], "name": "tokenOfOwnerByIndex", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" }, { "inputs": [{ "internalType": "uint256", "name": "tokenId", "type": "uint256" }], "name": "tokenURI", "outputs": [{ "internalType": "string", "name": "", "type": "string" }], "stateMutability": "view", "type": "function" }, { "inputs": [], "name": "totalSupply", "outputs": [{ "internalType": "uint256", "name": "", "type": "uint256" }], "stateMutability": "view", "type": "function" }, { "inputs": [{ "internalType": "address", "name": "from", "type": "address" }, { "internalType": "address", "name": "to", "type": "address" }, { "internalType": "uint256", "name": "tokenId", "type": "uint256" }], "name": "transferFrom", "outputs": [], "stateMutability": "nonpayable", "type": "function" }, { "inputs": [{ "internalType": "address", "name": "newOwner", "type": "address" }], "name": "transferOwnership", "outputs": [], "stateMutability": "nonpayable", "type": "function" }];
const datasetRegistryAddress = "0x799DAa22654128d0C64d5b79eac9283008158730";
const web3 = new Web3(new Web3.providers.HttpProvider(CHAIN_RPC_ENDPOINT));
const UserSchema = new mongoose.Schema({ telegram_id: String, wallet_address: String, chat_id: String, orders: Number });
const User = mongoose.model("User", UserSchema);


async function getDatasetOwner(datasetAddress) {

  let owner = web3.eth.net.isListening()
    .then(async () => {

      let datasetRegistry = new web3.eth.Contract(datasetRegistryABI, datasetRegistryAddress);
      return await datasetRegistry.methods.ownerOf(datasetAddress).call();

    })
    .catch(e => console.log('Wow. Something went wrong: ' + e));

  return owner;

  //  web3.eth.getCode("0x6a307006c866f7d419d64aad89ceee8ae51916d0").then(console.log );

}

async function sendNotification(datasetAddress, recipientAdress, message) {

  try {
    const appSecret = JSON.parse(DEVELOPER_APP_SECRET);

    let datasetOwner = await getDatasetOwner(datasetAddress);

    if (!datasetOwner) return;

    await mongoose.connect(appSecret.MONGO_URL);
    console.log("Connected to mongo");
    const userSubscription = await User.findOne({ wallet_address: recipientAdress }).exec();

    if (userSubscription) {

      const chatId = userSubscription.chat_id;

      if (chatId) {
        const bot = new TelegramBot(appSecret.TELEGRAM_TOKEN, { polling: false });
        let botMsg = `Hey ${userSubscription.telegram_id}! The file sent by ${datasetOwner} is now ready for download.\r\n`;

        if (message && message.trim().length > 0) {
          botMsg += `The sender says: ${message}`;
        }
        bot.sendMessage(chatId, botMsg);
      }
    }
  }
  catch (err) {
    console.error(err);
  }
  finally {
    await mongoose.disconnect();
  }

}


(async () => {
  try {
    const iexecOut = process.env.IEXEC_OUT;
    const iexecIn = process.env.IEXEC_IN;
    const iexecDatasetFilename = process.env.IEXEC_DATASET_FILENAME;
    const datasetAddress = process.env.IEXEC_DATASET_ADDRESS;
    const requsterAddress = process.env.IEXEC_REQUESTER_SECRET_1; // We use the requester secret 1 for the request address 

    console.log(`File : ${iexecIn}/${iexecDatasetFilename}`) //OK
    const confidentialDataset = await fsPromises.readFile(`${iexecIn}/${iexecDatasetFilename}`);

    console.log("Dataset buffer :", confidentialDataset) //OK
    const datasetString = confidentialDataset.toString('utf-8')
    console.log("Dataset string :", datasetString)

    const datasetStruct = JSON.parse(datasetString);
    console.log("Dataset json :", datasetStruct)
    const key = datasetStruct.key;
    const url = datasetStruct.url;
    const message = datasetStruct.message;
    console.log("Key:", key)
    console.log("URL:", url)
    console.log("Message:", message)


    // we could add more information to the result if neeeded   
    const result = JSON.stringify(datasetStruct);

    //Append some results in /iexec_out/
    await fsPromises.writeFile(`${iexecOut}/result.json`, result);

    const computedJsonObj = {
      "deterministic-output-path": `${iexecOut}/`,
    };

    await fsPromises.writeFile(
      `${iexecOut}/computed.json`,
      JSON.stringify(computedJsonObj)
    );


    sendNotification(datasetAddress, requsterAddress, message)


  } catch (e) {
    console.log(e);
    process.exit(1);
  }
})();