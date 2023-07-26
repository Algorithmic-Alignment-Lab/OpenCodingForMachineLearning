The current workflow for this application is as follows.

1. Make sure your model that you want to document is running. (i.e. `cd ./test_model && make run`)
2. Make sure the NLPDocTool backend is running by doing `cd ./NLPDocTool_Backend && ./doctoolbackend.sh`
3. If open coding is currently running, do `./shutdown.sh`
4. Set up and run by doing: `./setup.sh && ./opencoding.sh` (ignore the warnings)

Leftover todo:
- write out explanation for how user should train their model or their train endpoint
(for now I'm assuming they'll have pretrained it, i'm using a dummy pretrained model anyway)
- 