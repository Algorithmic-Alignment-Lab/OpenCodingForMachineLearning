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
import Link from '@mui/material/Link';
import Model from './Model.js';
import LinkButton from './LinkButton.js';
import { Navigate } from "react-router-dom";

import states from './../../Constants/States';
import {useState} from 'react'; // to allow the function to know what its props are
import CallbackKeyEventButton from './../../Custom/CallbackKeyEventButton';
import LinearProgress from '@material-ui/core/LinearProgress';

const progress = 0;

function Step1Content(props) {

  const [anchorEl, setAnchorEl] = React.useState(null);

  const [textInput, setTextInput] = React.useState(null);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleText = (event) => {
    setTextInput(event.target.value);
    Model.apiLink=textInput;
  }

  const open = Boolean(anchorEl);
  const id = open ? 'simple-popover' : undefined;

    const onNextSubmit = () => {
        console.log(props);
        props.updateState(states.docStep2);
    // pass in states.{something}
    }

    /**
    * Callback function for next submit action.
    */
    // basically just have the option for the user to do a keyboard shortcut as well as button press.
    const handleNextKeyPress = (event) => {
        if (event.key === ' ') { //&& this.state.sectionComplete){
            onNextSubmit();
        }
    };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Container maxWidth="lg">
      <Header title="NLPDocTool" />
      <main>
          <Stack
          justifyContent="center"
          alignItems="center"
          spacing={4}
          sx={{ paddingTop: 10, paddingRight: 5, paddingLeft: 5 }}
          >

          <h2> Follow the steps to produce documentation that complies with our documentation best practices </h2>
            <Box component="div" sx={{display: 'inline'}}>
            <Typography variant="h6" sx={{ fontWeight: 1000, display: 'inline' }} noWrap={false}>
            Step 1: </Typography>
            <Typography variant="h6" sx={{ fontWeight: 400, display: 'inline' }}>Customize your documentation by linking to a model</Typography>
            <Typography paragraph>Note: At this time, only models that are hosted on the Hugging Face Model Hub are supported.</Typography>
            <Typography paragraph>For more information about the models avaiable please see </Typography>
            <Link href="https://huggingface.co/docs/huggingface_hub/index">Hugging Face Hub</Link>
            </Box>
            
            <Button
              variant="contained"
              onClick={handleClick}
              aria-describedby={id}
            >Select a Model</Button>
            
          </Stack>
        </main>
      </Container>

      <Popover 
        anchorOrigin={{
          vertical: 'center',
          horizontal: 'center',
        }}
        transformOrigin={{
          vertical: 'center',
          horizontal: 'center',
        }}
        id={id}
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
      >
        <Box component="div" sx={{minWidth: 300}}>
        <Stack
          justifyContent="center"
          alignItems="center"
          spacing={4}
          sx={{ paddingTop: 10, paddingRight: 5, paddingLeft: 5 }}
          >
            <Typography variant="h6">Select a Model to Link From Hugging Face</Typography>
            
            <Typography paragraph >Note: Please make sure you put the model API</Typography>
            <Typography paragraph >Additionally, only generative NLP models are supported</Typography>
            
            <TextField 
            id="API" 
            label="API Link" 
            variant="filled" 
            fullWidth
            defaultValue="https://api-inference.huggingface.co/models"
            onChange={handleText}
            />
            {/* <Button onClick={() => {console.log({textInput})}}>TEST</Button> */}
            {/* <LinkButton to="/NLPDocTool/step2"
            onClick= {
              () => {
                if(Model.apiLink == null){
                  Model.apiLink = "https://api-inference.huggingface.co/models";
                } else {
                  Model.apiLink = textInput;
                }
              }
            }
            >Confirm</LinkButton> */}

        </Stack>
        </Box>

      </Popover> 
      <Box sx={{alignItems:'end'}}>
            <CallbackKeyEventButton
                callBackFunc={handleNextKeyPress}
                buttonAvailable={true} // todo: come back and change this => only available later
                clickFunc={onNextSubmit}
                text={'Next (space)'}
            />
        </Box>

      <Footer
        title="Designed By"
        description="XXX"
      />
      
    </ThemeProvider>
  );
}

class Step1 extends Component {
  constructor(props) {
    super(props);
    
  }

  render() {
    return (
      <Step1Content 
        updateState={this.props.updateState}
        getOptionID={this.props.getOptionID}
        getDataWithParams={this.props.getDataWithParams}
        postData={this.props.postData}
      />
    );
  }
}

export default Step1;