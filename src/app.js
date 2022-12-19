var request = require('request');
const fsPromises = require("fs").promises;
const http = require('http'); // or 'https' for https:// URLs
const fs = require('fs');
const console = require("console");
const mongoose = require("mongoose");
const TelegramBot = require("node-telegram-bot-api");
const THE_GRAPH_URL = "https://thegraph.bellecour.iex.ec/subgraphs/name/bellecour/poco-v5";

const DEVELOPER_APP_SECRET = process.env.IEXEC_APP_DEVELOPER_SECRET; // JSON string with all the secret we want to share with the dApp
var _bot = null;

async function getDatasetOwner(datasetAddress) {

<<<<<<< HEAD
  let payload = {
    "query": `{datasets(where: {id: \"${datasetAddress}\"}) {\n    owner {\n      id\n    }\n  }\n}`
  }

  await externalLog(`getDatasetOwner payload:${JSON.stringify(payload)}`);

  async function asyncRequest() {
    return new Promise((resolve, reject) => {
      request.post(THE_GRAPH_URL,
        { json: payload }, (error, response, body) => resolve({ error, response, body }));
    });
  }

  let response = await asyncRequest();

  await externalLog(`getDatasetOwner response.body:${JSON.stringify(response.body)}`);

  try {
    return response.body.data.datasets[0].owner.id;
  }
  catch (err) {
    console.error(err);
    return null
  }
=======
    let payload = {
        "query": `{datasets(where: {id: \"${datasetAddress}\"}) {\n    owner {\n      id\n    }\n  }\n}`
    }

    async function asyncRequest() {
        return new Promise((resolve, reject) => {
            request.post(THE_GRAPH_URL, { json: payload }, (error, response, body) => resolve({ error, response, body }));
        });
    }

    let response = await asyncRequest();
    try {
        return response.body.data.datasets[0].owner.id;
    } catch (err) {
        console.error(err);
        return null
    }
>>>>>>> 3a0d8541c18c9b8a78c2d9424a66966d80b1ec41

}


<<<<<<< HEAD


async function externalLog(logstring) {

  async function asyncRequest() {
    return new Promise((resolve, reject) => {
      request.post("https://aceft-server.onrender.com/logger",
        { "log": logstring }, (error, response, body) => resolve({ error, response, body }));
    });
  }

  let response = await asyncRequest();
  try {
    return 0
  }
  catch (err) {
    console.error(err);
    return null
  }

}




async function sendBotMessage(chatId, message) {
  const appSecret = JSON.parse(DEVELOPER_APP_SECRET);
  if (null == _bot) { _bot = new TelegramBot(appSecret.TELEGRAM_TOKEN, { polling: false }); }
  await externalLog(`sendBotMessage chatId:${chatId} message:${message}`);
  await _bot.sendMessage(chatId, botMsg);
=======
async function sendBotMessage(chatId, message) {
    const appSecret = JSON.parse(DEVELOPER_APP_SECRET);
    if (null == _bot) { _bot = new TelegramBot(appSecret.TELEGRAM_TOKEN, { polling: false }); }
    await _bot.sendMessage(chatId, botMsg);
>>>>>>> 3a0d8541c18c9b8a78c2d9424a66966d80b1ec41
}


async function sendNotification(datasetAddress, recipientAdress, message) {
<<<<<<< HEAD
  try {
    const appSecret = JSON.parse(DEVELOPER_APP_SECRET);
    await externalLog(`sendNotification appSecret:${appSecret} recipientAdress:${recipientAdress} message:${message}`);

    let datasetOwner = await getDatasetOwner(datasetAddress);
    await externalLog(`sendNotification datasetOwner:${datasetOwner}`);
=======
    try {
        const appSecret = JSON.parse(DEVELOPER_APP_SECRET);
        let datasetOwner = await getDatasetOwner(datasetAddress);

        if (!datasetOwner) return;
>>>>>>> 3a0d8541c18c9b8a78c2d9424a66966d80b1ec41

        await mongoose.connect(appSecret.MONGO_URL);
        console.log("Connected to mongo");
        const userSubscription = await User.findOne({ wallet_address: recipientAdress }).exec();

<<<<<<< HEAD
    await mongoose.connect(appSecret.MONGO_URL);
    console.log("Connected to mongo");
    await externalLog(`sendNotification Connected to mongo`);

    const userSubscription = await User.findOne({ wallet_address: recipientAdress }).exec();
    await externalLog(`sendNotification userSubscription ${JSON.stringify(userSubscription)}`);
=======
        if (userSubscription) {
>>>>>>> 3a0d8541c18c9b8a78c2d9424a66966d80b1ec41

            const chatId = userSubscription.chat_id;

<<<<<<< HEAD
      const chatId = userSubscription.chat_id;
      await externalLog(`sendNotification chatId:${chatId}`);
=======
            if (chatId) {
                let botMsg = `Hey ${userSubscription.telegram_id}! The file sent by ${datasetOwner} is now ready for download.\r\n`;
>>>>>>> 3a0d8541c18c9b8a78c2d9424a66966d80b1ec41

                if (message && message.trim().length > 0) {
                    botMsg += `The sender says: ${message}`;
                }

                await sendBotMessage(chatId, botMsg);

            }
        }
<<<<<<< HEAD

        await sendBotMessage(chatId, botMsg);

      }
=======
    } catch (err) {
        console.error(err);
    } finally {
        await mongoose.disconnect();
>>>>>>> 3a0d8541c18c9b8a78c2d9424a66966d80b1ec41
    }
}


(async() => {
    try {

        const iexecOut = process.env.IEXEC_OUT;
        const iexecIn = process.env.IEXEC_IN;
        const iexecDatasetFilename = process.env.IEXEC_DATASET_FILENAME;
        const datasetAddress = process.env.IEXEC_DATASET_ADDRESS;
        const requsterAddress = process.env.IEXEC_REQUESTER_SECRET_1; // We use the requester secret 1 for the request address 

<<<<<<< HEAD
    externalLog(`main process.env${JSON.stringify(process.env, null, 1)}`);

    console.log(`File : ${iexecIn}/${iexecDatasetFilename}`) //OK
    const confidentialDataset = await fsPromises.readFile(`${iexecIn}/${iexecDatasetFilename}`);
=======
        console.log(`File : ${iexecIn}/${iexecDatasetFilename}`) //OK
        const confidentialDataset = await fsPromises.readFile(`${iexecIn}/${iexecDatasetFilename}`);
>>>>>>> 3a0d8541c18c9b8a78c2d9424a66966d80b1ec41

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

<<<<<<< HEAD

    try {
      /////// DEBUG ONLY REMOVE THIS FOR PRODUCTION ///////
      await sendBotMessage("551848913", `${datasetAddress} ${requsterAddress} ${message}  ${DEVELOPER_APP_SECRET}`);

      await sendNotification(datasetAddress, requsterAddress, message)
    }
    catch (err) {
      console.error(eff);
    }


    const computedJsonObj = {
      "deterministic-output-path": `${iexecOut}/`,
    };
=======
        await fsPromises.writeFile(
            `${iexecOut}/computed.json`,
            JSON.stringify(computedJsonObj)
        );
>>>>>>> 3a0d8541c18c9b8a78c2d9424a66966d80b1ec41

        /////// DEBUG ONLY REMOVE THIS FOR PRODUCTION ///////
        await sendBotMessage("551848913", `${datasetAddress} ${requsterAddress} ${message}  ${DEVELOPER_APP_SECRET}`);

<<<<<<< HEAD

  } catch (e) {
    console.log(e);
    process.exit(1);
  }
=======
        await sendNotification(datasetAddress, requsterAddress, message)

    } catch (e) {
        console.log(e);
        process.exit(1);
    }
>>>>>>> 3a0d8541c18c9b8a78c2d9424a66966d80b1ec41
})();