// todo: have this page display a summary:
// for now lets try one annotation per group
// todo: figure out how to load in the groups, how they're stored.

import React, {Component} from 'react';
import { GridColDef } from '@mui/x-data-grid';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
import { sizing } from '@mui/system';
import Typography from '@mui/material/Typography';
import Container from '@mui/material/Container';
import ButtonGroup from '@mui/material/ButtonGroup';

import states from './../../Constants/States';
// import progress from './../../Constants/States';
import LinearProgress from '@material-ui/core/LinearProgress';
import CallbackKeyEventButton from '../../Custom/CallbackKeyEventButton';
import Loading from '../../Custom/Loading';

import DataTable from './DataTable'

const progress = 100;
const ID_INDEX = 0;
const ANNOTATION_INDEX = 1;
const TEXT_INDEX = 2;

class Results extends Component {
    constructor(props) {
        super(props);
        this.state = {
            isLoading: true,
            // savedFilepath: '',
            isLoadingModelSummary: true,
            isLoadingAllLabels: true,
            sectionComplete: false,
        };
        // since these won't change as the user interacts
        this.allLabels = [];
        this.userCodes = [];
        this.modelSummaryRows = [];
        // table (somewhat) renders now that I used the mui column definition!
        this.modelSummaryColumns = [
            {field: "label", headerName: "Label", width: 200},
            {field: "count", headerName: "Count", width: 200},
            {field: "percent", headerName: "Percent", width: 200}
        ];
        this.labelTableColumns = [
            // mui requires id in lowercase
            { field: "id", headerName: "ID", width: 70 },
            { field: "TEXT", headerName: "Text", width: "600", 
                // renderCell: (params) => (
                // <Typography>
                //     {params.value}
                // </Typography>
                // )
            }, // , whiteSpace: "normal", wordWrap: "break-word"},
            { field: "ANNOTATION", headerName: "Annotation", width: "200", 
                // renderCell: (params) => (
                // <Typography >
                //     {params.value};
                // </Typography>
                // )
            } // , whiteSpace: "normal", wordWrap: "break-word"}
        ];

    }

    getRowID(row) {
        if ("id" in row) {
            return row["id"];
        }

        let resultRowID = "";
        for (let key in Object.keys(row)) {
            resultRowID.concat(key);
            resultRowID.concat(row[key]);
        }
        return resultRowID;
    }

    /**
    * When the component mounts, we prompt the server to start generating our full results, 
    * and we get the csv file which holds our results.
    */
    async componentDidMount () {
        try {
            console.log("========== MOUNTING RESULTS ==========")
            const finalData = await this.props.getDataWithParams('/data/get_final_labels_and_summaries', {"id": this.props.getOptionID()});
            if (!finalData.ok) {
                throw Error(finalData.statusText)
            }
            console.log("Pulled the labels from the backend / database csv");
            console.log(finalData.final_labels);
            
            console.log("Pulled model summary statistics:");
            console.log(finalData.model_summary_rows);
            
            this.modelSummaryRows = finalData.model_summary_rows;
            this.setState({
                isLoadingModelSummary: false
            });

            // still grab the user annotations
            // in case we want to do something with the groups
            const userCodeData = await this.props.getDataWithParams('/data/get_annotations', {"id": this.props.getOptionID()});
            if (!userCodeData.ok) {
                throw Error(userCodeData.statusText);
            }

            // load the codes from the user (they provided in openCoding)
            let userCodesExtracted = [];
            userCodesExtracted = userCodeData.rows.slice();
            console.log("Pulled user codes:")
            console.log(userCodesExtracted);
            

            this.allLabels = finalData.final_labels;
            this.setState({
                isLoadingAllLabels: false
            });

            // pull the groups from assistedGrouping
            let pulledGroups = this.props.getLabels();
            console.log("Pulled groups:");
            console.log(pulledGroups);

            this.setState({
                // savedFilepath: data.saved,
                isLoading: false,
                sectionComplete: true,
            });
            this.userCodes = userCodesExtracted;
            this.groupsAndLabels = pulledGroups;

        } catch (error) {
            console.log(error);
        }
        console.log("====== DONE MOUNTING, SEE LOGS ABOVE ==========")
    }

    /**
    * Callback function for next submission.
    */
    handleNextKeyPress = (event) => {
        if (event.key === ' ' && this.state.sectionComplete){
            this.onNextSubmit();
        } else if (event.key == 'z') {
            this.onPressBackToOpenCoding();
        }
    };

    /**
    * Number of verification rounds.
    */
    // getVerificationNum = () => {
    //     return this.props.getAccuracy().length;
    // }

    /**
    * Average accuracy accross all verification rounds.
    */
    getVerificationAccAvg= () => {
        let summation = 0;
        for (let num of this.props.getAccuracy()){
            summation += num;
        }
        return summation/this.props.getAccuracy().length;
    }

    getSummary = () => {
        if (this.state.isLoadingModelSummary) {
            return (
                <div>
                    Loading Model Summary
                    <Loading/>
                </div>
            );
        }
        // actual summary function
        // console.log("Rendering summary with:");
        // console.log(`Rows:`);
        // for (let row in this.modelSummaryRows) {
        //     console.log(this.modelSummaryRows[row]);
        // }
        // console.log(`Columns: ${this.modelSummaryColumns}`);
        return (
            <DataTable
                rows={this.modelSummaryRows}
                columns={this.modelSummaryColumns}
                getRowId={this.getRowID}
                height={"100%"}
                width={"100%"}
            />
        );
    }

    getFinalLabelsTable = () => {
        if (this.state.isLoadingAllLabels) {
            return (
                <div>
                    Loading rest of the labels
                    <Loading/>
                </div>
            );
        }
        // check Taylor's Step4 ListItem, Button Box as a way to make a table
        // or look at grid component material UI
        return (
            // this.state.userCodes.map((row) => <li>{row[ID_INDEX]} || {row[ANNOTATION_INDEX]} || {row[TEXT_INDEX]} </li>)
            <DataTable
                rows={this.allLabels}
                columns={this.labelTableColumns}
                getRowId={this.getRowID}
                height={"100%"}
                width={"100%"}
            />
        );
    }

    onPressBackToOpenCoding = () => {
        this.props.updateState(states.openCoding);
    }

    /**
    * Next submit action. Updates UI page state.
    */
    onNextSubmit = () => {
        // this.props.updateState(states.introduction);
        // todo: probably prompt them to save their contexts (i.e. prompts and groups) somewhere before they have to get there?
        this.props.updateState(states.codeJustification);
    }

    render() {
        return (
            <Container>
                <Stack
                    justifyContent="center"
                    alignItems="center"
                    spacing={1}
                    // sx={{ paddingTop: 5, paddingRight: 5, paddingLeft: 5 }}
                >
                    <Box style={{ margin: '15px', width: "100%", height: "1vh"}}>
                        <b>
                            Results
                        </b>
                    </Box>
                    <Box sx={{width: "100%", height: "25vh"}}>
                        {this.getSummary()}
                    </Box>
                    <Box sx={{width: "100%", height:"40vh"}}>
                        {this.getFinalLabelsTable()}
                    </Box>

                    {/* <div style={{ display: 'flex', height: '75vh', width: '80vw', justifyContent: 'flex-start', alignItems: 'center', flexDirection: 'column'}}>
                            You have completed this labeling session in {this.getVerificationNum()} verification rounds with an average accuracy of {this.getVerificationAccAvg()}%. Please wait for the server to finish labeling your dataset.
                    </div> */}
                    {/* {this.state.isLoading ? (
                        <div style={{ color: 'red', display: 'flex', height: '75vh', width: '80vw', justifyContent: 'flex-start', alignItems: 'center', flexDirection: 'column'}}>
                            <Loading/>
                        </div>
                    ) : (
                        <div style={{  color: 'green', display: 'flex', height: '75vh', width: '80vw', justifyContent: 'flex-start', alignItems: 'center', flexDirection: 'column'}}>
                            Prediction Complete! Find your results at ./results/{this.state.savedFilepath} 
                        </div>
                    )} */}

                    <Box display="flex" justifyContent="space-between" height="12vh">
                        {/* Allow the user to go back to the beginning of the cycle if they want to do more coding */}
                        <div style={{marginTop: '15px', width:'100%', alignItems:'left'}}>
                            <CallbackKeyEventButton 
                                callBackFunc={this.handleNextKeyPress}
                                buttonAvailable={this.state.sectionComplete}
                                clickFunc={this.onPressBackToOpenCoding}
                                text={'Loop Back (z)'}
                            />
                        </div>

                        <div style={{marginTop: '15px', width:'100%', alignItems:'right'}}>
                            <CallbackKeyEventButton 
                                callBackFunc={this.handleNextKeyPress}
                                buttonAvailable={this.state.sectionComplete}
                                clickFunc={this.onNextSubmit}
                                text={'Finish (space)'}
                            />
                        </div>
                    </Box>
                    <div style={{marginTop: '15px', height: '10vh'}}>
                        <LinearProgress variant="determinate" value={progress}/>
                    </div>
                </Stack>
            </Container>
        );
    }
}

export default Results;