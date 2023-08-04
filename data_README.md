# Data
The `./data` folder is where our Flask server looks for the unlabeled csv data 
that you want to obtain labels to finetune your model that you'll document with.

There are some options there for you 

Feel free to add any csv files into this folder that adhere to the following format:

```
ID,TEXT,
0,DATASET_TITLE,
1,TEXT_1,
...,...,
N,TEXT_N,
```
If refreshing the introduction page does not make your file appear.
After quitting and re-running the Flask server, the drop down on the Introduction page will now include your new datasets as options.

