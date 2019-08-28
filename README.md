# foxxy-pis
Node + Vue web app to help hunt foxes in wctf

Prereq:
  Phone with wifi hotspot
  Wifi interface named wlan1 in monitor mode and up
  Tshark
  Nginx

Usage:
  Connect pi to phone hotspot
  Start Nginx
  Run 'sudo -s'
  Run 'node tshark.js'
  Run 'hostname -I'
  Go to that ip address on phone browser
