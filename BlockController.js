const SHA256 = require('crypto-js/sha256');
const BlockClass = require('./Block.js');
const BlockChain = require('./BlockChain.js');
const Mempool = require('./memPool.js');
const hex2ascii = require('hex2ascii');

/**
 * Controller Definition to encapsulate routes to work with blocks
 */
class BlockController {

    /**
     * Constructor to create a new BlockController, you need to initialize here all your endpoints
     * @param {*} app 
     */
    constructor(app) {
        this.app = app;
        this.blockChain = new BlockChain.Blockchain();
        this.memPool = new Mempool.Mempool();
        this.initializeMockData();
        this.getBlockByIndex();
        this.postNewBlock();
        this.postValidationRequest();
        this.messageSignatureValidation();
        this.starRequestValidation();
        this.getStarBlockByHash();
    }

    /**
     * Implement a GET Endpoint to retrieve a block by index, url: "/api/block/:index"
     */
    getBlockByIndex() {
        let self = this;
        this.app.get("/api/block/:blockHeight", (req, res) => {
            return self.blockChain.getBlock(req.params.blockHeight).then(result => {
                res.set({'Connection': 'close'});
                res.status(200).json(result);
                res.end();
                }, error => {
                    res.status(404).send('Block not found!\n\n');
            });
        });
    }

    /**
     * Implement a POST Endpoint to add a new Block, url: "/api/block"
     */
    postNewBlock() {
        let self = this;
        this.app.post("/api/block", (req, res) => {
            if (req.body.body) {
                return self.blockChain.addBlock(new BlockClass.Block(req.body.body)).then(result => {
                    res.status(201).json(result);
                }, error => {
                    res.status(500).send('Uknown error occurred on server side. Please retry later.\n\n')
                })
            } else {
                res.status(403).send('Block data must not be empty - please resend request with json object containing desired block data.\n\n')
            }
        });
    }

    // Post validation request
    postValidationRequest(){
        let self = this;
        self.app.post("/requestValidation", async function (req, res) {
            let requestObject = {
                walletAddress: req.body.address,
                requestTimeStamp: new Date().getTime().toString().slice(0,-3),
                //message: req.body.address + ':' + new Date().getTime().toString().slice(0,-3) + ':' + 'starRegistry',
                message: req.body.address + ':' + 'starRegistry', // TODO: swap with above
                validationWindow: 0
            };
            self.memPool.setTimeOut(requestObject)
            .then(async result => {
                requestObject = result;
                requestObject = await self.memPool.addRequestValidation(requestObject);
                return res.status(201).json(requestObject);
            }).catch((err) => {
                return res.status(403).send(`WalletAddress already in Mempool - please handle already submitted address validation request`)});
        });
    }

    messageSignatureValidation(){
        let self = this;
        this.app.post("/message-signature/validate", (req, res) => {
            self.memPool.validateWalletSignature(req)
            .then(result => {
                return res.status(201).json(result)
            }).catch(err => {
                console.log(err);
                res.status(403).send('Message signature invalid. Please resend correct message signature.')})
        })
    }

    starRequestValidation(){
        let self = this;
        this.app.post('/block', (req, res) => {
            if (self.memPool.validateAddressRequest(req.body.address)) {
                let body = {
                    address: req.body.address,
                    star: {
                        ra: req.body.star.ra,
                        dec: req.body.star.dec,
                        story: new Buffer.from(req.body.star.story).toString('hex')
                    }
                }
                self.blockChain.addBlock(new BlockClass.Block(body))
                .then(result => {
                    result.body.star.storyDecoded = hex2ascii(result.body.star.story);
                    res.status(201).json(result)
                }).catch(err => {
                    res.status(403).send('Star block could not be created at this time. Please attempt addition at a later time.')
                })
            } else {
                return res.status(403).send('Submitted wallet address has not been validated for star registry. Please validate your address at http://localhost:8000/message-signature/validate or resubmit it for validation request at http://localhost:8000/requestValidation.')
            }
        })
    }

    getStarBlockByHash() {
        let self = this;
        this.app.get('/stars/:hash/', (req, res) => {
            self.blockChain.getBlockByHash(req.params.hash)
            .then(result => {
                if (result !== null) {
                    result.body.star.storyDecoded = hex2ascii(result.body.star.story)
                    res.status(200).json(result)
                } else {
                    throw new Error;
                }
            }).catch(err => {
                res.status(403).send(`Star block with hash: "${req.params.hash}" not found`)
            })
            })
    }

    /**
     * Help method to inizialized Mock dataset, adds 10 test blocks to the blocks array
     */
    async initializeMockData() {
        let blockHeight = await this.blockChain.getBlockHeight();
        if(blockHeight === 0){
            for (let index = 1; index < 10; index++) {
                let blockAux = new BlockClass.Block(`Test Data #${index}`);
                blockAux.height = index;
                blockAux.hash = SHA256(JSON.stringify(blockAux)).toString();
                await this.blockChain.addBlock(blockAux);
            }
        }
    }

}

/**
 * Exporting the BlockController class
 * @param {*} app 
 */
module.exports = (app) => { return new BlockController(app);}