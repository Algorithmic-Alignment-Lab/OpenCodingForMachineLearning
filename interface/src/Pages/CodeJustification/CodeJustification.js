// have th user justify the labels they provided previously
// they're groups and open codes
// will be step4 from nlp doc tool
// previously step4, now will be the last page we show.
// todo: fix component naming
// todo: link this page to AssistedGrouping
import states from './../../Constants/States';

import CallbackKeyEventButton from '../../Custom/CallbackKeyEventButton';
import LinearProgress from '@material-ui/core/LinearProgress';

// todo: add the next 2 steps of NLPDocTool to this branch and connect the pages.
import { Component } from "react";
import CssBaseline from "@mui/material/CssBaseline";
// import Grid from "@mui/material/Grid";
import Container from "@mui/material/Container";
// import { createTheme, ThemeProvider } from "@mui/material/styles";
import { ThemeProvider } from "@mui/material/styles";
import Header from "./../../blog/Header.js";

import Footer from "./../../blog/Footer.js";
// import { red } from "@mui/material/colors";
import Stack from "@mui/material/Stack";
import Button from "@mui/material/Button";
import theme from "./../../blog/theme.js";
import Typography from "@mui/material/Typography";
// import { IconButton } from "@mui/material";
// import KeyboardDoubleArrowRightIcon from "@mui/icons-material/KeyboardDoubleArrowRight";
import Box from "@mui/material/Box";
import Popover from "@mui/material/Popover";
import TextField from "@mui/material/TextField";
// import Model from "./Model.js";
// todo: when the time comes link OpenCodingModel and deal the lines that used to have this model 
import LinkButton from "./../../Custom/LinkButton.js";
// import { Navigate } from "react-router-dom";
// import ListItem from "@mui/material/ListItem";
import List from "@mui/material/List";
// import ListItemText from "@mui/material/ListItemText";
// import CheckCircleIcon from "@mui/icons-material/CheckCircle";
// import InputLabel from "@mui/material/InputLabel";
// import Select from "@mui/material/Select";
// import MenuItem from "@mui/material/MenuItem";
// import FormControl from "@mui/material/FormControl";
// import Divider from "@mui/material/Divider";


const progress =  58; // guess of intermediate value

// class Step4 extends Component {
class CodeJustification extends Component {
	constructor(props) {
		super(props);

		this.state = {
			// contexts: Model.contextNames,
			// contextsData: Model.csvInputs,
			anchorEl: null,
			open: false,
			id: undefined,
			selectedContext: 0,
            sectionComplete: true,
		};
	}

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
        this.props.updateState(states.hypGenerationAndComparison);
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

	// fileInput = document.getElementById('input');

	// open = Boolean(this.state.anchorEl);
	// id = this.open ? 'simple-popover' : undefined;

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
							spacing={4}
							sx={{ paddingTop: 10, paddingRight: 5, paddingLeft: 5 }}
						>
							<h2>Step 4: View and Justify Your Set of Contexts </h2>

							<Typography variant="h6">
								What does this set of contexts represent?
								<br></br>
								Specifically, document this following:
							</Typography>
							<ol>
								<li>
									The process you used to generate this set of contexts. How did
									you select this process?
								</li>
								<li>
									Why is this set of contexts representative of your use case?
									Justify the connection of these contexts to the model's
									intended use.
								</li>
							</ol>

							<Typography paragraph>
								Note, this is not an exhaustive list. However, you should make
								sure your explanation touches upon at least the points mentioned
								above. Please add any other details you feel are useful.
							</Typography>

							<Box sx={{ width: "600" }}>
								<TextField
									inputProps={{
										cols: "100",
									}}
									multiline
									rows={5}
									fullWidth
									label="justification"
									id="justification"
									onChange={(event) => {
										// Model.contextJustification = event.target.value;
									}}
								/>
							</Box>
							<Typography variant="h6">Context List:</Typography>

							<Box
								sx={{
									width: "100%",
									maxWidth: 600,
									bgcolor: "background.paper",
								}}
							>
								<List>
                                    {/*Todo: come back when we start incorporating data i.e. previously shown labels */}
									{/*this.state.contexts.map((value) => (
										<ListItem
											key={value}
											component="div"
											divider
											secondaryAction={
												<Box sx={{ width: 100, bgcolor: "background.paper" }}>
													<Button
														variant="contained"
														onClick={(event) => {
															let number = this.state.contexts.indexOf(value);
															this.setState({
																anchorEl: event.currentTarget,
																id: "simple-popover",
																open: true,
																selectedContext: number,
															});
														}}
														aria-describedby={this.state.id}
													>
														Details
													</Button>
												</Box>
											}
										>
											<ListItemText primary={value} />
										</ListItem>
									))*/}
								</List>
							</Box>

							{/* <LinkButton
								to="/NLPDocTool/step5"
								onClick={() => {
									// console.log(Model);
								}}
								variant="contained"
							>
								Confirm
							</LinkButton> */}
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
						</Stack>
					</main>
				</Container>

				<Popover
					anchorOrigin={{
						vertical: "center",
						horizontal: "center",
					}}
					transformOrigin={{
						vertical: "center",
						horizontal: "center",
					}}
					id={this.state.id}
					open={this.state.open}
					anchorEl={this.state.anchorEl}
					onClose={(event) => {
						this.setState({
							anchorEl: null,
							open: false,
							id: undefined,
						});
					}}
				>
					<Stack
						justifyContent="center"
						alignItems="center"
						spacing={4}
						sx={{
							paddingTop: 5,
							paddingRight: 5,
							paddingLeft: 5,
							paddingBottom: 5,
						}}
					>
						<Typography variant="h6">Context</Typography>
						<Typography paragraph>
							{/*this.state.contexts[this.state.selectedContext]*/}
						</Typography>
						<Typography paragraph>
							{/*this.state.contextsData[this.state.selectedContext]*/}
						</Typography>

						<Button
							variant="contained"
							onClick={() => {
								this.setState({
									open: false,
								});
							}}
						>
							Done
						</Button>
					</Stack>
				</Popover>
				<Footer title="Designed By" description="XXX" />
			</ThemeProvider>
		);
	}
}

// export default Step4;
export default CodeJustification;