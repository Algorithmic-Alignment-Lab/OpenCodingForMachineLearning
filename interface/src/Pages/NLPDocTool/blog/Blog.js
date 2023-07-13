import * as React from 'react';
import CssBaseline from '@mui/material/CssBaseline';
import Grid from '@mui/material/Grid';
import Container from '@mui/material/Container';
import GitHubIcon from '@mui/icons-material/GitHub';
import FacebookIcon from '@mui/icons-material/Facebook';
import TwitterIcon from '@mui/icons-material/Twitter';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import Header from './Header';
import MainFeaturedPost from './MainFeaturedPost';
import FeaturedPost from './FeaturedPost';
import Main from './Main';
import Sidebar from './Sidebar';
import Footer from './Footer';
import post1 from './blog-post.1.md';
import post2 from './blog-post.2.md';
import post3 from './blog-post.3.md';
import { red } from '@mui/material/colors';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button'
import theme from './theme.js';
import {
  BrowserRouter as Router,
  Link,
  Routes,
  Route,
  Redirect,
} from "react-router-dom";
import Step1 from '../Step1.js';

export default function Blog() {
  return (
    <Router>
        <Routes>
        <Route
            path="/"
            exact
            render={() => {
              return (
          <ThemeProvider theme={theme}>
            <CssBaseline />
            <Container maxWidth="lg">
            <Header title="MLDocTool" />
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
                    <li>Coffee</li>
                    <li>Tea</li>
                    <li>Milk</li>
                  </ol>
                  <Button
                    variant="contained"
                  >Document My Model</Button>
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
              description="The Algorithmic Alignment Group"
            />
            
          </ThemeProvider>
          );
        }}
      />
      <Route path="/step1" component={Step1} />
      
        </Routes>
    </Router>
  );
}
