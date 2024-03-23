import React, {Component} from 'react';

import '../../Custom/styles.css';

const fetch = require('node-fetch');

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
        console.log("Confirm Clicked")
        var inputField = document.getElementById('uname');
        inputField.disabled = true;
        this.props.setUsername(document.getElementById("uname").value)
        document.getElementById('continue').disabled = false
    }

    onFileChange = event => {
        // Update the state
        console.log("File Upload Click")
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
                    Welcome to OpenCodingForML! 
                    </b>
                    <br></br>
                    <br></br>
                    In this study, you will begin interacting with an educational assistant designed for high school students to supplement their education in History.
                    <br></br>
                    <br></br>
                    Use this educational assistant to learn about History from any period. 
                    If you are prompting on subjects you may be deeply opinionated or knowledgeable about, <i>make sure you are still approaching this exercise from the perspective of high schoolers</i>, and interact with the curiosity that they may bring to it. 

                    <br></br>
                    <br></br>
                    <b>Through this study, we are keen to understand the <i>values and qualities</i> that you see or would like to see in the context of this AI application.</b>
                    <br></br>
                    <br></br>
                    <br></br>
                    <b>NEXT STEPS:</b>
                    <br></br>
                    <i>You should have a username given to you by the organizers. Please use it for the remainder of the study.</i>
                    <br></br>
                    <br></br>

                    1. Go to <a href="https://aag-chat.vercel.app/" target="_blank" rel="noopener noreferrer">AAG Chat (aag-chat.vercel.app)</a>:
                    <br></br>
                    &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;a. Enter your given username in the "Settings" panel
                    <br></br>
                    &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;b. Interact with the Language Model as described above
                    <br></br>
                    &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;c. After you have finished interacting with the model, click "Export Chat" (<i>only click Export Chat at the end</i>)
                    <br></br>
                    <br></br>
                    2. Please upload your chat csv file (username_chat.csv) below and click 'Upload'. 
                    <br></br>
                    <br></br>
                    3. Please enter your given username and click 'Confirm'.
                    <br></br>
                    <br></br>
            </div>
            <div style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                // flexDirection: 'column',
                // height: '100vh'
            }}>
                <input type="file" onChange={this.onFileChange} />
                <button onClick={this.onFileUpload}>Upload</button>
                
                &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp; &nbsp;
                
                <label htmlFor="username">Username:   </label>
                <input type="text" id="uname" name="uname" enabled="false"></input>
                <button onClick={this.confirmUsername}>Confirm</button>
            </div>
            <div style={{ margin: '15px'}}></div>
            
            <button id = "continue" onClick={this.onNextSubmit }>Continue</button>
        </div>
        );
    }
}

export default Introduction;