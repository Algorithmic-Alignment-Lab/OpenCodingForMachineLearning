// todo: have this page display a summary:
// for now lets try one annotation per group
// todo: figure out how to load in the groups, how they're stored.

import React, {Component} from 'react';

import states from './../../Constants/States';
// import progress from './../../Constants/States';
import LinearProgress from '@material-ui/core/LinearProgress';
import CallbackKeyEventButton from '../../Custom/CallbackKeyEventButton';
import Loading from '../../Custom/Loading';

import DataTable from './DataTable'

const progress = 100;
const ID_INDEX = 0;
const ANNOTATION_INDEX = 1;
const TEXT_INDEX = 2;

class Results extends Component {
    constructor(props) {
        super(props);
        this.state = {
            isLoading: true,
            savedFilepath: '',
            sectionComplete: false,
            userCodes: []
        };
        this.summaryTableColumns = [
            	{ field: "id", headerName: "ID", width: 70 },
            	{ field: "annotation", headerName: "Annotation", width: 130 },
            	{ field: "text", headerName: "Text", width: 130 },
        ];

    }

    /**
    * When the component mounts, we prompt the server to start generating our full results, 
    * and we get the csv file which holds our results.
    */
    async componentDidMount () {
        try {
            console.log("========== MOUNTING RESULTS ==========")
            // since this step is to train the model, and we don't care about the labeling model anymore, commented out
            // const data = await this.props.getDataWithParams('/data/get_results', {"id": this.props.getOptionID()});

            // instead lets just grab the annotations
            const data = await this.props.getDataWithParams('/data/get_annotations', {"id": this.props.getOptionID()});
            
            console.log("Pulled the following data from get_annotations backend call:")
            console.log(data);
            console.log("");
            // todo: figure out how to access all the groups, this only gets the 

            if (!data.ok) {
                throw Error(data.statusText);
            }

            // load the codes from the user (that we just pulled in data)
            // place it in the state
            
            // template for when we know to extract particular things
            // since react can render an array rather than an object
            let userCodesExtracted = [];
            // for (let i = 0; i < data.rows.length; i++) {
            //     // just try to extract everything that will be helpful
            //     userCodesExtracted.push([data.rows[i].id, data.rows[i].annotation, data.rows[i].text]);
            // }
            // console.log("Extracted the data we pulled into this array: ");
            userCodesExtracted = data.rows.slice();
            console.log(userCodesExtracted);

            this.setState({
                savedFilepath: data.saved,
                isLoading: false,
                sectionComplete: true,
                userCodes: userCodesExtracted
            });

        } catch (error) {
            console.log(error);
        }
        console.log("====== DONE MOUNTING, SEE LOGS ABOVE ==========")
    }

    /**
    * Callback function for next submission.
    */
    handleNextKeyPress = (event) => {
        if (event.key === ' ' && this.state.sectionComplete){
            this.onNextSubmit();
        }
    };

    /**
    * Number of verification rounds.
    */
    // getVerificationNum = () => {
    //     return this.props.getAccuracy().length;
    // }

    /**
    * Average accuracy accross all verification rounds.
    */
    getVerificationAccAvg= () => {
        let summation = 0;
        for (let num of this.props.getAccuracy()){
            summation += num;
        }
        return summation/this.props.getAccuracy().length;
    }

    getSummary = () => {
        // check Taylor's Step4 ListItem, Button Box as a way to make a table
        // or look at grid component material UI
        return (
            // this.state.userCodes.map((row) => <li>{row[ID_INDEX]} || {row[ANNOTATION_INDEX]} || {row[TEXT_INDEX]} </li>)
            <DataTable
                rows={this.state.userCodes}
                columns={this.summaryTableColumns}
            />
        );
    }

    /**
    * Next submit action. Updates UI page state.
    */
    onNextSubmit = () => {
        // this.props.updateState(states.introduction);
        // todo: probably prompt them to save their contexts (i.e. prompts and groups) somewhere before they have to get there?
        this.props.updateState(states.codeJustification);
    }

    render() {
        return (
            <div style={{ display: 'flex', flexDirection: 'column', height: '100%', width: '100%' }}>
                <div style={{ margin: '15px'}}>
                    <b>
                        Results
                    </b>
                </div>
                <div>
                    Todo: place summary here!
                    {this.getSummary()}
                </div>

                {/* <div style={{ display: 'flex', height: '75vh', width: '80vw', justifyContent: 'flex-start', alignItems: 'center', flexDirection: 'column'}}>
                        You have completed this labeling session in {this.getVerificationNum()} verification rounds with an average accuracy of {this.getVerificationAccAvg()}%. Please wait for the server to finish labeling your dataset.
                </div> */}
                {/* {this.state.isLoading ? (
                    <div style={{ color: 'red', display: 'flex', height: '75vh', width: '80vw', justifyContent: 'flex-start', alignItems: 'center', flexDirection: 'column'}}>
                        <Loading/>
                    </div>
                ) : (
                    <div style={{  color: 'green', display: 'flex', height: '75vh', width: '80vw', justifyContent: 'flex-start', alignItems: 'center', flexDirection: 'column'}}>
                        Prediction Complete! Find your results at ./results/{this.state.savedFilepath} 
                    </div>
                )} */}
                <div style={{marginTop: '15px', width:'100%'}}>
                    <div style={{alignItems:'end'}}>
                        <CallbackKeyEventButton 
                            callBackFunc={this.handleNextKeyPress}
                            buttonAvailable={this.state.sectionComplete}
                            clickFunc={this.onNextSubmit}
                            text={'Finish (space)'}
                        />
                    </div>
                </div>
                <div style={{marginTop: '15px'}}>
                    <LinearProgress variant="determinate" value={progress}/>
                </div>
            </div>

        );
    }
}

export default Results;