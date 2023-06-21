import React, {Component} from 'react';

import states from './../../Constants/States';
import CallbackKeyEventButton from '../../Custom/CallbackKeyEventButton';
import LinearProgress from '@material-ui/core/LinearProgress';

class DocToolHome {
    constructor(props) {
        super(props);
        this.state = {
            sectionComplete: true, // set on for now so we can test easier.
            progressPercent: 100,
        };
    }

    onNextSubmit = () => {
        this.props.updateState(states.verification);
    }

    /**
    * Callback function for next submit action.
    */
    // basically just have the option for the user to do a keyboard shortcut as well as button press.
    handleNextKeyPress = (event) => {
        if (event.key === ' ' && this.state.sectionComplete){
            this.onNextSubmit();
        }
    };

    render() {
        return (
            <div style={{ display: 'flex', flexDirection: 'column', height: '100%', width: '100%' }}>
                <div style={{ margin: '15px'}}>
                    <b>
                        DocToolHome
                    </b>
                </div>
                <div>Hello from our test page!</div>
                <div>Todo:</div>
                <li>
                    Add Taylor's repo here locally.
                    Connect assistedGrouping to her hypothesis generation stage
                    connect her hypothesis checking / accuracy stage to our verification stage
                </li>
            
                <div style={{margin: '15px', width:'100%'}}>
                        <div style={{alignItems:'end'}}>
                            <CallbackKeyEventButton
                                callBackFunc={this.handleNextKeyPress}
                                buttonAvailable={this.state.sectionComplete}
                                clickFunc={this.onNextSubmit}
                                text={'Next (space)'}
                            />
                        </div>
                    </div>
                    <div style={{ margin: '15px'}}>
                        <LinearProgress variant="determinate" value={this.state.progress}/>
                </div>
            </div>
        );
    }
}

export default DocToolHome;