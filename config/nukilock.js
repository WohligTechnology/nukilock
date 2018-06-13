var sails = require("sails");
var cron = require("node-cron");
var bluetoothDevices = []
sails.on("lifted", function () {
    //cron.schedule('*/15 * * * * *', function () {
        //Nukilock.getNukiLockState({}, function (err, data) {
            //if (err || _.isEmpty(data)) {
                //console.log("Error in finding status", err);
                //return 0;
            //}
            //if (data.stateName == "locked") {
                //async.waterfall([
                    //function (callback) { // Get Screenshot
                        //Nukilock.saveShot(callback);
                    //},
                    //function (data, callback) { // Get Screenshot
                        //Nukilock.processImage(callback);
                    //}
                //], function (err, data) {
                    //console.log(err, data);
                //});
            //}
        //});
    //});
    
     cron.schedule('*/5 * * * *', function () {
		 detectedDevices= [];
		 
 });	 
    cron.schedule('*/30 * * * * *', function () {
        Config.findOne({
            name: "mainServerUrl"
        }).exec((err, data) => {
            if (err || _.isEmpty(data)) {
                console.log(err);
            } else {
                var options = {
                    method: 'post',
                    url: data.content + "/api/Bluetooth/getMacAddresses",
                };
                request(options, function (err, httpResponse, addresses) {
				//	console.log(addresses);
					      try{
					      addresses = JSON.parse(addresses);
					  }catch(e){
						  console.log(err);
						  return;
					}
                    if (err || _.isEmpty(addresses) || !addresses.value) {
                        console.log("Unable to find addresses");
                    } else {
						console.log(addresses.data);
                        bluetoothDevices = addresses.data;
                    }
                });
            }
        });
    });
    const Bluez = require('bluez');
    global.bluetooth = new Bluez();
    global.detectedDevices = [];
    global.adapter;
    bluetooth.init().then(async () => {
        adapter = await bluetooth.getAdapter('hci0');
        await adapter.StartDiscovery();
    });
    bluetooth.on('device', async (address, props) => {
		global.detectedDevices.push({address: address, name: props.Name});
            const device = await bluetooth.getDevice(address);
                await adapter.RemoveDevice(device._interface.objectPath);
        console.log("Found new Device " + address + " " + props.Name + " " + props.RSSI + " ");
        if (_.indexOf(bluetoothDevices, address) >= 0) {
            Nukilock.getNukiLockState({}, async (err, data) => {
                if (err || _.isEmpty(data)) {
                    console.log("Error in finding status", err);
                    return 0;
                }
                
                if (data.stateName == "locked") {
                    if (props.RSSI > -75) {
                        console.log(props.Name + ' is in range');
                        Nukilock.unlockNukilock({}, function (err) {
                            if (err) {
                                callback(err);
                            } else {
                                console.log("Unlocked door");
                            }
                        });
                    }

                }
            });
        }
    });
});
