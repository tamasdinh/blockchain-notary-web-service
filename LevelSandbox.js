/* ===== Persist data with LevelDB ==================
|  Learn more: level: https://github.com/Level/level |
/===================================================*/

const level = require('level');
const chainDB = './chaindata';

class LevelSandbox {

    constructor() {
        this.db = level(chainDB, {valueEncoding: 'json'});
    }

    // Get data from levelDB with key (Promise)
    getLevelDBData(key) {
        let self = this;
        return new Promise(function(resolve, reject) {
            self.db.get(key, function(err, value) {
                if (err) { 
                    console.log('Not found!', err);
                    reject(err);
                };
                resolve(value);
            });
        });
    }

    // Add data to levelDB with key and value (Promise)
    addLevelDBData(key, value) { 
        let self = this;
        return new Promise(function(resolve, reject) {
            self.db.put(key, value, function(err) {
                if (err) {
                    console.log('Block ' + key + ' submission failed', err);
                    reject(err);
                };
                console.log('\nBlock #' + key + ' successfully created --\n')
                resolve(value);
            });
        });
    }

    // Method that return the height
    getBlocksCount() {
        let self = this;
        let height = 0;
        return new Promise(function(resolve, reject) {
            self.db.createReadStream()
            .on('data', function(data) {
                height++;
            })
            .on('error', function(error) {
                console.log('Block height check failed!');
                reject(error);
            })
            .on('close', function() {
                resolve(height);
            })
        })
    }
        
}

module.exports.LevelSandbox = LevelSandbox;