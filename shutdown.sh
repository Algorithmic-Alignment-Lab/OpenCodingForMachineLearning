#!/bin/bash
# all port 8000 and 3000 operations will be killed
/bin/sh -ec 'kill -15 $(lsof -t -i:8000) && kill -15 $(lsof -t -i:3000)'