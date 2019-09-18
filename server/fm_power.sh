#!/bin/bash
usage() {
  echo "Usage: rm_power.sh [CenterFrequency]"
  echo "Example: rm_power.sh 90.1"
}

if [ "$#" -ne 1 ]; then 
  echo "Illegal number of arguments"
  usage
  exit 1
fi

CF=$1
LOWER=$(bc <<< "scale=2; $CF-0.1")
LOWER+="M"
UPPER=$(bc <<< "scale=2; $CF+0.1")
UPPER+="M"
echo "Lower Frequency: $LOWER"
echo "Upper Frequency: $UPPER"

# Get power values over the lower and upper bounds, 200khz in 50k bins
# TODO: return timestamp 
rtl_power -f $LOWER:$UPPER:50k -g 1 -i 1 -P | while read line; do echo $line | cut -f7- -d , | sed s/,//g | xargs -n 1 | sort | head -1; done
