  var nodecam = require('node-webcam');
  

  
         setInterval( function(){
			  
        nodecam.capture( "./test_picture", {
            callbackReturn: "location",
            output: "jpeg",
            width: 889,
            height: 500,
            quality: 60,
                delay: 0,
        }, function( err, data ) {
 console.log(err, data);
});
		}
 , 5000);
