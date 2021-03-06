module.exports = _.cloneDeep(require("sails-wohlig-controller"));
const path = require('path');
var url = Config.nukiBridgeUrl;
var unlockAction = 1;
var lockAction = 2;
var controller = {
    getAuthToken: function (req, res) {
        var url = Config.nukiBridgeUrl;
        var options = {
            method: 'get',
            url: url + "/auth",
        };

        request(
            options,
            function (err, httpResponse, body) {
                if (err || _.isEmpty(body)) {
                    res.callback(err);
                } else {
                    body = JSON.parse(body);
                    console.log(body, body["success"]);
                    if (body.success) {
                        var options = {
                            method: 'get',
                            url: url + "/list",
                            qs: {
                                token: body.token
                            }
                        };
                        request(options, function (err, httpResponse, locks) {
                            if (err || _.isEmpty(locks)) {
                                res.callback(err);
                            } else {
                                locks = JSON.parse(locks);
                                console.log(typeof locks);
                                console.log(locks);
                                Nukilock.saveNukiLocks(locks, body.token, res.callback);
                            }
                        });
                    } else {
                        res.callback();
                    }


                }
                // Player.blastSocket(data.tableId)
                // callback(null, body);
            });
    },
    getNukilockState: function (req, res) {
        req.body.url = req.Url;
        console.log("req.body", req.body);
        Nukilock.getNukiLockState(req.body, res.callback);
    },
    lockNukilock: function (req, res) {
        req.body.url = req.Url;
        Nukilock.lockNukilock(req.body, res.callback);
    },
    unlockNukilock: function (req, res) {
        req.body.url = req.Url;
        Nukilock.unlockNukilock(req.body, res.callback);
    },
    processImage: function (req, res) {
        Nukilock.processImage(res.callback);
    },
    setNukilockBridgeUrl: function (req, res) {
        console.log(req.body);
        Config.findOneAndUpdate({
            name: "nukiLockBridgeUrl"
        }, {
            $set: {
                content: "http://" + req.body.url + ":8080"
            }
        }, {
            upsert: true,
            new: true
        }).exec(res.callback);
    },
    setMainServerUrl: function (req, res) {
        Config.findOneAndUpdate({
            name: "mainServerUrl"
        }, {
            $set: {
                content: req.body.mainServerUrl
            }
        }, {
            upsert: true,
            new: true
        }).exec(res.callback);

    },
    setDetectName: function () {
        Config.findOneAndUpdate({
            name: "detectName"
        }, {
            $set: {
                content: data.detectName
            }
        }, {
            upsert: true,
            new: true
        }).exec(res.callback);
    },
    checkPromise: function (req, res) {
        try {
            // Nukilock.tryPromise().then(function () {
            //     res.callback(null, "done");
            // }).catch(e =>{
            //     console.log(e.message);
            //     res.callback(null, e);    
            // });
            var j = JSON.parse("");

            res.callback(null, j);
        } catch (e) {
            console.log("error");
            res.callback(null, e);
        }
        console.log("after");
    },
    getDevices: async (req, res) => {
		    //detectedDevices = [];
		     
		     setTimeout(function(){
					  res.callback(null, _.uniqBy(detectedDevices, "address") );
				} ,1000);  
		 
	}
};
module.exports = _.assign(module.exports, controller);
