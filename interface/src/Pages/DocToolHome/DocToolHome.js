import React, {Component} from 'react';

import states from './../../Constants/States';
import CallbackKeyEventButton from '../../Custom/CallbackKeyEventButton';
import LinearProgress from '@material-ui/core/LinearProgress';
class DocToolHome {
    render() {
        return (
            <div style={{ display: 'flex', flexDirection: 'column', height: '100%', width: '100%' }}>
                <div style={{ margin: '15px'}}>
                    <b>
                        DocToolHome
                    </b>
                </div>
                <div>Hello from our test page!</div>
            
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
                        <LinearProgress variant="determinate" value={progress}/>
                </div>
            </div>
        );
    }
}

export default DocToolHome;