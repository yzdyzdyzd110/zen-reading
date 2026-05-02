#!/bin/bash
cd "$(dirname "$0")"
nohup node launcher.js > /dev/null 2>&1 &
