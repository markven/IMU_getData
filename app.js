//copyright pvd+ sensortag demo

var SensorTag = require('sensortag');

//add expressjs
var express = require('express');
var app = express();

//initialize

	sensorData = {
		xA: 0, // X accelerometer
		yA: 0, // Y accelerometer
		zA: 0, // Z accelerometer
		xG: 0, // X gyroscope
		yG: 0, // Y gyroscope
		zG: 0, // Z gyroscope
		humidity: 0, 
		temperature: 0,
		timeID: 0
	},
	config = {
		print: true,
		temperature: {
			curr: 25,
			min: 20,
			max: 30
		},
		humidity: {
			curr: 35,
			min: 30,
			max: 50
		},
		leftButtonClickMode: 'temperature',
		leftButtonClickTime: new Date().getTime()
	}

//print data

function printVariables() {
	if (config.print && sensorData.temperature > config.temperature.curr && sensorData.humidity > config.humidity.curr) {
		console.log('(%d, %d, %d) - (%d, %d, %d) - %d °C - %d % - %s', 
			sensorData.xA.toFixed(3), sensorData.yA.toFixed(3), sensorData.zA.toFixed(3), 
			sensorData.xG.toFixed(3), sensorData.yG.toFixed(3), sensorData.zG.toFixed(3), 
			sensorData.temperature.toFixed(1), sensorData.humidity.toFixed(1), sensorData.timeID);
		sensorData.timeID = sensorData.timeID+1;
	}

	//add time
	var myDateNow = new Date(config.leftButtonClickTime);
	config.leftButtonClickTime = myDateNow.toLocaleString();

}

SensorTag.discover(function(sensorTag) {
	console.log('discover');
	sensorTag.connect(function() {
		console.log('connect');
		sensorTag.discoverServicesAndCharacteristics(function() {
			console.log('discoverServicesAndCharacteristics');
			// to get sensortag uuid
			console.log(sensorTag.uuid);


			setInterval(function () {
				printVariables();
			}, 1000);

			// //using key presses
			// // enable collection of key presses
			// sensorTag.notifySimpleKey(function() {
			// 	sensorTag.on('simpleKeyChange', function(left, right) {
			// 		// left button is only used to turn printing on/off
			// 		if (left) {
			// 			config.print = (config.print) ? false : true;
			// 			if (config.print) {
			// 				console.log('Printing Enabled');
			// 			} else {
			// 				console.log('Printing Disabled');
			// 			}
			// 		}

			// 		// right button can be used to toggle between humidity or temperature threshold change
			// 		if (right) {
			// 			// if click is within 250 milliseconds, switch click mode
			// 			var clickTime = new Date().getTime();
			// 			if ((config.leftButtonClickTime + 250) > clickTime) {
			// 				config.leftButtonClickMode = (config.leftButtonClickMode === 'temperature') ? 'humidity' : 'temperature';
			// 				console.log('leftButtonClickMode set to ' + config.leftButtonClickMode);
			// 			} else {
			// 				config[config.leftButtonClickMode].curr = (config[config.leftButtonClickMode].curr + 1 <= config[config.leftButtonClickMode].max) ? config[config.leftButtonClickMode].curr + 1 : config[config.leftButtonClickMode].min;
			// 				console.log(config.leftButtonClickMode + ' Threshold = ' + config[config.leftButtonClickMode].curr);
			// 			}
			// 			config.leftButtonClickTime = clickTime;
			// 		}
			// 	});
			// });				


			// enable collection of humidity & temperature
			sensorTag.enableHumidity(function() {
				sensorTag.on('humidityChange', function(temperature, humidity) {
					sensorData.temperature = temperature;
					sensorData.humidity = humidity;
				});

				sensorTag.notifyHumidity(function() {
					console.log('notifyHumidity');
				});
			});
			
			// enable collection of accelerometer data
			sensorTag.enableAccelerometer(function () {
				sensorTag.on('accelerometerChange', function (x, y, z) {
					sensorData.xA = x;
					sensorData.yA = y;
					sensorData.zA = z;
					
					//console.log(x);  //test log
				});

				// period 1 - 2550 ms, default period is 2000 ms
				sensorTag.setAccelerometerPeriod(1, function () {
					sensorTag.readAccelerometer(function (x, y, z) {
						sensorData.xA = x;
						sensorData.yA = y;
						sensorData.zA = z;
					});
				});
				sensorTag.notifyAccelerometer(function () {
					console.log('notifyAccelerometer');
				});
			});
			
			// enable collection of gyrescope data
			sensorTag.enableGyroscope(function () {
				sensorTag.on('gyroscopeChange', function (x, y, z) {
					sensorData.xG = x;
					sensorData.yG = y;
					sensorData.zG = z;
				});
				// period 100 - 2550 ms, default period is 1000 ms
				// set Gyro-period
				sensorTag.setGyroscopePeriod(50, function () {
					sensorTag.readAccelerometer(function (x, y, z) {
						sensorData.xG = x;
						sensorData.yG = y;
						sensorData.zG = z;
					});
				});
				sensorTag.notifyGyroscope(function () {
					console.log('notifyGyroscope');
				});
			});
		});
	});
});

// push for fronts

app.get('/', function(req, res){
	res.send(sensorData.xA.toFixed(3)+'<br>'+sensorData.yA.toFixed(3)+'<br>'+sensorData.zA.toFixed(3)+'<br>'+config.leftButtonClickTime);
});

app.listen(3000);