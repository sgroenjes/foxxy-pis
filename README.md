# foxxy-pis
Nodejs + Vue web app to help hunt foxes in wctf

### Prereq List for self install:
  * npm & node
  * tshark
  * rtl-sdr
  * a 'wlan1' device && hci0 device

### SETUP
  * cd client && npm install && 
  * npm run build (Unless it's already there, building on a pi can be slow..)
  * cd server && npm install
  * hostapd setup with wlan0, follow https://thepi.io/how-to-use-your-raspberry-pi-as-a-wireless-access-point/ **don't need step 8
  * (these kinda suck) to use the cheap edups as your wlan1 wifi interface, follow this (For RPI) https://github.com/aircrack-ng/rtl8812au
    * OR use an interface that can be set in monitor mode and monitor bands 2.4 and 5
  * setup nginx
  * setup systemd service, I used this config
  ```
  [Unit]
  Description=Fox Hunter Service
  After=hostapd.service

  [Service]
  Type=idle
  ExecStart=/bin/bash -c 'node /home/pi/foxxy-pis/server/foxHunter.js > /home/pi/foxxy-pis/server/foxHunter.log 2>&1'

  [Install]
  WantedBy=multi-user.target
  ```

### USAGE
  * Connect to your pi's network, should be foxxyPi#
  * Open browser to 192.168.4.1 (by default)
  * ???
  * Profit
