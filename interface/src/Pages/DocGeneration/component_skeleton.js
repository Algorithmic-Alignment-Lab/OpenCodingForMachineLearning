// 

import React, {Component} from 'react';
import states from './../../Constants/States';

import CallbackKeyEventButton from '../../Custom/CallbackKeyEventButton';
import LinearProgress from '@material-ui/core/LinearProgress';

const progress = 0; /* TODO: set this to the intermediate value between previous progress and next progress*/

class MyComponent extends Component {
    constructor(props) {
        super(props);
        this.state = {
            sectionComplete: false, /* TODO: interact with the page and decide when to allow the user to move on. */
        };
    }

    /**
    * When the component mounts, we save the annotations from open coding, and ask for them back. 
    * Asking for them back is more of an example, could techically just use locally saved state.
    
    * todo: see if this makes post less angry about database being locked
    */
    async componentDidMount () {
        try {
            // save the annotations before we ask for them
            await this.props.postData('/data/save_annotations', {"rows": this.props.loadAnnotations(), "id": this.props.getOptionID()});
            const data = await this.props.getDataWithParams('/data/get_annotations', {"id": this.props.getOptionID()});
            
            if (!data.ok) {
                throw Error(data.statusText);
            }

        } catch (error) {
            console.log(error);
        }
    }

    onNextSubmit = () => {
        this.props.updateState(/* TODO: set the next state here! */);
        // pass in states.{something}
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
                        MyComponent
                    </b>
                </div>
            
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

export default MyComponent;