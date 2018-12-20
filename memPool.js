/* ===== Mempool Class ==========================
|  Class with a constructor for new mempool		|
|  ================================================*/
const bitcoinMessage = require('bitcoinjs-message');

class Mempool {
    constructor() {
        this.memPool = [];
        this.memPoolValid = [];
    }

    // Add request validation to memPool
    addRequestValidation(request){
        let self = this;
        return new Promise (function(resolve, reject) {
            let isIncludedinMemPool;
            if (self.memPool.length > 0) {
                for (let i = 0; i < self.memPool.length; i++) {
                    if (self.memPool[i].walletAddress === request.walletAddress) {
                        isIncludedinMemPool = i;
                    }
                }
            }
            if (isIncludedinMemPool >= 0) {
                reject();
            } else {
                self.memPool.push(request);
                console.log('\nMemPool contents:\n', self.memPool) // VERBOSE
                resolve(request);
            }
        })
    }

    // Set timeout for the memPool
    setTimeOut(request){
        let self = this;
        const TimeoutRequestsWindowTime = 5 * 60 * 1000;
        let timeElapse = new Date().getTime().toString().slice(0,-3) - request.requestTimeStamp;
        let timeLeft = (TimeoutRequestsWindowTime/1000) - timeElapse;
        request.validationWindow = timeLeft;
        return new Promise (function(resolve) {
            setTimeout(function(){ 
                self.memPool.splice(self.memPool.indexOf(request), 1)},
                TimeoutRequestsWindowTime);
            resolve(request);
            })
    }

    // Set validation by wallet
    async validateWalletSignature(request) {
        let self = this;
        let isIncludedinMemPool;
        let requestObject;
        let validRequest;
        for (let i = 0; i < self.memPool.length; i++) {
            if (self.memPool[i].walletAddress === request.body.address) {
                isIncludedinMemPool = i;
            }
        }
        if (isIncludedinMemPool >= 0) {
            requestObject = self.memPool[isIncludedinMemPool];
            requestObject.messageSignature = request.body.signature;
            validRequest = {
                registerStar: false,
                status: requestObject
            }
            let isValidSignature = await bitcoinMessage.verify(validRequest.status.message, validRequest.status.walletAddress, validRequest.status.messageSignature);
            if (isValidSignature === true) {
                validRequest.status.messageSignature = 'valid';
                validRequest.registerStar = true;
                self.memPoolValid.push(validRequest.status.walletAddress);
                self.memPool.splice(self.memPool.indexOf(requestObject), 1);
                console.log('\nMemPoolValid contents:\n', self.memPoolValid); // VERBOSE
            }
        } else {
            throw new Error;
        }
        return validRequest;
    }

    validateAddressRequest(requestAddress) {
        let isValid = this.memPoolValid.includes(requestAddress);
        this.memPoolValid.splice(this.memPoolValid.indexOf(requestAddress), 1);
        return isValid;
    }

}

module.exports.Mempool = Mempool;