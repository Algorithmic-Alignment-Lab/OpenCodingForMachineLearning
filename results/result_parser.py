import csv
import seaborn as sns

import matplotlib.pyplot as plt


def read_labels(filename):
    '''
    Given a filename that contains a csv of (ID,TEXT,LABEL), returns a dictionary mapping
    label: example_count.
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
    INPUTS: demos, list of str filenames
    OUTPUTS: None
    '''
    dicts = []

    for demo, title in demos:
        d = read_labels(demo)
        dicts.append((demo, d, title))

    sns.set_style('darkgrid')
    sns.set_palette('muted', 3)
    for _, d, title in dicts:

        labels = list(d.keys())
        values = list(d.values())

        plt.figure(figsize = (20, 5))

        plt.bar(labels, values, width = 0.4)
        plt.xlabel("Labels Created")
        plt.ylabel("No. of Text Examples in Label Category")
        plt.title("Demo Predicted Label Results")

        plt.savefig('./Figures/' + title + '.png')
        plt.clf()


if __name__ == '__main__':
    csv_name = ""
    fig_title = ""

    demos = [(csv_name, fig_title)]

    plot_demos(demos)
    