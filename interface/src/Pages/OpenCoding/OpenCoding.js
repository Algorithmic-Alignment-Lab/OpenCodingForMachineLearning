import { Component } from 'react';

import states from '../../Constants/States';
// import progress from './../../Constants/States';
import CallbackKeyEventButton from '../../Custom/CallbackKeyEventButton';
import LinearProgress from '@material-ui/core/LinearProgress';

import CustomAnnotationTable from './CustomAnnotationTable';
import Loading from '../../Custom/Loading';

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
        }
    }

    /**
    * When the component mounts, we gather n randomly selected annotations based on our data option id.
    *
    * This lets us populate our dual-column annotation structure.
    */
    async componentDidMount () {
        try {
            const data = await this.props.getDataWithParams('/data/get_data_option', {"id": this.props.getOptionID(), "constants": this.props.getConstants()});
            
            if (!data.ok) {
                throw Error(data.statusText);
            }

            this.setState({
                rows: data.rows,
                rowsLoaded: true
            });

            this.props.setDataRows(data.rows); // cache result
            
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
        } else if (event.key == 'a') { // add a key shortcut for skipping
            this.onSkipToNLPDocTool(); // got tired of seeing the results page boot
        }
    };

    onSkipToResults = () => {
        this.props.updateState(states.results);
    }

    onSkipToNLPDocTool = () => {
        this.props.updateState(states.docStep1);
    }

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

    render() {
        return (
            <div id = 'open_coding_page' style={{ display: 'flex', flexDirection: 'column', height: '100%', width: '100%' }}>
                <div style={{ margin: '15px'}}>
                    <b>
                        Open Coding
                    </b>
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
                    <div style={{display: 'flex', alignItems:'space-between', xs:6}}>
                        <CallbackKeyEventButton
                            callBackFunc={this.handleNextKeyPress}
                            buttonAvailable={this.state.sectionComplete}
                            clickFunc={this.onNextSubmit}
                            text={'Next (space)'}
                        />
                    </div> 
                    <div style={{alignItems:'end', backgroundColor: 'pink', xs:6}}>
                        <CallbackKeyEventButton
                            buttonAvailable={true}
                            callBackFunc={this.handleNextKeyPress}
                            // clickFunc={this.onSkipToResults}
                            clickFunc={this.onSkipToNLPDocTool}
                            text={'Skip to NLPDocTool [a]'}
                            keyMatch={' '}
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