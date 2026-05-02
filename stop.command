#!/bin/bash
lsof -ti:3001 | xargs kill 2>/dev/null
echo "Server stopped."
