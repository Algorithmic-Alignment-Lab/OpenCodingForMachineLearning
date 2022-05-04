import React, {Component} from 'react';
import { ScrollSync, ScrollSyncPane } from 'react-scroll-sync';

import states from '../../Constants/States';
// import progress from './../../Constants/States';
import Button from '@material-ui/core/Button';
import KeyEventButton from '../../Custom/KeyEventButton';
import CallbackKeyEventButton from '../../Custom/CallbackKeyEventButton';
import LinearProgress from '@material-ui/core/LinearProgress';

import CustomAnnotationTable from './CustomAnnotationTable';

import "./open-coding.css";
import styled from 'styled-components'
import NextEventButton from '../../Custom/NextEventButton';

const progress = 20;


// tabbing + enter for sumit combo works, potential for bug where user finishes
// and then deletes one but still hits next. Perhaps run a final check before moving forward
// with next
class OpenCoding extends Component {

    constructor(props) {
        super(props);
        this.state = {
            rows: [],
            // helps deal with tabbing behavior, map of row index to in Progress states
            // when Enter is hit or the "Done annotating" button is prompted 
            // these values will be set to rows
            inProgress: new Map(),
            sectionComplete: false,
            editedRows: new Set(),
            nextPossible: false,
        }
    }

    async componentDidMount () {
        try {
            const data = await this.props.getDataWithParams('/data/get_data_option', {"id": this.props.getOptionID()});
            // show 404 or 500 errors
            if (!data.ok) {
                throw Error(data.statusText);
            }

            console.log("response recieved");
            this.setState({
                rows: data.rows
            });

            this.props.setDataRows(data.rows); // cache result
            console.log("set response");
        } catch (error) {
            console.log(error);
        }
    }

    handleNextKeyPress = (event) => {
        // console.log(`next possible: %s, section complete %s`, this.state.nextPossible, this.state.sectionComplete);
        if (event.key === ' ' && this.state.sectionComplete){
            this.onNextSubmit();
        }
    };

    toggleSubmit = (inProgressRows) => {
        // inProgressRows is assumed to never have empty string values
        let data = [...this.state.rows];
        // let editedRows = [...this.state.editedRows];
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
        // empty strings
        this.setState({
            rows: data,
            editedRows: this.state.editedRows,
            sectionComplete: isComplete,
            nextPossible: true,
        });
    }

    onNextSubmit = () => {
        // submit data to backend
        this.props.saveAnnotationState(this.state.rows);
        this.props.updateState(states.assistedGrouping);
    }

    render() {
        return (
            <div style={{ display: 'flex', flexDirection: 'column', height: '100%', width: '100%' }}>
                <div style={{ margin: '15px'}}>
                    Open Coding
                </div>
                <div style={{ display: 'flex', height: '75vh', width: '100vw', justifyContent: 'flex-start', alignItems: 'center', flexDirection: 'column'}}>
                    <ScrollSync>
                        <div style={{ overflow: 'auto', marginTop: '5px', padding: '5px', height: "70vh", width: "75vw", border: '2px solid black', borderRadius: '10px' }}>
                            <ScrollSyncPane>
                                {/* TODO: this.state.rows nor updating quickly enought */}
                                <CustomAnnotationTable columns={[
                                    {
                                        accessor: 'annotation'
                                    }, 
                                    {
                                        accessor: 'text'
                                    }, 
                                ]} data={this.state.rows} toggleSubmit={this.toggleSubmit}/>
                            </ScrollSyncPane>
                        </div>
                    </ScrollSync>
                </div>
                <div style={{marginTop: '15px', width:'100%'}}>
                    <div style={{display: 'flex', alignItems:'space-between'}}>
                        <NextEventButton 
                            callBackFunc={this.handleNextKeyPress}
                            buttonAvailable={this.state.sectionComplete}
                            clickFunc={this.onNextSubmit}
                            text={'Next (space)'}
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