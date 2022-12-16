var request = require('request');
const fsPromises = require("fs").promises;
const http = require('http'); // or 'https' for https:// URLs
const fs = require('fs');
const console = require("console");
const mongoose = require("mongoose");
const TelegramBot = require("node-telegram-bot-api");
const THE_GRAPH_URL = "https://thegraph.bellecour.iex.ec/subgraphs/name/bellecour/poco-v5" ; 

const DEVELOPER_APP_SECRET = process.env.IEXEC_APP_DEVELOPER_SECRET; // JSON string with all the secret we want to share with the dApp

async function getDatasetOwner(datasetAddress) {

    let payload = {
      "query": `{datasets(where: {id: \"${datasetAddress}\"}) {\n    owner {\n      id\n    }\n  }\n}`
    }

    async function asyncRequest() {
      return new Promise((resolve, reject) => {
        request.post(THE_GRAPH_URL,
          { json: payload }, (error, response, body) => resolve({ error, response, body }));
      });
    }

    let response = await asyncRequest();
    try {
      return response.body.data.datasets[0].owner.id;
    }
    catch (err) {
      console.error(err);
      return null
    }

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