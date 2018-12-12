# Project #3. RESTful web API with Express.js framework for blockchain service

The goal of the project was to create a RESTful web API with GET and POST endpoints on a local server for a simple private blockchain solution I created in Project #2 - private blockchain.

## Getting Started

These instructions will get you a copy of the project up and running on your local machine for development and testing purposes. 

### Prerequisites and installing

To install the software, you need to do the following:

**1.** Install Node.JS on your computer - visit https://nodejs.org/en/ and choose installer for your system

**2.** Clone or download GitHub repo files into desired directory from https://github.com/realtamas/Blockchain-web-API

**3.** Initialize node.js project in directory where files are located:
    
```javascript
npm init // you can accept defaults provided by npm
```
    

**4.** Install and save dependencies (crypto-js, level, express, body-parser) to project folder:

```javascript
npm install crypto-js --save
npm install level --save
npm install express --save
npm install body-parser --save
```

## Running and testing the application

**1.** Run app.js from project directory:

```javascript
node app.js
```

* app.js will initialize local server with GET and POST endpoints, listening on port 8000 (http://localhost:8000)
* blockchain application (Block.js, Blockchain.js, LevelSandbox.js and Blockcontroller.js) will initialize a blockchain with a Genesis Block and 9 Test Blocks (data persists in LevelDB local database)

**2.** Test GET and POST endpoints:

* GET request can be parametrized with api/block/:index, for example:

    ```bash
    curl --request GET -i http://localhost:8000/api/block/9  # will return Block #9 from blockchain
    ```

* POST request should include a json object with the desired block body contents (block.time, block.hash, block.previoushash will be added automatically by application), should include "Content-Type: application/json" in header, e.g.:

    ```bash
    curl --header "Content-Type: application/json" --request POST -i --data '{"body":"Test Block"}' http://localhost:8000/api/block
    # this will add a new block to the end of the blockchain and return the contents of the new block in json format
    ```


## Built With

* [Node.JS](http://www.nodejs.org) - The JavaScript runtime used
* [Express.JS](http://expressjs.com/) - The web API framework used
* [LevelDB](http://leveldb.org) - Used to persist blockchain data on disk


## Authors

* **Tamas Dinh** [LinkedIn profile](https://www.linkedin.com/in/tamasdinh/)


## Acknowledgments

* Udacity for putting together this excellent course on blockchain development and providing excellent instruction and boilerplate code for starters
* Andres Pinzon (@AlvaroP) and Steven W. (@StevenW) for swift and clear responses to my questions