// todo: have this page display a summary:
// for now lets try one annotation per group
// todo: figure out how to load in the groups, how they're stored.

import React, {Component} from 'react';

import states from './../../Constants/States';
// import progress from './../../Constants/States';
import LinearProgress from '@material-ui/core/LinearProgress';
import CallbackKeyEventButton from '../../Custom/CallbackKeyEventButton';
import Loading from '../../Custom/Loading';

const progress = 100;

class Results extends Component {
    constructor(props) {
        super(props);
        this.state = {
            isLoading: true,
            savedFilepath: '',
            sectionComplete: false,
        }
    }

    /**
    * When the component mounts, we prompt the server to start generating our full results, 
    * and we get the csv file which holds our results.
    */
    async componentDidMount () {
        try {
            // since this step is to train the model, and we don't care about the labeling model anymore, commented out
            // const data = await this.props.getDataWithParams('/data/get_results', {"id": this.props.getOptionID()});

            // instead lets just grab the annotations
            const data = await this.props.getDataWithParams('/data/get_annotations', {"id": this.props.getOptionID()});

            if (!data.ok) {
                throw Error(data.statusText);
            }

            this.setState({
                savedFilepath: data.saved,
                isLoading: false,
                sectionComplete: true
            });

        } catch (error) {
            console.log(error);
        }
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
    getVerificationNum = () => {
        return this.props.getAccuracy().length;
    }

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
                </div>
                {/* <div style={{ display: 'flex', height: '75vh', width: '80vw', justifyContent: 'flex-start', alignItems: 'center', flexDirection: 'column'}}>
                        You have completed this labeling session in {this.getVerificationNum()} verification rounds with an average accuracy of {this.getVerificationAccAvg()}%. Please wait for the server to finish labeling your dataset.
                </div> */}
                {this.state.isLoading ? (
                    <div style={{ color: 'red', display: 'flex', height: '75vh', width: '80vw', justifyContent: 'flex-start', alignItems: 'center', flexDirection: 'column'}}>
                        <Loading/>
                    </div>
                ) : (
                    <div style={{  color: 'green', display: 'flex', height: '75vh', width: '80vw', justifyContent: 'flex-start', alignItems: 'center', flexDirection: 'column'}}>
                        Prediction Complete! Find your results at ./results/{this.state.savedFilepath} 
                    </div>
                )}
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