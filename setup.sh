#!/bin/bash
/bin/sh -ec 'cd ./interface && npm cache verify && npm install'
# TODO: M1 machines have different installation instructions
/bin/sh -ec 'cd ./server && python3 -m venv venv && . venv/bin/activate && pip install Flask && pip install numpy && pip install torch && pip install simpletransformers && deactivate'
