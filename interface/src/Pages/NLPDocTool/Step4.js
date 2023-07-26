import { Component } from "react";
import CssBaseline from "@mui/material/CssBaseline";
import Container from "@mui/material/Container";
import { ThemeProvider } from "@mui/material/styles";
import Header from "./blog/Header.js";

import Footer from "./blog/Footer.js";
import Stack from "@mui/material/Stack";
import Button from "@mui/material/Button";
import theme from "./blog/theme.js";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import Popover from "@mui/material/Popover";
import TextField from "@mui/material/TextField";
import Model from "./Model.js";
import ListItem from "@mui/material/ListItem";
import List from "@mui/material/List";
import ListItemText from "@mui/material/ListItemText";

import states from "./../../Constants/States";

import CallbackKeyEventButton from "../../Custom/CallbackKeyEventButton";
import LinearProgress from "@material-ui/core/LinearProgress";

const progress = 60;

class Step4 extends Component {
	constructor(props) {
		super(props);

		this.state = {
			contexts: Model.contextNames,
			contextsData: Model.csvInputs,
			anchorEl: null,
			open: false,
			id: undefined,
			selectedContext: 0,
			sectionComplete: true, // todo: come back and change it so this is only available later
		};
	}

	onNextSubmit = () => {
		this.props.updateState(states.docStep5);
	};

	/**
	 * Callback function for next submit action.
	 */
	handleNextKeyPress = (event) => {
		if (event.key === " " && this.state.sectionComplete) {
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
										Model.contextJustification = event.target.value;
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
									{this.state.contexts.map((value) => (
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
									))}
								</List>
							</Box>

							{/* <LinkButton to="/NLPDocTool/step5" onClick={()=>{
                    console.log(Model);
                }} variant="contained">
                    Confirm
                </LinkButton> */}
							<Box sx={{ margin: "15px", width: "100%" }}>
								<CallbackKeyEventButton
									callBackFunc={this.handleNextKeyPress}
									buttonAvailable={this.state.sectionComplete}
									clickFunc={this.onNextSubmit}
									text={"Next (space)"}
								/>
							</Box>
							<Box sx={{ margin: "15px" }}>
								<LinearProgress variant="determinate" value={progress} />
							</Box>
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
							{this.state.contexts[this.state.selectedContext]}
						</Typography>
						<Typography paragraph>
							{this.state.contextsData[this.state.selectedContext]}
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

export default Step4;
