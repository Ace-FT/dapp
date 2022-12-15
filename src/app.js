const fsPromises = require("fs").promises;
const http = require('http'); // or 'https' for https:// URLs
const fs = require('fs');
const console = require("console");

(async () => {
  try {
    const iexecOut = process.env.IEXEC_OUT;
    const iexecIn = process.env.IEXEC_IN;
    const iexecDatasetFilename = process.env.IEXEC_DATASET_FILENAME;

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
  } catch (e) {
    console.log(e);
    process.exit(1);
  }
})();