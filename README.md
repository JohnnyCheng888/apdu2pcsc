# apdu2pcsc

[![npm](https://img.shields.io/npm/v/node-red-contrib-apdu2pcsc.svg?maxAge=2592000)](https://www.npmjs.com/package/node-red-contrib-apdu2pcsc)

A simple node for node-red to send apdu to rfid and smartcards

## Installation
To make it work on my RaspberryPi 3 with Raspbian Jessie version: November 2016 
I've done the following steps. Not all might be nessasary. 

> prep the apt
> ```bash
> sudo apt update
> sudo apt full-upgrade
> ```

> Get the current version of node.js
> ```bash
> sudo curl -sL https://deb.nodesource.com/setup_7.x | sudo -E bash -
> sudo apt install nodejs
> Detailed information: http://thisdavej.com/beginners-guide-to-installing-node-js-on-a-raspberry-pi/
> ```

> Reinstall node-red
> ```bash
> sudo npm i -g npm@2.x
> hash -r
> sudo npm cache clean
> sudo npm install -g --unsafe-perm node-red
> cd ~/.node-red
> npm outdated
> Detailed information: http://nodered.org/docs/hardware/raspberrypi	
> ```

> Instal the PCSC C-libraries
> ```bash
> sudo apt-get install libtool
> sudo apt-get install libusb-1.0-0-dev
> sudo apt-get install flex
> sudo apt-get install automake
> cd /usr/src
> sudo apt-get install libudev-dev
> sudo git clone git://anonscm.debian.org/pcsclite/PCSC.git
> cd PCSC
> sudo ./bootstrap
> sudo ./configure
> sudo make
> sudo make install
> Detailed information: http://pcsclite.alioth.debian.org/pcsclite.html 
> ```

> Instal the CCID C-libraries
> ```bash
> cd /usr/src
> sudo git clone --recursive git://anonscm.debian.org/pcsclite/CCID.git
> cd CCID
> sudo ./bootstrap
> sudo ./configure
> sudo make
> sudo make install
> sudo cp src/92_pcscd_ccid.rules /etc/udev/rules.d
> Detailed information: https://pcsclite.alioth.debian.org/ccid.html 
> ```

> Test the pcsc & ccid installation
> ```bash
> sudo killall pcscd -9
> sudo LIBCCID_ifdLogLevel=0x000F pcscd --foreground --debug --apdu --color
> ```
> If things are working, your CCID compatible smartcard reader should be connected.
> And smartcard insertion or NFC card detection should trigger some debug logentries.
> Here is a complete list of supported/shouldwork/notworking list of smartcard readers: 
> http://pcsclite.alioth.debian.org/ccid/section.html

> install pcsclite nodejs wrapper
> ```bash
> sudo apt-get install libpcsclite1 libpcsclite-dev
> cd ~\.node-red
> sudo npm install buffertools
> sudo npm install pcsclite
> Detailed information: https://www.npmjs.com/package/@pokusew/pcsclite  
> ```

> Restore the "node-red-start" and "node-red-stop" commands
> ```bash
> sudo wget https://raw.githubusercontent.com/node-red/raspbian-deb-package/master/resources/nodered.service -O /lib/systemd/system>>/nodered.service
> sudo wget https://raw.githubusercontent.com/node-red/raspbian-deb-package/master/resources/node-red-start -O /usr/bin/node-red-start
> sudo wget https://raw.githubusercontent.com/node-red/raspbian-deb-package/master/resources/node-red-stop -O /usr/bin/node-red-stop
> sudo chmod +x /usr/bin/node-red-st*
> sudo systemctl daemon-reload
> ```

Finaly the apdu2pcsc node-red node to send and receive apdus can be installed
```bash
cd ~\node-red
sudo npm install node-red-contrib-apdu2pcsc
```

## Installation
A sample node-red wiring to detect the austrian maestro bank card:
```javascript
[{"id":"c89fbc96.78b9f","type":"debug","z":"22ba873c.1cd0a8","name":"","active":true,"console":"false","complete":"false","x":506.5,"y":209.33334350585938,"wires":[]},{"id":"4fd940ec.28b05","type":"function","z":"22ba873c.1cd0a8","name":"Austrian maestro detection","func":"if(msg.payload == 'card inserted')\n{\n    msg.payload = '00A40000023F0000';\n    return msg;\n}\nelse if(msg.payload.indexOf('00A40000023F0000') >= 0 &&\n   msg.payload.substr(msg.payload.length - 4, 4) == '9000')\n{\n    msg.payload = '00A404000E315041592E5359532E444446303100';\n    return msg;\n}\nelse if(msg.payload.indexOf('00A404000E315041592E5359532E444446303100') >= 0 &&\n   msg.payload.substr(msg.payload.length - 4, 4) == '9000')\n{\n    msg.payload = '00A4040007A000000004306000'\n    return msg;\n}\nelse if(msg.payload.indexOf('00A4040007A000000004306000') >= 0 &&\n   msg.payload.substr(msg.payload.length - 4, 4) == '9000')\n{\n    msg.payload = 'maestro detected'\n    return msg;\n}\nelse if(msg.payload == 'card removed')\n{\n}\nelse\n{\n    msg.payload = 'none maestro';\n    return msg;\n}\n\n","outputs":1,"noerr":0,"x":192.50001525878906,"y":305.33331298828125,"wires":[["399239ee.3de70e","ecc1190e.28617"]]},{"id":"399239ee.3de70e","type":"function","z":"22ba873c.1cd0a8","name":"trigger on detection","func":"if(msg.payload == 'maestro detected')\n{\n    msg.payload = 1;\n    return msg;\n}\n","outputs":1,"noerr":0,"x":321.5,"y":436.6666259765625,"wires":[["d993acc0.361cf","26ee80a0.3d9b28"]]},{"id":"d993acc0.361cf","type":"trigger","z":"22ba873c.1cd0a8","op1":"0","op2":"1","op1type":"str","op2type":"str","duration":"250","extend":false,"units":"ms","reset":"","name":"","x":312.5,"y":517.6666259765625,"wires":[["9646093e.bbd13"]]},{"id":"9646093e.bbd13","type":"rpi-gpio out","z":"22ba873c.1cd0a8","name":"","pin":"33","set":true,"level":"1","out":"out","x":323.5,"y":584.6666259765625,"wires":[]},{"id":"1cd2f586.d540ca","type":"rpi-gpio out","z":"22ba873c.1cd0a8","name":"","pin":"15","set":true,"level":"0","out":"out","x":967.5,"y":429.6666564941406,"wires":[]},{"id":"26ee80a0.3d9b28","type":"trigger","z":"22ba873c.1cd0a8","op1":"1","op2":"0","op1type":"str","op2type":"str","duration":"100","extend":false,"units":"ms","reset":"","name":"","x":799.3333740234375,"y":431.3333435058594,"wires":[["1cd2f586.d540ca"]]},{"id":"ecc1190e.28617","type":"function","z":"22ba873c.1cd0a8","name":"trigger on none maestro","func":"if(msg.payload == 'none maestro')\n{\n    msg.payload = 1;\n    return msg;\n}\n","outputs":1,"noerr":0,"x":549.3333129882812,"y":305.3333435058594,"wires":[["26ee80a0.3d9b28","b523f1d1.bc32d"]]},{"id":"b523f1d1.bc32d","type":"delay","z":"22ba873c.1cd0a8","name":"","pauseType":"delay","timeout":"250","timeoutUnits":"milliseconds","rate":"1","nbRateUnits":"1","rateUnits":"second","randomFirst":"1","randomLast":"5","randomUnits":"seconds","drop":false,"x":789.5000762939453,"y":307.33335876464844,"wires":[["26ee80a0.3d9b28","9193cd82.427bd8"]]},{"id":"9193cd82.427bd8","type":"delay","z":"22ba873c.1cd0a8","name":"","pauseType":"delay","timeout":"250","timeoutUnits":"milliseconds","rate":"1","nbRateUnits":"1","rateUnits":"second","randomFirst":"1","randomLast":"5","randomUnits":"seconds","drop":false,"x":1032.3333740234375,"y":307.3333435058594,"wires":[["26ee80a0.3d9b28"]]},{"id":"b5cc3d7a.1b354","type":"inject","z":"22ba873c.1cd0a8","name":"","topic":"","payload":"00A40000023F0000","payloadType":"str","repeat":"","crontab":"","once":false,"x":144.5,"y":89,"wires":[["51d67592.8d7c3c"]]},{"id":"51d67592.8d7c3c","type":"Apdu2Pcsc","z":"22ba873c.1cd0a8","name":"","x":179.50001525878906,"y":207.00001525878906,"wires":[["4fd940ec.28b05","c89fbc96.78b9f"]]}]
```
On pin 33 a door opener is connected, which is trigged by an impulse.
On pin 15 a beeper is connected to give the user some feedback.
beeps 1x if the smartcard is identified successfully as maestro bank card. 
Beeps 3x if any other card is detected)

> Maestro AID:
> ```bash
> 00A4040007A000000004306000
> ```

> EMV application directory of EMV AIDs available on the smartcard
> ```bash
> 00A404000E315041592E5359532E444446303100
> ```

To simply detect is it is anykind of a EMVCo compatible credit or debit card for
international use, you could also simple select the EMV application directory.

Here is a complete list of national and international EMV-AIDs:
https://www.eftlab.co.uk/index.php/site-map/knowledge-base/211-emv-aid-rid-pix
