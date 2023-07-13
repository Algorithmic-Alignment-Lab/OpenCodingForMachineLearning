import React, { Component } from "react";
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Link from '@mui/material/Link';
import ProTip from './ProTip';

import Button from '@mui/material/Button';
import CssBaseline from '@mui/material/CssBaseline';
import Grid from '@mui/material/Grid';
import GitHubIcon from '@mui/icons-material/GitHub';
import FacebookIcon from '@mui/icons-material/Facebook';
import TwitterIcon from '@mui/icons-material/Twitter';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import Header from './blog/Header.js';
import Footer from './blog/Footer';
import { red } from '@mui/material/colors';
import Stack from '@mui/material/Stack';
import theme from './theme.js';
import {
  BrowserRouter as Router,
  Link as RouterLink,
  Routes,
  Route,
  Redirect,
} from "react-router-dom";
import Step1 from './Step1.js';
import Step2 from './Step2.js';
import Step3 from './Step3.js';
import Step4 from './Step4.js';
import Step5 from './Step5.js';
import Results from './Results.js';
import ViewDoc from "./viewDoc.js";
import LinkButton from './LinkButton.js';



function Copyright() {
  return (
    <Typography variant="body2" color="text.secondary" align="center">
      {'Copyright © '}
      <Link color="inherit" href="https://mui.com/">
        Your Website
      </Link>{' '}
      {new Date().getFullYear()}
      {'.'}
    </Typography>
  );
}

function MainContent() {
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
              sx={{ paddingTop: 10 }}
              >

              <h2> Welcome! </h2>
              
                <h3>About This Tool</h3>
                <ol>
                  <li>Designed by XXX</li>
                  <li>Provides a walkthrough of a documentation procedure for NLP Models</li>
                  <li>Documents models hosted on the Hugging Face Hub</li>
                </ol>
                <LinkButton
                  variant="contained"
                  to="/NLPDocTool/step1"
                >Document My Model</LinkButton>
                <text>OR</text>
                <Button
                  variant="contained"
                >View a Sample Generated Documentation</Button>
                <text>OR</text>
                <Button
                  variant="contained"
                >View Best Practice Summary</Button>
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

class App extends Component {
  constructor(props) {
    super(props);
    this.state = { apiResponse: "" };
  }
  
  render() {
    return (
      <Router>
      <Routes>
      <Route
          path="/NLPDocTool"
          exact
          element={<MainContent/>}
    />
    <Route path="/NLPDocTool/step1" element={<Step1 />} />
    <Route path="/NLPDocTool/step2" element={<Step2 />} />
    <Route path="/NLPDocTool/step3" element={<Step3 />} />
    <Route path="/NLPDocTool/step4" element={<Step4 />} />
    <Route path="/NLPDocTool/step5" element={<Step5 />} />
    <Route path="/NLPDocTool/results" element={<Results />} />
    <Route path="/NLPDocTool/viewDoc" element={<ViewDoc />} />
      </Routes>
  </Router>
);
}
}

export default App;