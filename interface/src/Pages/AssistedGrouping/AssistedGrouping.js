import React, {Component} from 'react';
import styled from 'styled-components';

import states from './../../Constants/States';
// import progress from './../../Constants/States';
import Button from '@material-ui/core/Button';
import KeyEventButton from '../../Custom/KeyEventButton';
import NextEventButton from '../../Custom/NextEventButton';
import CreateGroupButton from './CreateGroupButton';
import SearchBar from 'material-ui-search-bar';
import LinearProgress from '@material-ui/core/LinearProgress';

import { ScrollSync, ScrollSyncPane } from 'react-scroll-sync';

import SearchResultTable from './PersistantSearchResultTable';
import SelectionsTable from './SelectionsTable';
import GroupingsTable from './GroupingsTable';

const progress = 40;

class AssistedGrouping extends Component {

    constructor(props) {
        super(props);
        this.state = {
            isLoading: true,
            value: "",
            originalRows: [],
            visibleRowIds: [],
            selectedRowIds: [],
            // searchRows: [],
            selectedRows: [],
            unselectedRows: [],
            groupRows: [],
            groupName: "",
            allSelectedRows: new Set(),
            sectionComplete: false,
            readyToGroup: false,
        };
    }
    
    /**
    * Before the component mounts, we save the annotations from open coding, and ask for them back. 
    * Asking for them back is more of an example, could techically just use locally saved state.
    *
    * We set up the rows of our search bar as all initially unselected. Original rows helps us keep track of completion.
    */
    async componentDidMount () {
        try {
            // save the annotations before we ask for them
            await this.props.postData('/data/save_annotations', {"rows": this.props.loadAnnotations(), "id": this.props.getOptionID()});
            // TODO: annotations not done saving yet
            const data = await this.props.getDataWithParams('/data/get_annotations', {"id": this.props.getOptionID()});
            // show 404 or 500 errors
            if (!data.ok) {
                throw Error(data.statusText);
            }
            console.log("response recieved: " + data.rows);
            // this section of the code optimizes assuming zero-indexing
            let adjusted_rows = [];
            let unselected_rows = [];
            let count = 0;
            for (let row of data.rows){
                adjusted_rows.push({id: count, trueid: row.id, text: row.text, annotation: row.annotation});
                unselected_rows.push({id: count, trueid: row.id, text: row.text, annotation: row.annotation});
                count += 1;
            }

            this.setState({
                originalRows: adjusted_rows,
                unselectedRows: unselected_rows,
                isLoading: false
            });
            console.log("set response");
        } catch (error) {
            console.log(error);
        }
    }

    /**
     * Function for reselecting a given group from the Groups view box.
     * 
     * Considers all elements of said group to no longer count towards completion (not in allSelectedRows)
     * and releases elements to be modified again by user.
     * 
     * @param {int} id identifies row
     */
    reselectGroup = (id) => {

        let selected = [];
        let selectedIds = [];
        let name = "";
        let newSelected = new Set();

        // gather a list of the subrows for all groups but this one
        // add all of their ids to the new set of selected rows
        for (let s = 0; s < this.state.groupRows.length; s++){
            // this is the group we're releasing back
            // it is still considered 'selected' within the search view box
            // but its not a part of the grouped rows (required for section completion)
            if (String(s) === id) {
                name = this.state.groupRows[s].text;
                for (let i = 0; i < this.state.groupRows[s].depth; i++){
                    selected.push(this.state.groupRows[s].subRows[i]);
                    selectedIds.push(this.state.groupRows[s].subRows[i].id);
                }
            } else {
                for (let i = 0; i < this.state.groupRows[s].depth; i++){
                    newSelected.add(this.state.groupRows[s].subRows[i].id);
                }
            }

        }

        this.setState({
            selectedRowIds: selectedIds,
            selectedRows: selected,
            readyToGroup: true,
            groupName: name,
            allSelectedRows: newSelected,
        });
    }

    createGroup = () => {
        // update the comphrensive list of selected rows to include this new group
        let newSelected = this.state.allSelectedRows;

        for (let i = 0; i < this.state.selectedRowIds.length; i++){
            newSelected.add(this.state.selectedRowIds[i]);
        }

        console.log('new selected (create): ', newSelected);

        let completed = newSelected.size === this.state.originalRows.length;

        // if the group name already exists, we need to update rather than create
        // TODO: if select group but edit name, groups name won't be updated properly (will create new group)
        let foundGroup = false;
        for (let groupRow of this.state.groupRows){
            if (groupRow.text === this.state.groupName){
                foundGroup = true;
                groupRow.depth = this.state.selectedRows.length;
                groupRow.subRows = this.state.selectedRows;
                groupRow.expanded = false;
                groupRow.expander =  "";
                break;
            }
        }

        // create a new group if we didn't find one
        if (!foundGroup){
            this.setState({groupRows: this.state.groupRows.concat([
                {id: this.state.groupRows.length, text: this.state.groupName, expander: "", expanded: false, depth: this.state.selectedRows.length, subRows: this.state.selectedRows}
            ])});
        } else {
            // if the updated group has no values, (no selected rows), we need to remove it
            this.setState({groupRows: this.state.groupRows.filter(row => row.depth !== 0)});
        }
        
        
        // after group creation, clear group name input field and update all selected and selected rows and selected row ids
        this.setState({
            selectedRowIds: [],
            selectedRows: [],
            readyToGroup: false,
            allSelectedRows: newSelected,
            groupName: "",
            sectionComplete: completed
        });
}

    deleteGroup = (id) => {
        // take advantage of the fact that group rows are always in order
        let newSelected = new Set();
        let newUnselected = this.state.unselectedRows;

        // gather a list of the subrows for all groups but this one
        // add all of their ids to the new set of selected rows
        for (let s = 0; s < this.state.groupRows.length; s++){

            if (String(s) !== id) {
                for (let i = 0; i < this.state.groupRows[s].depth; i++){
                    newSelected.add(this.state.groupRows[s].subRows[i].id);
                }
            } else {
                for (let i = 0; i < this.state.groupRows[s].depth; i++){
                    newUnselected.push(this.state.groupRows[s].subRows[i]);
                    // newSelected.add(this.state.groupRows[s].subRows[i].id);
                }
            }
        }

        console.log('new selected (delete): ', newSelected);

        let completed = newSelected.size === this.state.originalRows.length;

        let newGroups = this.state.groupRows.slice(0, id).concat(this.state.groupRows.slice(id+1));

        this.setState({
            allSelectedRows: newSelected,
            groupRows: newGroups,
            sectionComplete: completed,
            unselectedRows: newUnselected
        });
    }

    updateGroupName = e => {
        if (e.target.value !== "" && this.state.selectedRows != []){
            this.setState({
                groupName: e.target.value,
                readyToGroup: true
            });
        } else {
            this.setState({
                groupName: e.target.value,
                readyToGroup: false
            });
        }
    }

    onNextSubmit = () => {
        let labeled = [];

        for (let j = 0; j < this.state.groupRows.length; j ++){
            for (let i = 0; i < this.state.groupRows[j].subRows.length; i++){
                // we want the trueid (aka the database mapping)
                labeled.push({id: this.state.groupRows[j].subRows[i].trueid, label: this.state.groupRows[j].text});
            }
        }
        console.log('labeled: ', labeled);
        this.props.saveLabelState(labeled);
        this.props.updateState(states.verification);
    }

    onChange = (newValue) => {
        if (this.value != newValue && !this.state.isLoading){
            this.setState({ value: newValue });
        }
    }

    onSearch = () => {
        // in here we will call the backend with our state.value
        // and update the rows of the checkbox table
        // temporary search algorithm -> direct matching
        console.log('requesting search with: ' + this.state.value);
        if (this.state.value !== "" && !this.state.isLoading) {
            // update the visible ids
            console.log('original rows: ' + this.state.originalRows);
            let newRows = this.state.originalRows.filter(row => row.annotation.toLowerCase().includes(this.state.value.toLowerCase()));
            console.log('newRows: ' + newRows);
            for (let r of newRows){
                console.log('r: ' + r.id);

            }
            this.setState({visibleRowIds: newRows.map(row => row.id)});
        }
    }

    selectIndex = (index) => {
        // update the ids
        let ids = this.state.selectedRowIds;
        ids.push(index);
        
        // update the visible rows
        let rowids = this.state.originalRows.map(row => row.id);
        let sliceIndex = rowids.indexOf(index);
        let newitems = this.state.originalRows.slice(sliceIndex, sliceIndex+1);

        let rows = this.state.selectedRows.concat(newitems);

        let unselected = this.state.unselectedRows.filter(row => row.id != index);
 
        this.setState({selectedRowIds: ids, selectedRows: rows, unselectedRows: unselected});
    }

    unselectIndex = (index) => {
        let rowids = this.state.originalRows.map(row => row.id);
        let sliceIndex = rowids.indexOf(index);

        let newitems = this.state.originalRows.slice(sliceIndex, sliceIndex+1);
        let rows = this.state.unselectedRows.concat(newitems);

        this.setState({
            selectedRowIds: this.state.selectedRowIds.filter(elem => elem !== index), 
            selectedRows: this.state.selectedRows.filter(row => row.id !== index),
            unselectedRows: rows
        });

    }

    isSelected = (index) => {
        // we can't remove selection if it's in a group
        return this.state.allSelectedRows.has(index) || this.state.selectedRowIds.includes(index);
    }

    isVisible = (index) => {
        return this.state.visibleRowIds.includes(index);
    }

    handleNextKeyPress = (event) => {
        if (event.key === ' ' && this.state.sectionComplete){
            this.onNextSubmit();
        }
    };

    handleCreateGroupKeyPress = (event) => {
        if (event.key === 'Enter' && this.state.readyToGroup){
            this.createGroup();
        }
    };
    
    render() {

        return (
        <div style={{display: 'flex', flexDirection: 'column', height: '100%', width: '100%' }}>
            <div style={{ margin: '15px'}}>
                Assisted Grouping
            </div>
            <div style={{ margin: '15px'}}>
                <div style={{ display: 'flex', height: '75vh'}}>
                        
                    <div style={{ flexGrow: 1, margin: '15px'}}>
                        <div style={{marginLeft: '10px', height: '2vh'}} >
                            Groups
                        </div>
                        <ScrollSync>
                            <div style={{ display: 'flex', position: 'relative', height: '38vh'}}>
                                <ScrollSyncPane>
                                    <div style={{ overflow: 'auto', marginTop: '5px', padding: '5px', height: "38vh", width: "25vw", border: '2px solid black', borderRadius: '10px' }}>
                                        <GroupingsTable
                                            style={{width: "25vw"}}
                                            data={this.state.groupRows}
                                            columns={[
                                                {
                                                    id: 'expander', // Make sure it has an ID
                                                    Header: ({ getToggleAllRowsExpandedProps, isAllRowsExpanded }) => (
                                                    <span {...getToggleAllRowsExpandedProps()}>
                                                        {isAllRowsExpanded ? '*' : '-'}
                                                    </span>
                                                    ), 
                                                    Cell: ({ row }) => (
                                                        <span
                                                            {...row.getToggleRowExpandedProps({
                                                                style: {
                                                                // We can even use the row.depth property
                                                                // and paddingLeft to indicate the depth
                                                                // of the row
                                                                paddingLeft: `${row.depth/2}rem`,
                                                                },
                                                            })}
                                                            >  
                                                            {row.isExpanded ? '*' : '-'}
                                                        </span>
                                                    )
                                                },
                                                {   
                                                    Header: 'Group',
                                                    accessor: 'text',
                                                    Cell: ({ row }) => (
                                                        <span>
                                                            <div onClick={() => {
                                                                    console.log(row);
                                                                    this.reselectGroup(row.id);
                                                                }}>
                                                                {row.original.text}
                                                            </div>
                                                        </span> 
                                                    )
                                                },
                                                {
                                                    Header: 'Delete',
                                                    accessor: 'delete',
                                                    Cell: ({ row }) => (
                                                        (row.isExpanded) ? 
                                                        null 
                                                        :
                                                        (
                                                        <span>
                                                            <div onClick={() => {this.deleteGroup(row.id)}}>
                                                                x
                                                            </div>
                                                        </span>
                                                        )
                                                    )
                                                }
                                            
                                            ]}
                                        />
                                    </div>  
                                </ScrollSyncPane>
                            </div>
                        </ScrollSync>
                    </div>
                    <div style={{ flexGrow: 1, margin: '15px'}}>
                        <div style={{marginLeft: '10px', height: '2vh'}} >
                            Search Annotations
                        </div>
                        <div style = {{marginTop: '5px', padding: '5px', border: '2px solid black', borderRadius: '10px', height: "30vh", width: '60vw'}}>
                            <SearchBar
                                style={{width: "60vw", height:'5vh'}}
                                value={this.state.value}
                                onChange={this.onChange}
                                onRequestSearch={this.onSearch}
                            />
                            {
                                (this.state.isLoading) ?
                                (
                                    <div>
                                        Loading ...
                                    </div>
                                ) : (
                                <ScrollSync>
                                    <div style={{ display: 'flex', position: 'relative', height: '25vh', width: "60vw"}}>
                                        <ScrollSyncPane>
                                            <div style={{overflow: 'auto'}}>
                                                <SearchResultTable
                                                    data={this.state.originalRows}
                                                    columns={[
                                                        {   
                                                            Header: 'Annotation',
                                                            accessor: 'annotation'
                                                        },
                                                        { 
                                                            Header: 'Text',
                                                            accessor: 'text',
                                                        }
                                                        
                                                    ]}
                                                    selectIndex={this.selectIndex}
                                                    unselectIndex={this.unselectIndex}
                                                    isSelected={this.isSelected}
                                                    isVisible={this.isVisible}
                                                />
                                            </div>
                                        </ScrollSyncPane>
                                    </div>
                                </ScrollSync>)
                            }
                            <div style={{ marginTop: '15px', marginLeft: '10px', height: '2vh'}} >
                                Selected Annotations
                            </div>
                            <ScrollSync>
                                <div style={{ marginTop: '5px', display: 'flex', position: 'relative', height: '15vh'}}>
                                    <ScrollSyncPane>
                                        <div style={{overflow: 'auto', height: '15vh', width: '60vw', border: '2px solid black', borderRadius: '10px'}}>
                                            <SelectionsTable
                                                    style={{width: "60vw"}}
                                                    data={this.state.selectedRows}
                                                    columns={[
                                                        {
                                                            accessor: 'annotation'
                                                        }
                                                        
                                                    ]}
                                                />
                                        </div>
                                    </ScrollSyncPane>
                                </div>
                            </ScrollSync>
                            <div style={{marginTop: '15px', marginLeft: '10px', height: '2vh'}} >
                            Unselected Annotations
                            </div>
                            <ScrollSync>
                                <div style={{ marginTop: '5px', display: 'flex', position: 'relative', height: '15vh'}}>
                                    <ScrollSyncPane>
                                        <div style={{overflow: 'auto', height: '15vh', width: '60vw', border: '2px solid black', borderRadius: '10px'}}>
                                            <SelectionsTable
                                                    style={{width: "60vw"}}
                                                    data={this.state.unselectedRows}
                                                    columns={[
                                                        {
                                                            accessor: 'annotation'
                                                        }
                                                        
                                                    ]}
                                                />
                                        </div>
                                    </ScrollSyncPane>
                                </div>
                            </ScrollSync>
                            <div style={{ marginTop: '15px', display: 'flex', justifyContent: 'space-between', height: '3vh', width: '100%' }}>
                                <input
                                    placeholder="enter group name"
                                    value={this.state.groupName}
                                    onChange={this.updateGroupName}/>
                                <CreateGroupButton 
                                    callBackFunc={this.handleCreateGroupKeyPress}
                                    buttonAvailable={this.state.readyToGroup}
                                    clickFunc={this.createGroup}
                                    text={'Create or Update Group (Enter)'}
                                    keyMatch={'Enter'}
                                />
                            </div>
                        </div>
                    </div>
                        
                </div>
            </div>
            <div style={{marginTop: '15px', width:'100%'}}>
                <NextEventButton 
                    callBackFunc={this.handleNextKeyPress}
                    buttonAvailable={this.state.sectionComplete}
                    clickFunc={this.onNextSubmit}
                    text={'Next (space)'}
                    keyMatch={' '}
                />
            </div>
            <div style={{marginTop: '15px'}}>
                <LinearProgress variant="determinate" value={progress}/>
            </div>
        </div>);
    }
}

export default AssistedGrouping;