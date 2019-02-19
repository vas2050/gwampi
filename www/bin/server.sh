#!/bin/bash

[ $# -ne 1 ] && {
  echo "Usage: $0 [ start | stop | restart ]";
  exit -1;
}

forever $1 -w -a -t -d --minUptime 5000 --spinSleepTime 5000 -p ~/www/ -l logs/forever.log -o logs/server.out -e logs/server.err -d app.js
