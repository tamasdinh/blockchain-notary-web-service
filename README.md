# Blockchain notary web service application

The goal of the project was to create a blockchain notary service that validates users before it allows them to make requests for storing assets attributed to their ownership. The application features a RESTful web API with multiple GET and POST endpoints on a local server through which users can interact with the blockchain solution backend.

## Procedure implemented in application

The application implements the following logical flow:

![Application logical flow](/workflow.png)

## Structure of application

- ***app.js:*** central file (to be executed for utilization of project); initializes API framework (based on express.js), imports required classes and initiates blockchain backend operation.
- ***Block.js:*** implements a simple data model for the Block class
- ***BlockChain.js:*** implements a simple blockchain (one transaction per block) with the necessary methods
- ***memPool.js:*** implements a MemPool component for the temporary storage and support of items to be validated
- ***LevelSandbox.js:*** data access layer of the app; ensures that data added to the blockchain is stored persistently on the hard drive
- ***BlockController.js:*** implements the required GET and POST endpoints by importing the necessary classes from the other files and linking methods to the corresponding endpoints

## Getting Started

These instructions will get you a copy of the project up and running on your local machine for development and testing purposes. 

### Prerequisites and installing

To install the software, you need to do the following:

**1.** Install Node.JS on your computer - visit https://nodejs.org/en/ and choose installer for your system

**2.** Clone or download GitHub repo files into desired directory from https://github.com/realtamas/blockchain-notary-web-service

**3.** Initialize node.js project in directory where files are located:
    
```javascript
npm init -y
```
    

**4.** Install and save dependencies (crypto-js, level, express, body-parser) to project folder:

```javascript
npm install crypto-js --save
npm install level --save
npm install express --save
npm install body-parser --save
npm install bitcoinjs-message --save
npm install bitcoinjs-lib --save
npm install hex2ascii --save
```

## Running and testing the application

**1.** Run app.js from project directory:

```javascript
node app.js
```

* app.js will initialize local server with GET and POST endpoints, listening on port 8000 (http://localhost:8000)
* blockchain application (Block.js, Blockchain.js, LevelSandbox.js, memPool.js and Blockcontroller.js) will initialize a blockchain with a Genesis Block and 9 Test Blocks (data persists in LevelDB local database)

**2.** Test basic GET and POST endpoints:

* POST request should include a json object with the desired block body contents (block.time, block.hash, block.previoushash will be added automatically by application), should include "Content-Type: application/json" in header, e.g.:

    ```bash
    curl --header "Content-Type: application/json" --request POST -i --data '{"body":"Test Block"}' http://localhost:8000/api/block
    # this will add a new block to the end of the blockchain and return the contents of the new block in json format
    ```

* GET request can be parametrized with api/block/:index, for example:

    ```bash
    curl --request GET -i http://localhost:8000/api/block/1  # will return Block #1 from blockchain
    ```

**3.** Test validation and star registry functionality:

* Submit an address validation request:

    ```bash
    # sample data
    curl -X POST http://localhost:8000/requestValidation \
    -H 'Content-Type: application/json' \
    -H 'cache-control: no-cache' \
    -d '{
        "address":"19xaiMqayaNrn3x7AjV5cU4Mk5f5prRVpL"
        }'
    ```
    The app will add the request to the MemPool (temporary storage for requests to be validated) and sets a timeout of 5 minutes for validation. Message to be validated will be returned in the response from the API (sample data):

    ```json
    {
    "walletAddress": "19xaiMqayaNrn3x7AjV5cU4Mk5f5prRVpL",
    "requestTimeStamp": "1541605128",
    "message": "19xaiMqayaNrn3x7AjV5cU4Mk5f5prRVpL:1541605128:starRegistry",
    "validationWindow": 300
    }
    ```

* Use your Electrum wallet to sign the message and post the signature with the address:
    
    ```bash
    # sample data
    curl -X POST http://localhost:8000/message-signature/validate \
    -H 'Content-Type: application/json' \
    -H 'cache-control: no-cache' \
    -d '{
        "address":"19xaiMqayaNrn3x7AjV5cU4Mk5f5prRVpL",
        "signature":"H8K4+1MvyJo9tcr2YN2KejwvX1oqneyCH+fsUL1z1WBdWmswB9bijeFfOfMqK68kQ5RO6ZxhomoXQG3fkLaBl+Q="
        }'
    ```
    The app will validate the signature using bitcoinjs-message and if the signature is valid, will put the requestor's wallet address as identifier into the MemPoolValid temporary storage. The app will return the validRequest object (sample data):

    ```json
    {
    "registerStar": true,
    "status": {
        "address": "19xaiMqayaNrn3x7AjV5cU4Mk5f5prRVpL",
        "requestTimeStamp": "1541605128",
        "message": "19xaiMqayaNrn3x7AjV5cU4Mk5f5prRVpL:1541605128:starRegistry",
        "validationWindow": 200,
        "messageSignature": true
    }
}

* Send star data to be stored:

    ```bash
    curl -X POST http://localhost:8000/message-signature/validate \
    -H 'Content-Type: application/json' \
    -H 'cache-control: no-cache' \
    -d '{
        "address": "19xaiMqayaNrn3x7AjV5cU4Mk5f5prRVpL",
        "star": {
                "dec": "68° 52' 56.9",
                "ra": "16h 29m 1.0s",
                "story": "Found star using https://www.google.com/sky/"
        }
        }'
    ```
    The app will verify that the sender's wallet address in included among already validated requests. If so, it will add the star data to the blockchain for permanent storage.

**4.** Test additional functionality:

* Getting star blocks by hash (sample address):

    ```bash
    curl http://localhost:8000/stars/hash/a59e9e399bc17c2db32a7a87379a8012f2c8e08dd661d7c0a6a4845d4f3ffb9f
    ```

* Getting star blocks by wallet address (all star blocks assigned to given wallet address)
:

    ```bash
    curl http://localhost:8000/stars/address/142BDCeSGbXjWKaAnYXbMpZ6sbrSAo3DpZ
    ```

* Getting star blocks by height (logically the same as the other getBlockByHeight method, but due to technical reasons I created a seperate route for this one):

    ```bash
    curl http://localhost:8000/block/2
    ```


## Built With

* [Node.JS](http://www.nodejs.org) - The JavaScript runtime used
* [Express.JS](http://expressjs.com/) - The web API framework used
* [LevelDB](http://leveldb.org) - Used to persist blockchain data on disk
* [Electrum Wallet](http://electrum.org) - Used to generate signatures
* [Postman](http://getpostman.com) - Used for API endpoint testing
* [MS Visual Studio Code](http://code.visualstudio.com) - Code editor used for scripting


## Authors

* **Tamas Dinh** [LinkedIn profile](https://www.linkedin.com/in/tamasdinh/)