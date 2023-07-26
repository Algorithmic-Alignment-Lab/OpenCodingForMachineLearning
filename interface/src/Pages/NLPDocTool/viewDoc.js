import { Component } from "react";
import CssBaseline from "@mui/material/CssBaseline";
import Container from "@mui/material/Container";
import { ThemeProvider } from "@mui/material/styles";
import Header from "./blog/Header.js";

import Footer from "./blog/Footer.js";
import Stack from "@mui/material/Stack";
import theme from "./blog/theme.js";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import Model from "./Model.js";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import Paper from "@mui/material/Paper";

class ViewDoc extends Component {
	constructor(props) {
		super(props);

		this.state = {
			anchorEl: null,
			open: false,
			id: undefined,
			selectedContext: 0,
			avgSimScore:
				Model.metricOne.length <= 0
					? 0
					: Model.metricOne.reduce((a, b) => a + b) / Model.metricOne.length,
			avgSuffSim:
				Model.metricOne.length <= 0
					? 0
					: (Model.metricTwo.reduce((a, b) => a + b) / Model.metricTwo.length) *
					  100.0,
			ModelInfo: Model,
		};
	}

	createData(
		contextName,
		csvInput,
		humanResponse,
		prediction,
		metricOne,
		metricTwo,
		humanResponseRationale,
		resultJustification
	) {
		var metricTwoText = "YES";
		if (metricTwo == 0) {
			metricTwoText = "NO";
		}
		return {
			contextName,
			csvInput,
			humanResponse,
			prediction,
			metricOne,
			metricTwoText,
			humanResponseRationale,
			resultJustification,
		};
	}

	createRows() {
		var array = [];
		for (var i = 0; i < this.state.ModelInfo.contextNames.length; i++) {
			array.push(
				this.createData(
					this.state.ModelInfo.contextNames[i],
					this.state.ModelInfo.csvInputs[i],
					this.state.ModelInfo.humanResponses[i],
					this.state.ModelInfo.predictions[i],
					this.state.ModelInfo.metricOne[i],
					this.state.ModelInfo.metricTwo[i],
					this.state.ModelInfo.humanResponseRationale[i],
					this.state.ModelInfo.resultJustification[i]
				)
			);
		}

		return array;
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
							spacing={4}
							sx={{ paddingTop: 10, paddingRight: 5, paddingLeft: 5 }}
						>
							<h2>Your Customized Documentation</h2>
							<Typography variant="h6">Summary</Typography>
							<Box
								sx={{
									width: "100%",
									maxWidth: 900,
									bgcolor: "background.paper",
								}}
							>
								<Typography variant="h6">
									{" "}
									You have entered {
										this.state.ModelInfo.contextNames.length
									}{" "}
									contexts
								</Typography>
								<TableContainer component={Paper}>
									<Table
										sx={{ minWidth: 650 }}
										aria-label="simple summary table"
									>
										<TableHead>
											<TableRow>
												<TableCell>Average Values </TableCell>
												<TableCell align="center">
													Similarity Score [0-1]
												</TableCell>
												<TableCell align="center">
													% With Sufficent Similarity
												</TableCell>
											</TableRow>
										</TableHead>
										<TableBody>
											<TableRow key={"averages"}>
												<TableCell component="th" scope="row"></TableCell>
												<TableCell align="center">
													{this.state.avgSimScore}
												</TableCell>
												<TableCell align="center">
													{this.state.avgSuffSim}
												</TableCell>
											</TableRow>
										</TableBody>
									</Table>
								</TableContainer>
							</Box>
							<Typography variant="h6">
								You justified your contexts by:
							</Typography>
							<Typography paragraph>
								{this.state.ModelInfo.contextJustification}
							</Typography>
							<Typography variant="h6">Process Justification</Typography>
							<Typography paragraph>
								{this.state.ModelInfo.processJustification}
							</Typography>
							<Typography variant="h6">Deployment Justification</Typography>
							<Typography paragraph>
								{this.state.ModelInfo.deploymentJustification}
							</Typography>

							<Typography variant="h6">Full Results</Typography>
							<Typography variant="h6">
								{" "}
								You have entered {this.state.ModelInfo.contextNames.length}{" "}
								contexts
							</Typography>
							<Typography variant="h6">
								You justified your contexts by:
							</Typography>
							<Typography paragraph>
								{this.state.ModelInfo.contextJustification}
							</Typography>
							<Box
								sx={{
									width: "100%",
									maxWidth: 900,
									bgcolor: "background.paper",
								}}
							>
								{this.createRows().map((row) => (
									<Stack
										ustifyContent="center"
										alignItems="center"
										spacing={2}
										sx={{ paddingBottom: 5, paddingRight: 5, paddingLeft: 5 }}
									>
										<Typography variant="h6">
											{" "}
											Within {row.contextName} you predicted the following:{" "}
										</Typography>
										<TableContainer component={Paper}>
											<Table sx={{ minWidth: 650 }} aria-label="simple table">
												<TableHead>
													<TableRow>
														<TableCell>Context Details</TableCell>
														<TableCell>What YOU Predicted</TableCell>
														<TableCell>What the MODEL Predicted </TableCell>
														<TableCell align="center">
															Similarity Score [0-1]
														</TableCell>
														<TableCell align="center">
															Sufficently Similar?
														</TableCell>
													</TableRow>
												</TableHead>
												<TableBody>
													<TableRow key={row.contextName}>
														<TableCell align="center">{row.csvInput}</TableCell>
														<TableCell align="center">
															{row.humanResponse}
														</TableCell>
														<TableCell align="center">
															{row.prediction}
														</TableCell>
														<TableCell align="center">
															{row.metricOne}
														</TableCell>
														<TableCell align="center">
															{row.metricTwoText}
														</TableCell>
													</TableRow>
												</TableBody>
											</Table>
										</TableContainer>

										<Typography variant="h6">
											You justifed your human response by:
										</Typography>
										<Typography paragraph>
											{row.humanResponseRationale}
										</Typography>
										<Typography variant="h6">
											You justifed the similarity of the model and human
											response by:
										</Typography>
										<Typography paragraph>{row.resultJustification}</Typography>
									</Stack>
								))}
							</Box>
							<Typography variant="h6">Process Justification</Typography>
							<Typography paragraph>
								{this.state.ModelInfo.processJustification}
							</Typography>
							<Typography variant="h6">Deployment Justification</Typography>
							<Typography paragraph>
								{this.state.ModelInfo.deploymentJustification}
							</Typography>

							<Typography variant="h5">
								To save this documentation please save the webpage as a PDF.
							</Typography>
						</Stack>
					</main>
				</Container>

				<Footer
					title="Designed By"
					description="The Algorithmic Alignment Group"
				/>
			</ThemeProvider>
		);
	}
}

export default ViewDoc;
