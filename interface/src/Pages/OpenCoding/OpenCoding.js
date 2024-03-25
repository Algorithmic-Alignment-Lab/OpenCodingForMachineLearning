import React, {Component} from 'react';

import { Dialog, DialogContent, DialogTitle } from '@material-ui/core';
import states from '../../Constants/States';
// import progress from './../../Constants/States';
import CallbackKeyEventButton from '../../Custom/CallbackKeyEventButton';
import LinearProgress from '@material-ui/core/LinearProgress';

import CustomAnnotationTable from './CustomAnnotationTable';
import Loading from '../../Custom/Loading';

import OCInstructions from "../instructions/OpenCoding.jpg"

const imgStyle = {
    maxWidth: '100%',
    height: 'auto', // To maintain the aspect ratio
};



const progress = 25;

class OpenCoding extends Component {

    constructor(props) {
        super(props);
        this.state = {
            rows: [],
            rowsLoaded: false,
            // helps deal with tabbing behavior, map of row index to in Progress state
            // when Enter is hit or the "Done annotating" button is prompted 
            // these values will be set to rows
            inProgress: new Map(),
            sectionComplete: false,
            editedRows: new Set(),
            nextPossible: false,
            open: false,
        }
    }

    /**
    * When the component mounts, we gather n randomly selected annotations based on our data option id.
    *
    * This lets us populate our dual-column annotation structure.
    */
    async componentDidMount () {
        try {
            const data = await this.props.getDataWithParams('/data/get_data_option', {"id": this.props.getOptionID(), "constants": this.props.getConstants(), "username": this.props.getUsername()});
            
            if (!data.ok) {
                throw Error(data.statusText);
            }

            const sortedRows = data.rows.sort((a, b) => a.id - b.id);

            this.setState({
                rows: sortedRows,
                rowsLoaded: true
            });

            this.props.setDataRows(sortedRows); // cache result
            
        } catch (error) {
            console.log(error);
        }
    }

    /**
    * Callback function for next key press
    */
    handleNextKeyPress = (event) => {
        // console.log(`next possible: %s, section complete %s`, this.state.nextPossible, this.state.sectionComplete);
        if (event.key === ' ' && this.state.sectionComplete){
            this.onNextSubmit();
        }
    };

    /**
    * Callback function for our customized table object.
    * 
    * The table object conservatively calls this function to update the editedRows state.
    * Given the expensive nature of updating editedRows, this function should be called
    * as few times as possible.
    */
    toggleSubmit = (inProgressRows) => {
        
        let data = [...this.state.rows];
        
        // delete rows that we were holding that now have empty strings;
        // add new rows with new annotation values
        for (let [index, value] of inProgressRows) {
            if (value === "" &&  this.state.editedRows.has(index)) {
                this.state.editedRows.delete(index);
            } else {
                this.state.editedRows.add(index);
            }
            data[index].annotation = value;
        }

        let isComplete =  this.state.editedRows.size === this.state.rows.length;

        // keep track of set of completed ids; once 
        // the size is big enough, we're good to continue
        this.setState({
            rows: data,
            editedRows: this.state.editedRows,
            sectionComplete: isComplete,
            nextPossible: true,
        });
    }

    /**
    * Next button submit action.
    * 
    * We store the annotations, and we update the UI page state. 
    * We also check for user-state consistency regarding the annotations before storing.
    */
    onNextSubmit = () => {
        // NOTE: if a user edits but does not press 'enter' again before 
        // submitting, the map will not update, and thus there may be a disconnect between
        // what the user has typed and what is given to the server. Thus, there may
        // be a future need to ensure consistency.
        this.props.saveAnnotationState(this.state.rows);
        this.props.updateState(states.assistedGrouping);
    }

    handleOpen = () => {
        this.setState({ open: true });
    };

    handleClose = () => {
        this.setState({ open: false });
    };

    render() {
        return (
            <div id = 'open_coding_page' style={{ display: 'flex', flexDirection: 'column', height: '100%', width: '100%' }}>
                <div style={{ margin: '15px'}}>
                    <b>
                        Open Coding
                    </b>
                </div>
                <div style={{ margin: '15px'}}>
                    <b>
                        What is an Annotation?
                    </b>
                    <br></br>
                    Data annotation is the process of labeling data with tags that provide additional information about the data. These annotations describe the content or context of the data. You will be asked to generate labels for your prompts and the model’s responses. 
                    <br></br>
                    <br></br>
                    <b>Your Task</b>
                    <br></br>
                    You will begin by annotating a baseline set of prompts and responses provided by the organizers, followed by your interactions with the assistant.
                    <br></br>
                    - Please type your annotations in the fields on the left. 
                    <br></br>
                    - You can assign more than one label to an instance. Note that multiple annotations are separated by a ";" e.g. "Label1; Label2; Label3"
                    <br></br>
                    - Please label your inputs to the LLM as ‘prompt’.
                </div>
                <div style={{ margin: '15px'}}>
                    <img src={OCInstructions} alt="Open Coding Example" style={imgStyle}></img>
                    <br></br><br></br>
                </div>
                <div style={{ display: 'flex', padding: '5px', height: '75vh', width: '100vw', justifyContent: 'flex-start', alignItems: 'center', flexDirection: 'column'}}>
                        <div style={{ overflow: 'scroll', marginTop: '5px', height: "70vh", width: "80vw", border: '2px solid black', borderRadius: '10px' }}>
                            <div style={{ padding: '15px'}}>
                                {
                                    (this.state.rowsLoaded) ?
                                        <CustomAnnotationTable columns={[
                                            {
                                                accessor: 'annotation'
                                            }, 
                                            {
                                                accessor: 'text'
                                            }, 
                                        ]} data={this.state.rows} toggleSubmit={this.toggleSubmit}/>
                                        : <Loading/>
                                }
                            </div>
                        </div>
                </div>
                <div style={{marginTop: '15px', width:'100%'}}>
                    <div style={{display: 'flex', alignItems:'space-between'}}>
                        <CallbackKeyEventButton
                            callBackFunc={this.handleNextKeyPress}
                            buttonAvailable={this.state.sectionComplete}
                            clickFunc={this.onNextSubmit}
                            text={'Next (space)'}
                        />
                    </div> 
                </div>
                <div style={{ marginTop: '15px'}}>
                    <LinearProgress variant="determinate" value={progress}/>
                </div>
            </div>
            );
    }
}

export default OpenCoding;