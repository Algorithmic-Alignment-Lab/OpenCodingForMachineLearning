import React, {Component} from 'react';

import states from './../../Constants/States';

import LinearProgress from '@material-ui/core/LinearProgress';
import CallbackKeyEventButton from '../../Custom/CallbackKeyEventButton';
import FixedSlider from './FixedSlider';

import '../../Custom/styles.css';

const fetch = require('node-fetch');

const progress = 0;

const pretrainNew = 'Pretrain New Model';

class Introduction extends Component {
    constructor(props) {
        super(props);
        this.state = {
            
        }
    }


    /**
    * When the component mounts, we get all of the titles of the parsed data set options.
    *
    * This lets us populate our dropdown.
    */
    async componentDidMount() {
        document.getElementById('continue').disabled = true
    }

    onNextSubmit = () => {
       this.props.setPrepDataDone(true);
    }


    confirmUsername = () => {
        var inputField = document.getElementById('uname');
        inputField.disabled = true;
        this.props.setUsername(document.getElementById("uname").value)
        document.getElementById('continue').disabled = false
    }
    

    render() {
        return (
        <div style={{ margin: '15px'}}>
            <div style={{ margin: '15px'}}>
                    <b>
                        Welcome To Open Coding!
                    </b>
                </div>
            <label for="username">Username:   </label>
            <input type="text" id="uname" name="uname" enabled="false"></input>
            <button onClick={this.confirmUsername}>OK</button>
            <div style={{ margin: '15px'}}></div>
            <button id = "continue" onClick={this.onNextSubmit }>Continue</button>
        </div>
        );
    }
}

export default Introduction;