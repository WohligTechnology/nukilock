const path = require('path');
var unlockAction = 1;
var lockAction = 2;
var nodecam = require('node-webcam');
var schema = new Schema({
    name: {
        type: String,
        required: true,
        unique: true,
        uniqueCaseInsensitive: true,
        excel: {
            name: "Name"
        }
    },
    nukiId: {
        type: Number,
        unique: true
    },
    lastKnownState: Schema.Types.Mixed,
    token: String
});

schema.plugin(deepPopulate, {});
schema.plugin(uniqueValidator);
schema.plugin(timestamps);
module.exports = mongoose.model('Nukilock', schema);

var exports = _.cloneDeep(require("sails-wohlig-service")(schema));
var model = {
    saveNukiLocks: function (nukiLocks, token, callback) {
        async.each(nukiLocks, function (lock, callback) {
            lock.token = token;
            var nukiLock = new Nukilock(lock);
            nukiLock.save(function () {
                callback(null);
            });
        }, callback);
    },
    getNukiLock: function (data, callback) {
        var filter = {};
        if (!_.isEmpty(data)) {
            filter: data
        }
        Nukilock.findOne(filter).exec(callback);
    },
    getNukiLockState: function (data, callback) {
        async.parallel({
            nukiLockBridgeUrl: function (callback) {
                Config.findOne({
                    name: "nukiLockBridgeUrl"
                }, callback);
            },
            nukilock: function (callback) {
                Nukilock.getNukiLock(data, callback);
            }
        }, function (err, result) {

            if (err || _.isEmpty(result.nukiLockBridgeUrl) || _.isEmpty(result.nukilock)) {
                callback(err);
            } else {
                var options = {
                    method: 'get',
                    url: result.nukiLockBridgeUrl.content + "/lockState",
                    qs: {
                        token: result.nukilock.token,
                        nukiId: result.nukilock.nukiId
                    }
                };
                request(options, function (err, httpResponse, lockInfo) {
                    if (err || _.isEmpty(lockInfo)) {
                        callback(err);
                    } else {
                        try {
                            lockInfo = JSON.parse(lockInfo);
                        } catch (e) {
                            return callback(err, lockInfo);
                        }
                       // console.log(typeof lockInfo);
                       // console.log(lockInfo);
                        callback(err, lockInfo);
                    }
                });
            }
        });
    },
    lockNukilock: function (data, callback) {
        async.parallel({
            nukiLockBridgeUrl: function (callback) {
                Config.findOne({
                    name: "nukiLockBridgeUrl"
                }, callback);
            },
            nukilock: function (callback) {
                Nukilock.getNukiLock(data, callback);
            }
        }, function (err, result) {
		console.log(result);
            if (err || _.isEmpty(result.nukiLockBridgeUrl) || _.isEmpty(result.nukilock)) {
                callback(err);
            } else {
                var options = {
                    method: 'get',
                    url: result.nukiLockBridgeUrl.content + "/lockAction",
                    qs: {
                        token: result.nukilock.token,
                        nukiId: result.nukilock.nukiId,
                        action: lockAction
                    }
                };
                request(options, function (err, httpResponse, lockInfo) {
                    if (err || _.isEmpty(lockInfo)) {
                        callback(err);
                    } else {
                        console.log(lockInfo);
                        try {
                            lockInfo = JSON.parse(lockInfo);

                        } catch (e) {
                            return callback(err, lockInfo);
                        }
console.log(typeof lockInfo);
console.log(lockInfo);
                        callback(err, lockInfo);
                    }
                });
            }
        });
    },
    unlockNukilock: function (data, callback) {
        async.parallel({
            nukiLockBridgeUrl: function (callback) {
                Config.findOne({
                    name: "nukiLockBridgeUrl"
                }, callback);
            },
            nukilock: function (callback) {
                Nukilock.getNukiLock(data, callback);
            }
        }, function (err, result) {
            console.log(result);
            if (err || _.isEmpty(result.nukiLockBridgeUrl) || _.isEmpty(result.nukilock)) {
                callback(err);
            } else {
                var options = {
                    method: 'get',
                    url: result.nukiLockBridgeUrl.content + "/lockAction",
                    qs: {
                        token: result.nukilock.token,
                        nukiId: result.nukilock.nukiId,
                        action: unlockAction
                    }
                };
                request(options, function (err, httpResponse, lockInfo) {
                    if (err || _.isEmpty(lockInfo)) {
                        callback(err);
                    } else {
                        try {
                            lockInfo = JSON.parse(lockInfo);
                        } catch (e) {
                            return callback(err, lockInfo);
                        }
                      //  console.log(typeof lockInfo);
                       // console.log(lockInfo);
                        callback(err, lockInfo);
                    }
                });
            }
        });
    },
    saveShot: function (callback) {
		console.log("snapShot taken");
        var cam = nodecam.create({
            callbackReturn: "location",
            output: "jpeg",
            width: 889,
            height: 500,
            quality: 60,
        });
        cam.capture("./webcam.jpg", callback);
        
    },
    tryPromise: function (req, res) {
        var somevar = false;
        return new Promise(function (resolve, reject) {
            if (somevar === true)
                resolve();
            else {
                //    /     throw "oh no"

                var err = new Error('I was constructed via the "new" keyword!', "err");
                err.name = "err!!";

                throw err;
                reject("oh no");
                console.log("after");
            }
            //reject();
        });
    },
    processImage: function (callback) {
        console.log("sending request");
        var formData = {
            name: Config.detectName,
            file: fs.createReadStream(path.resolve('./webcam.jpg')),

        }
        console.time("sending image");
        Config.findOne({
            name: "mainServerUrl"
        }).exec((err, data) => {
            request.post({
                url: data.content + '/api/Face/processImage',
                formData: formData
            }, function (err, httpResponse, body) {
				console.timeEnd("sending image");
                //console.log(typeof JSON.parse(body));
                try {
                    body = JSON.parse(body);
                } catch (e) {
                    return callback(err, body);
                }
                //body = JSON.parse(body);
                if (err || !body.value) {
                    callback(err, body);
                    return 0;
                }
                
                callback(null, body.data);
                //var openLock = false;
                ////console.log(body.data);
                //_.each(body.data, function (d) {
					////console.log(">>>>>>>>>>>>>>>",d);
                  ////  _.each(f, function (d) {
                        //if (d.distance < 0.6) {
                            //console.log(`${d.className} detected with distance ${d.distance}`);
                            //openLock = true;
                        //}
                    ////});
                //});

                //if (openLock) {
					//console.time("open door");  
                    //Nukilock.unlockNukilock({}, callback);
                //} else {
                    //callback(err, body);
                //}

            });
        });
    },
    getDevices: function(req, res){
		 bluetooth.init().then(async ()=>{
		 });
	}
};
module.exports = _.assign(module.exports, exports, model);
