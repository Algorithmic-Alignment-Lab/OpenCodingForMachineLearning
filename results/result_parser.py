import csv
import seaborn as sns

import matplotlib.pyplot as plt

def read_labels(filename):
    '''
    Given a filename that contains a csv of (ID,TEXT,LABEL), returns a dictionary mapping
    label to a count of items with that label.

    INPUTS: string
    OUTPUTS: dictionary mapping strings to integers
    '''
    res = {}

    with open(filename, 'r') as f:
        header = True
        reader = csv.reader(f)
        for line in reader:
            if header:
                header = False
            else:
                _, _, label = line
                if label in res:
                    res[label] += 1
                else:
                    res[label] = 1

    return res

def plot_demos(demos):
    '''
    Saves figures plotting the demos provided in the 'Figures' folder. Demos are 
    expected in the form (csv_data_filename, figure_filename). 

    The csv_data_filename should be a path to a csv file of the format (ID,TEXT,LABEL). 
    The figures created are bar graphs repersenting the frequency of each label
    within the given csv file. 

    INPUTS: list of (string, string) tuples
    OUTPUTS: None
    '''
    dicts = []

    for demo, filename in demos:
        d = read_labels(demo)
        dicts.append((demo, d, filename))

    # styling
    sns.set_style('darkgrid')
    sns.set_palette('muted', 3)
    for _, d, filename in dicts:

        labels = list(d.keys())
        values = list(d.values())

        # custom figure size, adjustable
        plt.figure(figsize = (20, 5))

        plt.bar(labels, values, width = 0.4)

        plt.xlabel("Labels Created")
        plt.ylabel("No. of Text Examples in Label Category")
        plt.title("Demo Predicted Label Results")

        plt.savefig('./Figures/' + filename + '.png')
        plt.clf()


if __name__ == '__main__':
    # example usage
    csv_name = ""
    fig_title = ""
    demos = [(csv_name, fig_title)]
    plot_demos(demos)
    