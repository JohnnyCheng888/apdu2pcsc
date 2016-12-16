module.exports = function(RED) {
    function Apdu2Pcsc(config) 
	{
		// get pcsclite
		const pcsclite = require('pcsclite');
		const pcsc = pcsclite();

        RED.nodes.createNode(this,config);
        var node = this;
		var pcscReader;
		var readerProtocol;
		// on input message arrives
        this.on('input', function(msg) 
		{
			console.log('input msg arrived: ', msg.payload);
			if(msg.payload == 'card removed')
			{
				console.log('card removal detected');
				return;
			}
			
			
			var buffer = new Buffer(new Uint8Array(msg.payload.length / 2));

			for(var i = 0; i < msg.payload.length; i+=2)
			{
				if(isNaN(parseInt(msg.payload.substr(i, 2), 16)))
				{
					console.log('ignoring none apdu');
					return;
				}
				buffer[i / 2] = (parseInt(msg.payload.substr(i, 2), 16));
			}
				
			
			var debugString = "";
			for(var i = 0; i < buffer.length; i++)
			{
				debugString = debugString.concat(buffer[i].toString(16));
			}
			console.log('sending apdu to chipcard: ', debugString);
			
			// input message is APDU as string. Reformat to binary byte array and send to reader.
			pcscReader.transmit(buffer, 255, readerProtocol, function(err, data)
			{
				if (err) 
				{
					console.log(err);
					node.send(msg);
				} else {
					console.log('Data received', data);
					var response = "";
					for(var i = 0; i < data.length; i++)
					{
						response = response.concat(('00' + data[i].toString(16)).substr(-2));
					}
					
					msg.payload = msg.payload.concat(response);
					node.send(msg);
				}
			});
        });
		
		pcsc.on('reader', function(reader) 
		{
			console.log('New reader detected', reader.name);
			
			pcscReader = reader;
		
			reader.on('error', function(err) 
			{
				console.log('Error(', this.name, '):', err.message);
			});
		 
			reader.on('status', function(status) 
			{
				console.log('Status(', this.name, '):', status);
				/* check what has changed */
				var changes = this.state ^ status.state;
				if (changes) 
				{
					if ((changes & this.SCARD_STATE_EMPTY) && (status.state & this.SCARD_STATE_EMPTY)) 
					{
						console.log("card removed");/* card removed */
						reader.disconnect(reader.SCARD_LEAVE_CARD, function(err) 
						{
							if (err) 
							{
								console.log(err);
								var msg = { payload: 'err' };
								node.send(msg);
							} else 
							{
								console.log('Disconnected');
								var msg = { payload: 'card removed' };
								node.send(msg);
							}
						});
					} else if ((changes & this.SCARD_STATE_PRESENT) && (status.state & this.SCARD_STATE_PRESENT)) {
						console.log("card inserted");/* card inserted */
						reader.connect({ share_mode : this.SCARD_SHARE_SHARED }, function(err, protocol) {
							if (err) {
								console.log(err);
								var msg = { payload: 'err' };
								node.send(msg);
							} else {
								console.log('Protocol(', reader.name, '):', protocol);
								readerProtocol = protocol;
								var msg = { payload: 'card inserted' };
								node.send(msg);
							}
						});
					}
				}
			});
		 
			reader.on('end', function() {
				console.log('Reader',  this.name, 'removed');
			});
		});
		 
		pcsc.on('error', function(err) {
			console.log('PCSC error', err.message);
		});
    }
	
    RED.nodes.registerType("Apdu2Pcsc",Apdu2Pcsc);
}


 
