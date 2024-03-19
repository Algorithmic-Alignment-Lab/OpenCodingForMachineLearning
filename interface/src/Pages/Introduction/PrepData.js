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
            selectedFile: null,
            numAnnotate: null,
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

    onFileChange = event => {
        // Update the state
        this.setState({ selectedFile: event.target.files[0] });

    };

    onFileUpload = () => {
        // Assuming you're storing the username in the state after confirming it
        // If not, you may need to adjust this to fetch the username from wherever it is stored
        const username = document.getElementById("uname").value;
    
        // Create an object of formData
        const formData = new FormData();
      
        // Update the formData object with the file and username
        formData.append("file", this.state.selectedFile, this.state.selectedFile.name);
        formData.append("username", username); // Ensure the backend expects this field
      
        // Details of the uploaded file
        console.log(this.state.selectedFile);
      
        // Request made to the backend api
        // Send formData object
        fetch('/upload', {
            method: 'POST',
            body: formData,
            // Do not set 'Content-Type' header here, let the browser set it
        })
        .then(response => response.json()) // Assuming your backend responds with JSON
        .then(data => {
            console.log(data);
            if (data.numRows !== undefined) {
                this.setState({numAnnotate: data.numRows});
                this.props.setNumAnnotate(data.numRows); // Call the method passed down from App.js to update the state there
            }
        })
        .catch(error => {
            console.error(error);
        });
    };

    render() {
        return (
        <div style={{ margin: '15px'}}>
            <div style={{ margin: '15px'}}>
                    <b>
                        Welcome To Open Coding! Please upload your chat csv file and enter your provided username. Do not forget to Confirm your username.
                    </b>
            </div>
            <div>
                <input type="file" onChange={this.onFileChange} />
                <button onClick={this.onFileUpload}>Upload</button>
            </div>
            <br></br>
            <label for="username">Username:   </label>
            <input type="text" id="uname" name="uname" enabled="false"></input>
            <button onClick={this.confirmUsername}>Confirm</button>
            <div style={{ margin: '15px'}}></div>
            <button id = "continue" onClick={this.onNextSubmit }>Continue</button>
        </div>
        );
    }
}

export default Introduction;