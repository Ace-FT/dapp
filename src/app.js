var request = require('request');
const fsPromises = require("fs").promises;
const http = require('http'); // or 'https' for https:// URLs
const JSZip = require('jszip');
const console = require("console");
const mongoose = require("mongoose");
const TelegramBot = require("node-telegram-bot-api");
const {relative} = require('path');
const {isReadable} = require('stream');
const THE_GRAPH_URL = "https://thegraph.bellecour.iex.ec/subgraphs/name/bellecour/poco-v5";

const DEVELOPER_APP_SECRET = process.env.IEXEC_APP_DEVELOPER_SECRET; // JSON string with all the secret we want to share with the dApp
var _bot = null;

async function getDatasetOwner(datasetAddress) {

  let payload = {
    "query": `{datasets(where: {id: \"${datasetAddress}\"}) {\n    owner {\n      id\n    }\n  }\n}`
  }

  console.log(`getDatasetOwner - payload: ${JSON.stringify(payload)}`);

  async function asyncRequest() {
    return new Promise((resolve, reject) => {
      request.post(THE_GRAPH_URL, { json: payload }, (error, response, body) => resolve({ error, response, body }));
    });
  }

  let response = await asyncRequest();
  try {
    console.log(`getDatasetOwner - response.body.: ${JSON.stringify(response.body)}`);

    return response.body.data.datasets[0].owner.id;
  } catch (err) {
    console.error(err);
    return null
  }
}


async function sendBotMessage(chatId, message) {
  const appSecret = JSON.parse(DEVELOPER_APP_SECRET);
  if (null == _bot) { _bot = new TelegramBot(appSecret.TELEGRAM_TOKEN, { polling: false }); }
  await _bot.sendMessage(chatId, message);
}

async function sendNotification(datasetAddress, recipientAdress, message) {
  try {
    const appSecret = JSON.parse(DEVELOPER_APP_SECRET);
    let datasetOwner = await getDatasetOwner(datasetAddress);

    console.log(`sendNotification - appSecret: ${JSON.stringify(appSecret)} datasetOwner: ${datasetOwner}  `);

    if (!datasetOwner) return;

    await mongoose.connect(appSecret.MONGO_URL);

    const UserSchema = new mongoose.Schema({ telegram_id: String, wallet_address: String, chat_id: String, orders: Number });
    const User = mongoose.model("User", UserSchema);

    console.log(`sendNotification - connected to mongo `);

    const userSubscription = await User.findOne({ wallet_address: recipientAdress }).exec();
    console.log(`sendNotification - userSubscription: ${JSON.stringify(userSubscription)}`);

    if (userSubscription && userSubscription.chat_id) {
      const chatId = userSubscription.chat_id;
      let botMsg = `Hey ${userSubscription.telegram_id}! The file sent by ${datasetOwner} is now ready for download.\r\n`;

      if (message && message.trim().length > 0) {
        botMsg += `The sender says: ${message}`;
      }
      console.log(`sendNotification - botMsg: ${botMsg}`);
      await sendBotMessage(chatId, botMsg);
    }
  } catch (err) {
    console.error(err);
  } finally {
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
    console.log(`iexecOut:${iexecOut} ;  iexecIn:${iexecIn} ; iexecDatasetFilename:${iexecDatasetFilename} ; datasetAddress:${datasetAddress} ; requesterAddress:${requsterAddress}`);
    console.log(`File : ${iexecIn}/${iexecDatasetFilename}`) //OK
    const buffer = await fsPromises.readFile(`${iexecIn}/${iexecDatasetFilename}`);

    const zip = new JSZip();
    await zip.loadAsync(buffer);
    
    const readZip = async () => {
      let urlPromise;
      let fnPromise;
      let sizePromise;
      let messagePromise;
      zip.forEach(async (relativePath, file) => {
        if (!file.dir) {
          try {
            if (relativePath.includes('url')) {
              try {
                console.log("file: ", file.name, file.dir)
                console.log("relativePath", relativePath)
                urlPromise = file.async('string').then(u => {return u})
                console.log("The url is: ", urlPromise)
              } catch (error) {
                console.log(error)
              }
            }
            if (relativePath.includes('fn')) {
              try {
                console.log("file: ", file.name, file.dir)
                console.log("relativePath", relativePath)
                fnPromise = file.async('string').then(fname => {return fname})
                console.log("The file name is: ", fnPromise) 
              } catch (error) {
                console.log(error)
              }
            }
            if (relativePath.includes('size')) {
              try {
                console.log("file: ", file.name, file.dir)
                console.log("relativePath", relativePath)
                sizePromise = file.async('string').then(s => {return s})
                console.log("The size is: ", sizePromise) 
              } catch (error) {
                console.log(error)
              }
            }          
            if (relativePath.includes('message')) {
              console.log("file: ", file.name, file.dir)
              console.log("relativePath", relativePath)
              messagePromise = file.async('string').then(m => {return m})
              console.log("The msg is: ", messagePromise)
            }
          } catch (e) {
            console.log(e)
          }
        }
      })

      return {urlPromise, fnPromise, sizePromise, messagePromise}
    }

    const aceData = await readZip();
 
    let url = await aceData.urlPromise;
    let fn = await aceData.fnPromise;
    let size = await aceData.sizePromise;
    let message = await aceData.messagePromise;
    const datasetStruct = {
      "url": url,
      "fn": fn,
      "message": message,
      "size": size
    }
    console.log("Dataset json :", datasetStruct)
    
    console.log("=================")
    console.log("URL:", datasetStruct.url)
    console.log("File name:", datasetStruct.fn)
    console.log("Size:", datasetStruct.size)
    console.log("Message:", datasetStruct.message)
    console.log("=================")
    // we could add more information to the result if neeeded   
    const result = JSON.stringify(datasetStruct);

    //Append some results in /iexec_out/
    await fsPromises.writeFile(`${iexecOut}/result.json`, result);

    const computedJsonObj = {
      "deterministic-output-path": `${iexecOut}/`,
    };

    try {
      console.log(`\nmain - ${datasetAddress} ${requsterAddress} ${message}`);
      await sendNotification(datasetAddress, requsterAddress, message)
    }
    catch (err) {
      console.error(err);
    }

    await fsPromises.writeFile(
      `${iexecOut}/computed.json`,
      JSON.stringify(computedJsonObj)
    );

  } catch (e) {
    console.log(e);
    process.exit(1);
  }
})();