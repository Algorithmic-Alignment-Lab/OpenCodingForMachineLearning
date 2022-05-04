import React, {Component} from 'react';

import states from './../../Constants/States';
// import progress from './../../Constants/States';
import Button from '@material-ui/core/Button';
import KeyEventButton from '../../Custom/KeyEventButton';
import NextEventButton from '../../Custom/NextEventButton';
import LinearProgress from '@material-ui/core/LinearProgress';
import { red } from '@material-ui/core/colors';

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
    async componentDidMount () {
        try {
            const data = await this.props.getDataWithParams('/data/get_results', {"id": this.props.getOptionID()});
            // show 404 or 500 errors
            if (!data.ok) {
                throw Error(data.statusText);
            }
            console.log("response recieved: " + data.saved);
            this.setState({
                savedFilepath: data.saved,
                isLoading: false,
                sectionComplete: true
            });
            console.log("set response");
        } catch (error) {
            console.log(error);
        }
    }

    handleNextKeyPress = (event) => {
        if (event.key === ' ' && this.state.sectionComplete){
            this.onNextSubmit();
        }
    };

    getVerificationNum = () => {
        return this.props.getAccuracy().length;
    }

    getVerificationAccAvg= () => {
        let summation = 0;
        for (let num of this.props.getAccuracy()){
            summation += num;
        }
        return summation/this.props.getAccuracy().length;
    }

    onNextSubmit = () => {
        this.props.updateState(states.introduction);
    }

    render() {
        return (
            <div style={{ display: 'flex', flexDirection: 'column', height: '100%', width: '100%' }}>
                <div style={{ margin: '15px'}}>
                    Results
                </div>
                <div style={{ display: 'flex', height: '75vh', width: '80vw', justifyContent: 'flex-start', alignItems: 'center', flexDirection: 'column'}}>
                        You have completed this labeling session in {this.getVerificationNum()} verification rounds with an average accuracy of {this.getVerificationAccAvg()}%. Please wait for the server to finish labeling your dataset.
                </div>
                {this.state.isLoading ? (
                    <div style={{ color: 'red', display: 'flex', height: '75vh', width: '80vw', justifyContent: 'flex-start', alignItems: 'center', flexDirection: 'column'}}>
                        Loading ...
                    </div>
                ) : (
                    <div style={{  color: 'green', display: 'flex', height: '75vh', width: '80vw', justifyContent: 'flex-start', alignItems: 'center', flexDirection: 'column'}}>
                        Prediction Complete! Find your results at ./results/{this.state.savedFilepath} 
                    </div>
                )}
                <div style={{marginTop: '15px', width:'100%'}}>
                    <div style={{alignItems:'end'}}>
                        <NextEventButton 
                            callBackFunc={this.handleNextKeyPress}
                            buttonAvailable={this.state.sectionComplete}
                            clickFunc={this.onNextSubmit}
                            text={'Finish (space)'}
                            keyMatch={' '}
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