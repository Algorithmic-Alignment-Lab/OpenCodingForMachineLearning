SHELL = /bin/bash

VENV = venv
PIP = $(VENV)/bin/pip
PYTHON = $(VENV)/bin/python3

# note: source doesn't work in makefile, use . instead
venv/bin/activate: requirements.txt
	python3 -m venv $(VENV)
	$(PIP) install -r requirements.txt

run: $(VENV)/bin/activate
	$(PYTHON) test_app.py
# flask --app test_app run would set the port as whatever it wants

# to stop after pressing CTRL-C, just type `deactivate`. Doesn't work in make.
clean:
	rm -rf __pycache__
	rm -rf $(VENV)