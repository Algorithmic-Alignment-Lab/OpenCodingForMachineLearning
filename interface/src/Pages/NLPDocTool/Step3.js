import { Component } from "react";
import axios from "axios";

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
import Model from "./Model.js";
import ListItem from "@mui/material/ListItem";
import List from "@mui/material/List";
import ListItemText from "@mui/material/ListItemText";
import InputLabel from "@mui/material/InputLabel";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";

import DataTable from "./../../Custom/DataTable"

// import App from './App.js';
import states from "./../../Constants/States";

import CallbackKeyEventButton from "../../Custom/CallbackKeyEventButton";
import LinearProgress from "@material-ui/core/LinearProgress";

const progress = 40;/* TODO: set this to the intermediate value between previous progress and next progress*/

class Step3 extends Component {
	constructor(props) {
		super(props);
		this.state = {
			fieldArray: [],
			fieldParameters: [],
			selectedFile: undefined,
			objectArray: [],
			sectionComplete: true, // todo: come back and change it so this is only available later
		};
        this.example_context_table_columns = [
            {field: "context", headerName: "(Context)", minWidth: 150}, //flex: 1}, //
            {field: "input", headerName: "(JSON Input for Representative Case)", minWidth: 400}
        ];
        // todo: make sure to tell the user that the json just needs to have the keys they utilize in their /predict
        this.example_context_table_rows = [
            {id:1, context: "informal greeting", input: '{"text": "Hi!"}'},
            {id:2, context: "formal greeting", input: '{"text": "Hello."}'},
            {id:3, context: "question", input: '{"text": "How are you?"}'}
        ];
	}

	onNextSubmit = () => {
		this.props.updateState(states.docStep4);
		// pass in states.{something}
	};

	/**
	 * Callback function for next submit action.
	 */
	// basically just have the option for the user to do a keyboard shortcut as well as button press.
	handleNextKeyPress = (event) => {
		if (event.key === " " && this.state.sectionComplete) {
			this.onNextSubmit();
		}
	};

	// fileInput = document.getElementById('input');

	initalizeFileArray(fieldNumber) {
		let newArray = [];
		for (let index = 0; index < fieldNumber; index++) {
			let nameString = "Field " + index;
			newArray.push({ id: index, name: nameString });
		}
		this.setState({
			fieldArray: newArray,
		});
		console.log(this.state.fieldArray);
	}

	addParameter = (event) => {
		console.log(Model.parameters);
		this.state.fieldParameters[0] = event.target.value;
	};

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
							<h2>Step 3: Upload Your Contexts </h2>
							<Typography paragraph>A context is a category of prompts for your model</Typography>
							<Typography paragraph></Typography>
                            <Typography paragraph>
								The CSV should follow this format:
							</Typography>
							<ul>
								<li>NO HEADER</li>
								<li>No whitespace</li>
								<li>Comma deliminator</li>
								<li>Surround text with double quotes</li>
							</ul>
                            <DataTable
                                title={"Example (your's wouldn't have the header)"}
                                columns={this.example_context_table_columns}
                                rows={this.example_context_table_rows}
                                height={300}
                                width={"100%"}
                            />
							<Button variant="contained" component="label">
								Upload
								<input
									hidden
									accept=".csv"
									type="file"
									onChange={(event) => {
										this.setState({
											selectedFile: event.target.files[0],
										});

										const data = new FormData();
										data.append("file", event.target.files[0]);

										console.log(data);
										console.log(this.state.selectedFile);
										// axios.post(Model.backendUrl+"/processFile", data, {

										// })
                                        try {
                                            axios({
                                                method: "post",
                                                url: Model.backendUrl + "/processFile",
                                                data: data,
                                                headers: { "Content-Type": "multipart/form-data" },
                                            }).then((res) => {
                                                // then print response status
                                                console.log(res.statusText);

                                                this.setState({
                                                    objectArray: res.data,
                                                });
                                                let fieldNumber = res.data.length; //SET THIS
                                                console.log(fieldNumber);
                                                console.log(res.data);
                                                this.initalizeFileArray(fieldNumber);
                                            });
                                        } catch (err) {
                                            console.error("Error response from post(/NLPDocTool/api/processFile):");
                                            console.error(err.response.data);    // ***
                                            console.error(err.response.status);  // ***
                                            console.error(err.response.headers)
                                        }
									}}
								/>
							</Button>
							{/* Removed the table to select field parameters */}
							{/* <LinkButton to="/NLPDocTool/step4" variant="contained"
                onClick={
                    () => {
                        this.state.fieldParameters[0] = "ContextName";
                        Model.fields = this.state.fieldArray;
                        Model.fieldParameters = this.state.fieldParameters;
                        
                        this.state.objectArray.map((el) => {
                            Model.contextNames.push(el.contextName);
                            Model.csvInputs.push(el.input);
                        }

                        )
                        
                        // Model.contextNames
                        console.log(Model);
                    }
                }
                >
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

				<Footer title="Designed By" description="XXX" />
			</ThemeProvider>
		);
	}
}

export default Step3;
