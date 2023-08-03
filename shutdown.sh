#!/bin/bash
# all port 8000 (open coding backend) and 3000 (open coding frontend) operations will be killed
# added NLPDocTool Backend port: 3030 to be shutdown
/bin/sh -ec 'kill -15 $(lsof -t -i:8000) && kill -15 $(lsof -t -i:3000); kill -15 $(lsof -t -i:3030)'