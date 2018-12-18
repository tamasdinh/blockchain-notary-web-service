/* ===== Mempool Class ==========================
|  Class with a constructor for new mempool		|
|  ================================================*/

class Mempool {
    constructor() {
        this.memPool = [];
        this.timeoutRequests = [];
    }

    // Add request validation to memPool
    addRequestValidation(request){
        let self = this;
        return new Promise (function(resolve, reject) {
            if (!self.memPool.includes(request.walletAddress)) {
                self.memPool.push(request.walletAddress);
                console.log(self.memPool)
                resolve(request);
            } else {
                reject();
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
        return new Promise (function(resolve, reject) {
            self.timeoutRequests[request.walletAddress] = setTimeout(function(){ 
                self.removeValidationRequest(request.walletAddress)},
                TimeoutRequestsWindowTime);
            resolve(request);
            })
    }


}

module.exports.Mempool = Mempool;