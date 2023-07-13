import React, { Component } from "react";
import CssBaseline from '@mui/material/CssBaseline';
import Grid from '@mui/material/Grid';
import Container from '@mui/material/Container';
import GitHubIcon from '@mui/icons-material/GitHub';
import FacebookIcon from '@mui/icons-material/Facebook';
import TwitterIcon from '@mui/icons-material/Twitter';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import Header from './blog/Header.js';

import Footer from './blog/Footer.js';
import { red } from '@mui/material/colors';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button'
import theme from './blog/theme.js';
import Typography from '@mui/material/Typography';
import { IconButton } from "@mui/material";
import KeyboardDoubleArrowRightIcon from '@mui/icons-material/KeyboardDoubleArrowRight';
import Box from '@mui/material/Box';
import Popover from '@mui/material/Popover';
import TextField from '@mui/material/TextField';
import Model from './Model.js';
import LinkButton from './LinkButton.js';
import { Navigate } from "react-router-dom";
import ListItem from '@mui/material/ListItem';
import List from '@mui/material/List';
import ListItemText from '@mui/material/ListItemText';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';


class Step2 extends Component {
    constructor(props) {
      super(props);
      this.state = {
          predictEndpoint: "/",
          parameters: [],
          name: "",
          type: "",
          paramIndex: 1,
          outputs: [],
          nameO: "",
          typeO: "",
          outputIndex: 1
      }
    }

    handleTextEndpoint = (event) => {
      this.setState({
        predictEndpoint: event.target.value
      })
    }

    handleTextName = (event) => {
      this.setState({
        name: event.target.value
      })
    }

    handleTextType = (event) => {
      this.setState({
        type: event.target.value
      })
    }

    clearParamInput = (event) => {
      document.getElementById("nameBox").value = "";
      
    }

    handleTextNameO = (event) => {
      this.setState({
        nameO: event.target.value
      })
    }

    handleTextTypeO = (event) => {
      this.setState({
        typeO: event.target.value
      })
    }

    clearOutputInput = (event) => {
      document.getElementById("nameBoxO").value = "";
      document.getElementById("typeBoxO").value = "";
    }
  
    render() {
        
      return (
        <ThemeProvider theme={theme}>
            <CssBaseline />
            <Container maxWidth="lg">
            <Header title="NLPDocTool" />
            <main>
                <Stack
                justifyContent="center"
                alignItems="center"
                spacing={2}
                sx={{ paddingTop: 10, paddingRight: 5, paddingLeft: 5 }}
                >

                <h2>Step 2: Add the Rules </h2>
                <Typography variant="h6" >
                  Specify how to run the prediction </Typography>
                <Box component="div" sx={{display: 'inline'}}>
                  <Typography variant="h6" sx={{ fontWeight: 400, display: 'inline' }} noWrap={false}>
                   Specify the endpoint of your predict method (by default for Hugging Face it is "/"): </Typography>
                  
                  <TextField 
                    id="endpoint" 
                    variant="filled" 
                    fullwidth="true"
                    defaultValue="/"
                    size="small"
                    hiddenLabel
                    onChange={this.handleTextEndpoint}
                    sx={{ paddingLeft: 5 }}
                    />
                </Box>
                <Typography variant="h6">
                   Specify the name of the String to run the model on
                </Typography>
                <Typography paragraph>
                   Note that only default parameters for running the model are accepted at this time.
                </Typography>
               
                  
                <Box component="div" sx={{display: 'inline', paddingBottom:4}}> 
                  <TextField 
                    id="nameBox" 
                    label="Name"
                    variant="filled" 
                    // fullwidth="true"
                    size="small"
                    // hiddenLabel
                    onChange={this.handleTextName}
                    sx={{ paddingLeft: 7 }}
                    />
                    
                    <IconButton
                    size="large"
                    onClick={(event) => {
                      var i = this.state.paramIndex;
                      var n = this.state.name;
                      var t = this.state.type;
                      let parameter = {
                        id:i,
                        name:n,
                        type:t
                      };

                      // put i + 1 in paramIndex
                      this.setState({
                        type: "",
                        // name: "",
                        paramIndex: i,
                        
                      })
                      
                      //push should be here in the future
                      this.state.parameters[0] =parameter

                      // this.clearParamInput(event);
                      console.log(this.state.parameters);
                      console.log(this.state.predictEndpoint);
                      
                    }}>
                      <CheckCircleIcon />
                    </IconButton>
                </Box>
                <Typography variant="h6">
                   Specify the model output
                </Typography>
                <Typography paragraph>
                  Note: Only JSON Output is accepted at this time.
                  <br></br> Further, the Name entered must be the name of model output string.
                  <br></br> Only single strings (and not arrays) are accepted at this time. 
                </Typography>
                
                <Box component="div" sx={{display: 'inline', paddingBottom:4}}> 
                  <TextField 
                    id="nameBoxO" 
                    label="Name"
                    variant="filled" 
                    // fullwidth="true"
                    size="small"
                    // hiddenLabel
                    onChange={this.handleTextNameO}
                    sx={{ paddingLeft: 7 }}
                    />
                    
                    <IconButton
                    size="large"
                    onClick={(event) => {
                      var i = this.state.outputIndex;
                      var n = this.state.nameO;
                      var t = this.state.typeO;
                      let output = {
                        id:i,
                        name:n,
                        type:t
                      };

                      //outputIndex should be i+1
                      this.setState({
                        typeO: "",
                        // nameO: "",
                        outputIndex: i,
                        
                      })
                      
                      //push to outputs
                      this.state.outputs[0]=output;

                      // this.clearOutputInput(event);
                      console.log(this.state.outputs);
                      
                    }}>
                      <CheckCircleIcon />
                    </IconButton>
                  </Box>
                  <LinkButton to="/NLPDocTool/step3" variant="contained"
                  onClick={
                    () => {
                      Model.parameters = this.state.parameters;
                      Model.outputs = this.state.outputs;
                      Model.endpoint=this.state.predictEndpoint;
                      console.log(Model);
                    }
                  }
                  >
                    Confirm
                  </LinkButton>
                </Stack>
                </main>
            </Container>

            <Footer
                title="Designed By"
                description="XXX"
            />
            
            </ThemeProvider>
      );
    }
  }
  
  export default Step2;