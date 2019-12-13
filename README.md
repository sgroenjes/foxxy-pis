# foxxy-pis
Node "omg its javascript" js + Vue web app to help hunt foxes in wctf

### Prereq List for self install:
  * npm & node
  * pm2
  * Sam's fork of zero's fork of blue_hydra (https://github.com/sgroenjes/blue_hydra) **put this next to this repo in the same folder
  * tshark
  * rtl-sdr
  * a 'wlan1' device

### SETUP
  * cd client && npm install
  * cd server && npm install
  * hostapd setup with wlan0, follow https://thepi.io/how-to-use-your-raspberry-pi-as-a-wireless-access-point/ **don't need step 8
  * to use the cheap edups as your wlan1 wifi interface, follow this (For RPI) https://github.com/aircrack-ng/rtl8812au
    * OR use an interface that can be set in monitor mode and monitor bands 2.4 and 5
  * setup nginx
  * setup pm2 **make sure the app has sudo priveledges

### USAGE
  * Connect to your pi's network
  * Go to localhost:3000 (or whatever port it uses, idk man..)
  * ???
  * Profit

### TODOs
  * specific address is tracking --> ping
  * others --> discovery thread