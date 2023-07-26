import { Component } from 'react';

import states from './../../Constants/States';
// import progress from './../../Constants/States';
import CallbackKeyEventButton  from '../../Custom/CallbackKeyEventButton';
import SearchBar from 'material-ui-search-bar';
import LinearProgress from '@material-ui/core/LinearProgress';

import SearchResultTable from './PersistantSearchResultTable';
import SelectionsTable from './SelectionsTable';
import GroupingsTable from './GroupingsTable';
import { InputStyle } from '../../Constants/Styles';
import Loading from '../../Custom/Loading';

const progress = 50;

class AssistedGrouping extends Component {

    constructor(props) {
        super(props);
        this.state = {
            isLoading: true,
            value: "",
            originalRows: [], // all rows
            visibleRowIds: [], // ids of visible rows based on search criterion
            selectedRowIds: [], // ids of annotations currently ready to be grouped
            selectedRows: [], // annotations ready to be grouped or already grouped
            unselectedRows: [], // annotations not yet grouped or not yet ready to be grouped
            groupRows: [], // all groups
            groupName: "",
            allGroupedRows: new Set(), // annotations that have been formally grouped
            sectionComplete: false,
            readyToGroup: false,
            readyToNameGroup: false,
            selectAllOn: false,
            selectAllActive: true,
        };
    }
    
    /**
    * When the component mounts, we save the annotations from open coding, and ask for them back. 
    * Asking for them back is more of an example, could techically just use locally saved state.
    *
    * We set up the rows of our search bar as all initially unselected. Original rows helps us keep track of completion.
    */
    async componentDidMount () {
        try {
            // save the annotations before we ask for them
            await this.props.postData('/data/save_annotations', {"rows": this.props.loadAnnotations(), "id": this.props.getOptionID()});
            const data = await this.props.getDataWithParams('/data/get_annotations', {"id": this.props.getOptionID()});
            
            if (!data.ok) {
                throw Error(data.statusText);
            }

            // this section of the code optimizes assuming zero-indexing
            let adjusted_rows = [];
            let unselected_rows = [];
            let visible_rows = []; // all rows are default visible during search
            let count = 0;
            for (let row of data.rows){
                adjusted_rows.push({id: count, trueid: row.id, text: row.text, annotation: row.annotation});
                unselected_rows.push({id: count, trueid: row.id, text: row.text, annotation: row.annotation});
                visible_rows.push(count);
                count += 1;
            }

            this.setState({
                originalRows: adjusted_rows,
                unselectedRows: unselected_rows,
                visibleRowIds: visible_rows,
                isLoading: false
            });
        } catch (error) {
            console.log(error);
        }
    }

    /**
     * Function for reselecting a given group from the Groups view box.
     * 
     * Considers all elements of said group to no longer count towards completion (not in allGroupedRows)
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

        let completed = newSelected.size === this.state.originalRows.length;

        this.setState({
            selectedRowIds: selectedIds,
            selectedRows: selected,
            readyToGroup: true,
            groupName: name,
            allGroupedRows: newSelected,
            sectionComplete: completed,
            readyToNameGroup: selected.length > 0
        });
    }

    /**
     * Function for creating or updating a group using the current selected annotations
     * 
     * Considers all elements within this.state.selectedRows to be a part of this new group, and
     * adds all elements to the running set of all grouped annotations.
     * 
     */
    createOrUpdateGroup = () => {
        // update the comphrensive list of selected rows to include this new group
        let newSelected = this.state.allGroupedRows;

        for (let i = 0; i < this.state.selectedRowIds.length; i++){
            newSelected.add(this.state.selectedRowIds[i]);
        }

        let completed = newSelected.size === this.state.originalRows.length;

        // if the group name already exists, we need to update rather than create
        let foundGroup = false;
        let newGroupRows = this.state.groupRows;

        for (let groupRow of newGroupRows){

            if (groupRow.text === this.state.groupName){
                // if the groups subrows have been released (group name was reselected),
                // these ids will already be a part of selectedRows and selectedRowIds. If
                // the group name was typed in, then the group subrows are not a part of 
                // selectedRows and selectedRowIds, and the new subRows will need to include
                // the relevant information.

                // we can add the groupSubRows iff their id is not present in selectedRows
                const selectedIdsSet = new Set(this.state.selectedRowIds);
                const relevantSubRows = this.state.selectedRows.concat(groupRow.subRows.filter(row => !selectedIdsSet.has(row.id)));

                foundGroup = true;
                groupRow.depth = relevantSubRows.length;
                groupRow.subRows = relevantSubRows;
                groupRow.expanded = false;
                groupRow.expander =  "";
                break;
            }
        }
        
        // create a new group if we didn't find one
        if (!foundGroup){
            newGroupRows = newGroupRows.concat([
                {id: this.state.groupRows.length, text: this.state.groupName, expander: "", expanded: false, depth: this.state.selectedRows.length, subRows: this.state.selectedRows}
            ]);
        } else {
            // if the updated group has no values, (no selected rows), we need to remove it
            newGroupRows = newGroupRows.filter(row => row.depth !== 0);
        }
        
        
        // after group creation, clear group name input field and update all selected and selected rows and selected row ids
        this.setState({
            selectedRowIds: [],
            selectedRows: [],
            readyToGroup: false,
            allGroupedRows: newSelected,
            groupName: "",
            sectionComplete: completed,
            readyToNameGroup: false,
            groupRows: newGroupRows,
            selectAllActive: this.selectAllCanChange(null, newSelected),
            selectAllOn: this.selectAllPersistance(null, newSelected)
        });
    }


    /**
     * Function for deleting a group.
     * 
     * Removes the group from groupRows and from allGroupedRows, and repopulates unselectedRows.
     * 
     * @param {int} id the group to delete
     */
    deleteGroup = (id) => {
        // take advantage of the fact that group rows are always in order
        let newSelected = new Set();
        let newUnselected = this.state.unselectedRows;

        // gather a list of the subrows for all groups and add all of their ids 
        // to the new set of selected rows unless the id matches this group -
        // if the id matches this group, it is a part of unselected rows
        for (let s = 0; s < this.state.groupRows.length; s++){

            if (String(s) !== id) {
                for (let i = 0; i < this.state.groupRows[s].depth; i++){
                    newSelected.add(this.state.groupRows[s].subRows[i].id);
                }
            } else {
                for (let i = 0; i < this.state.groupRows[s].depth; i++){
                    newUnselected.push(this.state.groupRows[s].subRows[i]);
                }
            }
        }

        // NOTE: are we done? probably not, but will keep this check for
        // when we support multiple labels per text item
        let completed = newSelected.size === this.state.originalRows.length;

        let newGroups = this.state.groupRows.slice(0, id).concat(this.state.groupRows.slice(id+1));

        this.setState({
            allGroupedRows: newSelected,
            groupRows: newGroups,
            sectionComplete: completed,
            unselectedRows: newUnselected,
            selectAllActive: this.selectAllCanChange(null, newSelected)
        });
    }

    /**
     * Function for updating a future group's name.
     */
    updateGroupName = e => {
        if (e.target.value !== "" && this.state.readyToNameGroup){
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



    async saveLabels(labeled) {
        let response = await this.props.postData('/data/save_groups', {"rows": labeled, "id": this.props.getOptionID()});
        if (!response.ok) {
            console.log(response.msg);
        }
    }
    /**
     * Function for pressing "Next" button.
     * 
     * Saves the labels created and updates the UI state.
     */
    onNextSubmit = () => {
        let labeled = []; // todo: maybe getLabelState so groups add on to one another

        // these logs are for me to have investigated the structure of the groupRows
        // so i can save whatever i desire from there
        // console.log("In AssistedGrouping.onNextSubmit");
        // console.log("Group rows: ");
        // console.log(this.state.groupRows);
        for (let j = 0; j < this.state.groupRows.length; j ++){
            for (let i = 0; i < this.state.groupRows[j].subRows.length; i++){
                // save the corresponding texts and codes the user provided 
                // so we can just display all this info at once if they want it.
                labeled.push({
                    // we want the trueid (aka the database mapping)
                    id: this.state.groupRows[j].subRows[i].trueid, 
                    text: this.state.groupRows[j].subRows[i].text, 
                    annotation: this.state.groupRows[j].subRows[i].annotation,
                    // note to self:
                    // true_label is the group because thats the focused code (rather than the general thoughts from OC)
                    true_label: this.state.groupRows[j].text, predicted_label: null
                });
            }
        }
        this.props.saveLabelState(labeled); // <- just a backup now if we cannot get post working
        
        this.saveLabels(labeled);
        
        console.log("Exiting AssistedGrouping.onNextSubmit");
        // attempting to go to what used to be verification but is now just stripped down as a loading page for generating the rest of the model
        this.props.updateState(states.training);
    }

    /**
     * Function for updating the search bar value
     */
    onChange = (newValue) => {
        if (this.value !== newValue && !this.state.isLoading){
            this.setState({ value: newValue });
        }
    }

    /**
     * Function for searching.
     * 
     * Search is based on an exact lowercase text match based on the state.value and annotation value.
     */
    onSearch = () => {
        let newVisibleIds = this.state.originalRows.map(row => row.id);
        // we show a subset, or we show all
        if (this.state.value !== "" && !this.state.isLoading) {
            // we update the visible row ids
            let newRows = this.state.originalRows.filter(row => row.annotation.toLowerCase().includes(this.state.value.toLowerCase()));
            newVisibleIds = newRows.map(row => row.id);
        }

        this.setState({
            visibleRowIds: newVisibleIds,
            selectAllOn: this.selectAllPersistance(newVisibleIds, null),
            selectAllActive: this.selectAllCanChange(newVisibleIds, null)
        });
    }

    /**
     * Function for selecting a row from within the search area.
     * 
     * We update the selected rows and unselected rows accordingly, as well as the ability to type a group name or create a group.
     * 
     * @param {int} index - the row to select
     */
    selectIndex = (index) => {
        // update the ids
        let ids = this.state.selectedRowIds;
        ids.push(index);
        
        let rowids = this.state.originalRows.map(row => row.id);

        // update the selected rows
        let sliceIndex = rowids.indexOf(index);
        let newitems = this.state.originalRows.slice(sliceIndex, sliceIndex+1);
        let selected = this.state.selectedRows.concat(newitems);

        // remove from unselected rows
        let unselected = this.state.unselectedRows.filter(row => row.id !== index);
 
        this.setState({selectedRowIds: ids, selectedRows: selected, unselectedRows: unselected, readyToNameGroup: true, readyToGroup: selected.length > 0 && this.state.groupName !== ""});
    }

    /**
     * Function for un-selecting a row from within the search area.
     * 
     * We update the selected rows and unselected rows accordingly.
     * 
     * @param {int} index - the row to select
     */
    unselectIndex = (index) => {
        if (this.state.allGroupedRows.has(index)){
            return;
        }

        let rowids = this.state.originalRows.map(row => row.id);

        // update un-selected rows
        let sliceIndex = rowids.indexOf(index);
        let newitems = this.state.originalRows.slice(sliceIndex, sliceIndex+1);
        let unselected = this.state.unselectedRows.concat(newitems);

        let selected = this.state.selectedRows.filter(row => row.id !== index);

        this.setState({
            selectedRowIds: this.state.selectedRowIds.filter(elem => elem !== index),  // remove from selected
            selectedRows: selected, // remove from selected
            unselectedRows: unselected,
            readyToGroup: selected.length > 0 && this.state.groupName !== ""
        });

    }

    /**
    * Function for selecting all rows from within the search area.
    * 
    * We update the selected rows and unselected rows accordingly.
    */
    onSelectAllClick = () => {
        if (this.state.selectAllOn) {
            this.unselectAll();
        } else {
            this.selectAll();
        }
    }


    // For every id currently visible in the search bar, if any row has not yet been grouped,
    // it is still changeable. This means that we can click the 'selectAll' checkbox
    selectAllCanChange = (vIds, gRows) => {
        const visibleIds = (vIds !== null) ? vIds : this.state.visibleRowIds;
        const groupRows = (gRows !== null) ? gRows : this.state.allGroupedRows;
        for (let id of visibleIds) {
            if (!groupRows.has(id)){
                return true;
            }
        }
        return false;
    }


    // When updating the state of visible rows and created groups,
    // the 'Select All' checkbox should persist / be selected if 
    // all visibleIds are currently selected or grouped
    selectAllPersistance = (vIds, gRows) => {
        const visibleIds = (vIds !== null) ? vIds : this.state.visibleRowIds;
        const groupRows = (gRows !== null) ? gRows : this.state.allGroupedRows;

        for (let id of visibleIds) {
            // no group has the id and the id is not selected
            // means that we could still 'select all', and it
            // should be off
            if (!groupRows.has(id) && !this.isSelected(id)){
                return false;
            }
        }
        return true;
    }


    /**
    * Function for selecting all rows from within the search area.
    * 
    * We update the selected rows and unselected rows accordingly.
    */
    selectAll = () => {
        let selected = this.state.selectedRows;
        let unselected = this.state.unselectedRows;
        let newSelectedIds = this.state.selectedRowIds;

        // we iterate over unselected visible ids
        const visibleIds = this.state.visibleRowIds.filter(id => ! this.isSelected(id));
        const rowids = this.state.originalRows.map(row => row.id);

        for (let id of visibleIds) {
            newSelectedIds.push(id);

            // update the selected rows
            let sliceIndex = rowids.indexOf(id);
            let newitems = this.state.originalRows.slice(sliceIndex, sliceIndex+1);
            selected = selected.concat(newitems);

            // remove from unselected rows
            unselected = unselected.filter(row => row.id !== id);
        }

        this.setState({ selectAllOn: true, selectedRowIds: newSelectedIds, selectedRows: selected, unselectedRows: unselected, readyToNameGroup: true, readyToGroup: selected.length > 0 && this.state.groupName !== ""});
    }


    /**
    * Function for un-selecting all rows from within the search area.
    * 
    * We update the selected rows and unselected rows accordingly.
    */
    unselectAll = () => {
        let selected = this.state.selectedRows;
        let unselected = this.state.unselectedRows;

        // we iterate over selected visible ids
        const visibleIds = this.state.visibleRowIds.filter(id => this.isSelected(id));
        const rowids = this.state.originalRows.map(row => row.id);

        for (let id of visibleIds) {
            
            // update the unselected rows
            let sliceIndex = rowids.indexOf(id);
            let newitems = this.state.originalRows.slice(sliceIndex, sliceIndex+1);
            unselected = unselected.concat(newitems);

            // remove from selected rows
            selected = selected.filter(row => row.id !== id);
        }

        this.setState({ selectAllOn: false, selectedRowIds: [], selectedRows: selected, unselectedRows: unselected, readyToNameGroup: true, readyToGroup: selected.length > 0 && this.state.groupName !== ""});
       
    }

    /**
    * Returns whether or not a row at a given index is selected.
    */
    isSelected = (index) => {
        // we can't remove selection if it's in a group
        return this.state.allGroupedRows.has(index) || this.state.selectedRowIds.includes(index);
    }

    /**
    * Returns whether or not a row at a given index is visible based on the previous search criterion.
    */
    isVisible = (index) => {
        return this.state.visibleRowIds.includes(index);
    }

    /**
    * keyDownEvent for Next button hotkey
    */
    handleNextKeyPress = (event) => {
        if (event.key === ' ' && this.state.sectionComplete){
            this.onNextSubmit();
        }
    };

    /**
    * keyDownEvent for Create or Update Group button hotkey
    */
    handleCreateGroupKeyPress = (event) => {
        if (event.key === '/' && this.state.readyToGroup){
            this.createOrUpdateGroup();
        }
    };

    
    render() {
        return (
        <div style={{display: 'flex', flexDirection: 'column', height: '100%', width: '100%' }}>
            <div style={{ marginTop: '15px', marginLeft: '15px'}}>
                <b>
                    Assisted Grouping
                </b>
            </div>
            <div style={{ margin: '15px'}}>
                <div style={{ display: 'flex', height: '75vh'}}>
                    <div style={{ flexGrow: 1, margin: '15px'}}>
                        <div style={{marginLeft: '10px', height: '2vh'}} >
                            Groups
                        </div>
                        <div style={{ marginTop: '5px', padding: '5px', height: '38vh', width: '25vw', border: '2px solid black', borderRadius: '10px'}}>
                            <div style={{ display: 'flex', position: 'relative', overflow: 'scroll', height: '38vh', width: '25vw'}}>
                                <GroupingsTable
                                    style={{width: '24vw'}}
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
                        </div>
                    </div>
                    <div style={{ flexGrow: 1, margin: '15px'}}>
                        <div style={{marginLeft: '10px', height: '2vh'}} >
                            Search Annotations
                        </div>
                        <div style = {{marginTop: '5px', padding: '5px', border: '2px solid black', borderRadius: '10px', height: "28vh", width: '60vw'}}>
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
                                        <Loading/>
                                    </div>
                                ) : (
                                <div style={{ overflow: 'scroll', display: 'flex', position: 'relative', height: '23vh', width: "60vw"}}>
                                    <SearchResultTable
                                        data={this.state.originalRows}
                                        columns={[
                                            {
                                                Header: () => <input type="checkbox" disabled={!this.state.selectAllActive} checked={this.state.selectAllOn} onClick={this.onSelectAllClick} readOnly={true}/>,
                                                accessor: 'selectAll'
                                            },
                                            {   
                                                Header: () => 
                                                        (<div style={{marginLeft: '10px', textAlign: 'left'}}>
                                                            Annotation
                                                        </div>),
                                                accessor: 'annotation'
                                            },
                                            { 
                                                Header: () => 
                                                        (<div style={{marginLeft: '10px', textAlign: 'left'}}>
                                                            Text
                                                        </div>),
                                                accessor: 'text',
                                            }
                                            
                                        ]}
                                        selectIndex={this.selectIndex}
                                        unselectIndex={this.unselectIndex}
                                        isSelected={this.isSelected}
                                        isVisible={this.isVisible}
                                    />
                                </div>)
                            }
                        </div>
                        <div style={{ marginTop: '15px', marginLeft: '10px', height: '2vh'}} >
                            Selected Annotations
                        </div>
                        <div style={{ marginTop: '5px', padding: '5px', height: '13vh', width: '60vw', border: '2px solid black', borderRadius: '10px'}}>
                            <div style={{ display: 'flex', position: 'relative',overflow: 'scroll', height: '13vh', width: '60vw'}}>
                                <SelectionsTable
                                    style={{width: "57vw"}}
                                    data={this.state.selectedRows}
                                    columns={[
                                        {
                                            accessor: 'annotation'
                                        }
                                    ]}
                                />
                            </div>
                        </div>
                        <div style={{marginTop: '15px', marginLeft: '10px', height: '2vh'}} >
                            Unselected Annotations
                        </div>
                        <div style={{ marginTop: '5px', padding: '5px', height: '13vh', width: '60vw', border: '2px solid black', borderRadius: '10px'}}>
                            <div style={{ display: 'flex', position: 'relative',overflow: 'scroll', height: '13vh', width: '60vw'}}>
                                <SelectionsTable
                                    style={{width: "57vw"}}
                                    data={this.state.unselectedRows}
                                    columns={[
                                        {
                                            accessor: 'annotation'
                                        }
                                        
                                    ]}
                                />
                            </div>
                        </div>
                        <div style={{ marginTop: '15px', display: 'flex', justifyContent: 'space-between', height: '3vh', width: '100%' }}>
                            <div style={{overflow: 'auto', height: '3vh', border: '2px solid black', padding: '5px', borderRadius: '10px', justifyContent: 'center'}}>
                                <InputStyle>
                                    <input
                                        disabled={!this.state.readyToNameGroup}
                                        placeholder="enter group name"
                                        value={this.state.groupName}
                                        onChange={this.updateGroupName}/>
                                </InputStyle>
                            </div>
                            <CallbackKeyEventButton
                                callBackFunc={this.handleCreateGroupKeyPress}
                                buttonAvailable={this.state.readyToGroup}
                                clickFunc={this.createOrUpdateGroup}
                                text={'Create or Update Group (/)'}
                            />
                        </div>
                    </div>   
                </div>
            </div>
            <div style={{marginTop: '15px', width:'100%'}}>
                <CallbackKeyEventButton 
                    callBackFunc={this.handleNextKeyPress}
                    buttonAvailable={this.state.sectionComplete}
                    clickFunc={this.onNextSubmit}
                    text={'Next (space)'}
                />
            </div>
            <div style={{marginTop: '15px'}}>
                <LinearProgress variant="determinate" value={progress}/>
            </div>
        </div>);
    }
}

export default AssistedGrouping;