#!/bin/bash
/bin/sh -ec 'cd ./server && . venv/bin/activate && export FLASK_APP=open_coding && export FLASK_RUN_PORT=8000 && flask run &'
/bin/sh -c 'cd ./NLPDocToolBackend && ./doctoolbackend.sh &'
/bin/sh -ec 'cd ./interface && npm start &'