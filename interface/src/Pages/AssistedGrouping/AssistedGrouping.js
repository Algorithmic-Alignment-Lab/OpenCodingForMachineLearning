import React, {Component} from 'react';

import states from './../../Constants/States';
// import progress from './../../Constants/States';
import CallbackKeyEventButton  from '../../Custom/CallbackKeyEventButton';
import SearchBar from 'material-ui-search-bar';
import LinearProgress from '@material-ui/core/LinearProgress';

import { Dialog, DialogContent, DialogTitle } from '@material-ui/core';

import SearchResultTable from './PersistantSearchResultTable';
// import SelectionsTable from './SelectionsTable';
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
            selectedRowIds: [], // ids of annotations currently ready to be grouped, note
            //This is RELATIVE. It is for the table and does not actually track the real rows.
            selectedRows: [], // annotations ready to be grouped or already grouped
            unselectedRows: [], // annotations not yet grouped or not yet ready to be grouped
            groupRows: [], // all groups
            groupName: "",
            selectedGroup: null,
            // rowsInSelectedGroup: [],
            // rowsSelectedAndUngrouped: [],
            rowsUngrouped: [],
            allGroupedRows: [], // annotations that have been formally grouped
            sectionComplete: false,
            readyToGroup: false,
            readyToNameGroup: false,
            selectAllOn: false,
            selectAllActive: true,
            open: false,
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
            await this.props.postData('/data/save_annotations', {"rows": this.props.loadAnnotations(), "id": this.props.getOptionID(), "username": this.props.getUsername()});
            const data = await this.props.getDataWithParams('/data/get_annotations', {"id": this.props.getOptionID(), "username": this.props.getUsername()});
            
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

            console.log(adjusted_rows)

            this.setState({
                originalRows: adjusted_rows,
                rowsUngrouped: adjusted_rows,
                unselectedRows: unselected_rows,
                visibleRowIds: visible_rows,
                isLoading: false
            });

            window.scrollTo(0, 0);

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
        console.log("enteredReselected")
        let selected = [];
        let selectedIds = [];
        let group = null;

        // gather a list of the subrows for all groups but this one
        // add all of their ids to the new set of selected rows
        for (let s = 0; s < this.state.groupRows.length; s++){
            // this is the group we're releasing back
            // it is still considered 'selected' within the search view box
            // but its not a part of the grouped rows (required for section completion)
            if (String(s) === id) {
                group = this.state.groupRows[s];
                // for (let i = 0; i < this.state.groupRows[s].depth; i++){
                //     selected.push(this.state.groupRows[s].subRows[i]);
                //     selectedIds.push(this.state.groupRows[s].subRows[i].id);
                // }
            } else {
                // for (let i = 0; i < this.state.groupRows[s].depth; i++){
                //     newSelected.add(this.state.groupRows[s].subRows[i].id);
                // }
            }

        }

        // let completed = newSelected.size === this.state.originalRows.length;

        console.log("reselected")
        console.log(group)

        
        let newSelected = this.state.allGroupedRows

        newSelected.push(99)
        newSelected.pop()
        let ungrouped = this.state.originalRows.filter(item => {
            for (let elem of newSelected) {
                if (elem.id === item.id) {
                    return false;
                }
            }
            return true;})

        let visible = ungrouped.map(item => item.id)

        console.log(ungrouped)
        console.log(visible)
        console.log(newSelected)
        this.setState({
            selectedRowIds: selectedIds,
            selectedRows: selected,
            readyToGroup: true,
            groupName: "",
            selectedGroup: group,
            visibleRowIds: visible,
            rowsUngrouped: ungrouped
        });
    }

    createGroup = () => {

        //SELECT FROM UNGROUPED SET TO NONE

        
        //DISPLAY IN SELECTED TO NONE

        //MAKE THE groupname null after setting selected group

        //CHECK THAT THE NAME DOES NOT ALREADY EXIST IN ALL GROUPS

        let newGroupRows = this.state.groupRows;

        for (let groupRow of newGroupRows){

            if (groupRow.text === this.state.groupName){
                this.setState({
                    grouName: ""
                })
                alert("Group already exists")
                return
            }
        }

        let newGroup = {id: this.state.groupRows.length, text: this.state.groupName, expander: "", expanded: false, depth: 0, subRows: []}
        
        newGroupRows = newGroupRows.concat([
            newGroup
        ]);


        this.setState({
            selectedRows: [],
            selectedRowIds: [],

            groupRows: newGroupRows,
            groupName: "",
            selectedGroup: newGroup
        })
        
    }

    updateGroup = () => {

        console.log(this.state.selectedRows)
        
        let newSelected = this.state.allGroupedRows;

        for (let i = 0; i < this.state.selectedRows.length; i++){
            newSelected.push(this.state.selectedRows[i]);
        }

        console.log(newSelected)

        let completed = newSelected.length === this.state.originalRows.length;

        // if the group name already exists, we need to update rather than create


        let groupRow = this.state.selectedGroup

        const selectedIdsSet = new Set(this.state.selectedRowIds);
        
        
        const relevantSubRows = groupRow.subRows.concat(this.state.selectedRows);

        groupRow.depth = relevantSubRows.length;
        groupRow.subRows = relevantSubRows;
        groupRow.expanded = false;
        groupRow.expander =  "";

        console.log(groupRow)

        // let ungrouped = this.state.originalRows.filter(item => !newSelected.has(item.id));
        console.log(newSelected)
        let ungrouped = this.state.originalRows.filter(item => {
            for (let elem of newSelected) {
                if (elem.id === item.id) {
                    return false;
                }
            }
            return true;})

        console.log(ungrouped)
        
        let oldVisible = this.state.visibleRowIds;

        let visible = oldVisible.filter(num => !(newSelected.map(item => item.id)).includes(num));
        console.log(visible)
        
        this.unselectAll()

        this.setState({
            selectedRowIds: [],
            selectedRows: [],
            allGroupedRows: newSelected,
            groupName: "",
            sectionComplete: completed,
            rowsUngrouped: ungrouped,
            visibleRowIds: visible,
            // selectAllActive: this.selectAllCanChange(null, newSelected),
            // selectAllOn: this.selectAllPersistance(null, newSelected)
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
        let newSelected = [];
        let newUnselected = this.state.unselectedRows;

        let newSelectedGroup = this.state.selectedGroup
        // gather a list of the subrows for all groups and add all of their ids 
        // to the new set of selected rows unless the id matches this group -
        // if the id matches this group, it is a part of unselected rows
        for (let s = 0; s < this.state.groupRows.length; s++){

            if (String(s) !== id) {
                for (let i = 0; i < this.state.groupRows[s].depth; i++){
                    newSelected.push(this.state.groupRows[s].subRows[i]);
                }
            } else {
                for (let i = 0; i < this.state.groupRows[s].depth; i++){
                    newUnselected.push(this.state.groupRows[s].subRows[i]);
                }
                if (this.state.groupRows[s].text === newSelectedGroup.text) {
                    newSelectedGroup = null
                }
            }
        }

        // NOTE: are we done? probably not, but will keep this check for
        // when we support multiple labels per text item
        let completed = newSelected.length === this.state.originalRows.length;

        let newGroups = this.state.groupRows

        newGroups.splice(id, 1)

        console.log(newGroups)

        console.log(newSelected)
        let ungrouped = this.state.originalRows.filter(obj => !(newSelected.map(item => item.id)).includes(obj.id))
        
        console.log(ungrouped)

        let visible = ungrouped.map(item => item.id)
        this.setState({
            allGroupedRows: newSelected,
            groupRows: newGroups,
            sectionComplete: completed,
            unselectedRows: newUnselected,
            visibleRowIds: visible,
            selectedGroup: newSelectedGroup,
            rowsUngrouped: ungrouped,
            // selectAllActive: this.selectAllCanChange(null, newSelected)
        });
    }

    /**
     * Function for deleting a group.
     * 
     * Removes the group from groupRows and from allGroupedRows, and repopulates unselectedRows.
     * 
     * @param {int} id the group to delete
     */
    //TODO WHERE TO CHANGE THE GROUPS THAT ARE DELETED 
    deleteSubRow = (id) => {
        // take advantage of the fact that group rows are always in order
        let newSelected = [];
        let newUnselected = this.state.unselectedRows;

        let newSelectedGroup = this.state.selectedGroup
        // gather a list of the subrows for all groups and add all of their ids 
        // to the new set of selected rows unless the id matches this group -
        // if the id matches this group, it is a part of unselected rows
        
        let subRows = newSelectedGroup.subRows;

        let removedRow = subRows.splice(id, 1)

        console.log(subRows)
        console.log(removedRow[0].id)
        newSelected = this.state.allGroupedRows

        newSelected = newSelected.filter(obj => obj.id != removedRow[0].id);
        console.log(newSelected)
        let ungrouped = this.state.originalRows.filter(obj => !(newSelected.map(item => item.id)).includes(obj.id))
        
        console.log(ungrouped)

        let visible = ungrouped.map(item => item.id)

        newSelectedGroup.subRows = subRows

        console.log(subRows.length)
        newSelectedGroup.depth = subRows.length

        let completed = newSelected.length === this.state.originalRows.length;
        this.setState({
            allGroupedRows: newSelected,
            unselectedRows: newUnselected,
            visibleRowIds: visible,
            selectedGroup: newSelectedGroup,
            rowsUngrouped: ungrouped,
            sectionComplete: completed,
            // selectAllActive: this.selectAllCanChange(null, newSelected)
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

    /**
     * Function for pressing "Next" button.
     * 
     * Saves the labels created and updates the UI state.
     */
    onNextSubmit = () => {
        let labeled = [];

        for (let j = 0; j < this.state.groupRows.length; j ++){
            for (let i = 0; i < this.state.groupRows[j].subRows.length; i++){
                // we want the trueid (aka the database mapping)
                labeled.push({id: this.state.groupRows[j].subRows[i].trueid, true_label: this.state.groupRows[j].text, predicted_label: null});
            }
        }

        this.props.saveLabelState(labeled);
        this.props.saveLabels(labeled);
        this.props.updateState(states.ending);
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
        
        let newVisibleIds = this.state.visibleRowIds;
       // we show a subset, or we show all
        if (this.state.value !== "" && !this.state.isLoading) {
            // we update the visible row ids
            let newRows = this.state.rowsUngrouped.filter(
                row => row.annotation.toLowerCase().includes(this.state.value.toLowerCase()));
            newVisibleIds = newRows.map(row => row.id);
        }

        this.setState({
            visibleRowIds: newVisibleIds,
            // selectAllOn: this.selectAllPersistance(newVisibleIds, null),
            // selectAllActive: this.selectAllCanChange(newVisibleIds, null)
        });
    }

    onCancelSearch = () => {
        let newVisibleIds = this.state.visibleRowIds

        // let sortedArr1 = this.state.rowsUngrouped.map(row => row.id).slice().sort();
        // let sortedArr2 = this.state.visibleRowIds.slice().sort();

        // // Check if the sorted arrays are equal
        // console.log("cancel search check")
        // console.log(sortedArr1.length === sortedArr2.length && sortedArr1.every((value, index) => value === sortedArr2[index]))

        console.log(this.state.allGroupedRows)
        console.log(this.state.rowsUngrouped)
        console.log(this.state.visibleRowIds)

        let newSelected = []
        newVisibleIds = this.state.rowsUngrouped.map(item => item.id)

        this.unselectAll()

        this.setState({
            visibleRowIds: newVisibleIds,
            selectedRows: newSelected,
            selectedRowIds: []
        })

        // this.setState({
        //     visibleRowIds: newVisibleIds,
        //     selectAllOn: this.selectAllPersistance(newVisibleIds, null),
        //     selectAllActive: this.selectAllCanChange(newVisibleIds, null)
        // });
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
        
        let rowids = this.state.rowsUngrouped.map(row => row.id);

        console.log(rowids)
        console.log(ids)
        // update the selected rows
        let sliceIndex = rowids.indexOf(index);
        let newitems = this.state.rowsUngrouped.slice(sliceIndex, sliceIndex+1);
        let selected = this.state.selectedRows.concat(newitems);

        console.log(selected)
        console.log(newitems)

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
        // if (this.state.allGroupedRows.has(index)){
        //     return;
        // }

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
            if (!groupRows.some(item => item.id === id)){
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
            if (!groupRows.some(item => item.id === id) && !this.isSelected(id)){
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
        return this.state.selectedRowIds.includes(index);
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

    handleOpen = () => {
        this.setState({ open: true });
    };

    handleClose = () => {
        this.setState({ open: false });
    };
    
    render() {
        return (
            <div style={{display: 'flex', flexDirection: 'column', height: '100%', width: '100%' }}>
            <div style={{ marginTop: '15px', marginLeft: '15px'}}>
                <h2>
                    Grouping Stage
                </h2>
            </div>
            <div style={{ margin: '15px'}}>
                    <b>
                        What is a group?
                    </b>
                    <br></br>
                        A group is a set of one or more annotation(s) that are all similar and should be "grouped" together to describe the overarching attribute.
                    <br></br>
                    <br></br>
                    <b>
                        Annotations can fall along a spectrum of an attribute. For example, two annotations could be referencing a similar underlying attribute (e.g. 'warm' and 'empathetic'), or be inverses of each other (e.g. 'warm' and 'cold'). The goal of the grouping stage is to group texts with annotations that relate to the same attribute (each attribute is our group) to create a cohesive and structured dataset of annotated chat responses.
                    </b>
                    


                </div>
                <div style={{ margin: '5px'}}>
                    <h3 style={{ margin: '2px'}}>
                        Your Task
                    </h3>
                    Please group the chat prompts and responses based off of your annotations. Use the interface below to search through the annotations and create a group name.
                    <br></br>
                </div>
                <div style={{ margin: '5px'}}>
                    <CallbackKeyEventButton text={'Click here to review the instructions for the grouping interface'} clickFunc={this.handleOpen} buttonAvailable={true}/>
                    <Dialog open={this.state.open} onClose={this.handleClose}>
                    <DialogTitle>How to Use the Grouping Interface</DialogTitle>
                    <DialogContent>
                        <br></br> The following numbers explain the coresponding part of the interface shown in the diagram.
                        <br></br><b>1</b> The location where the groups you define will appear. You can click on a group in the view box to update it. You can click on the small "x" beside the group to delete it.
                        <br></br><b>2</b> The interface to search through the annotations that you have written. You can also select/unselect the checkbox to add the prompt / response to a particular group. 
                        <br></br><b>3</b> When a prompt / response is selected in interface 2, it's annotation will appear in this view box.
                        <br></br><b>4</b> When a prompt / response is <b>not</b> selected in interface 2, it's annotation will appear in this view box.
                        <br></br><b>5</b> When creating a group, box 5 is where you enter the group name. Note that at least one prompt / response must be selected.
                        <br></br><b>6</b> The button to either create or update a group.

                        <br></br><br></br>
                    </DialogContent>
            </Dialog>

                </div>
            <div style={{ margin: '15px'}}>
                {(this.state.selectedGroup == null)?
                (<h4 style={{marginBottom: '10px', height: '2vh', textAlign: 'center'}}>
                    There is no selected group. Please select/create a group
                </h4>)
                :
                (<h4 style={{marginBottom: '10px', height: '2vh', textAlign: 'center'}}>
                    The selected group is: {this.state.selectedGroup.text}
                </h4>)}
                <div style={{ display: 'flex'}}>
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
                        <div style={{ marginTop: '15px', display: 'flex', flexShrink: 0, justifyContent: 'space-between', height: '20px', width: '100%' }}>
                            <div style={{oberflow: 'auto', flexShrink: 0,  height: '100%', border: '2px solid black', padding: '2px', borderRadius: '10px', justifyContent: 'center', alignItems: 'center'}}>
                                <InputStyle>
                                    <input
                                        style={{ height: '100%'}}
                                        disabled={false}
                                        placeholder="enter group name"
                                        value={this.state.groupName}
                                        onChange={this.updateGroupName}/>
                                </InputStyle>
                            </div>
                            <CallbackKeyEventButton
                                buttonAvailable={true}
                                clickFunc={this.createGroup}
                                
                                text={'Create Group'}
                            />
                        </div>
                    </div>
                    <div style={{ flexGrow: 1, margin: '15px'}}>
                        <div style={{marginLeft: '10px', height: '2vh'}} >
                            Chat Prompts / Responses in Selected Group
                        </div>
                        <div style = {{marginTop: '5px', padding: '5px', border: '2px solid black', borderRadius: '10px', height: "28vh", width: '60vw'}}>

                                <div style={{ overflow: 'scroll', display: 'flex', position: 'relative', height: '23vh', width: "60vw"}}>
                                    <GroupingsTable
                                        style={{width: '60vw'}}
                                        data={(this.state.selectedGroup == null)?
                                            ([])
                                            :
                                            (this.state.selectedGroup.subRows)}
                                        columns={[
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
                                                            Chat Prompts and Responses
                                                        </div>),
                                                accessor: 'text',
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
                                                        <div onClick={() => {this.deleteSubRow(row.id)}}>
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
                        <div style={{ marginTop: '15px', marginLeft: '10px', height: '2vh'}} >
                            UnGrouped Chat Prompts and Responses
                        </div>
                        
                        <div style = {{marginTop: '5px', padding: '5px', border: '2px solid black', borderRadius: '10px', height: "47vh", width: '60vw'}}>
                            <SearchBar
                                style={{width: "60vw", height:'5vh'}}
                                value={this.state.value}
                                onChange={this.onChange}
                                onRequestSearch={this.onSearch}
                                onCancelSearch={this.onCancelSearch}
                            />
                            {
                                (this.state.isLoading) ?
                                (
                                    <div>
                                        <Loading/>
                                    </div>
                                ) : (
                                <div style={{ overflow: 'scroll', display: 'flex', position: 'relative', height: '40vh', width: "60vw"}}>
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
                                                            Chat Prompt / Response
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
                        <div style={{ marginTop: '15px', display: 'flex', flexShrink: 0, justifyContent: 'space-between', height: '20px', width: '100%' }}>
                            
                            <CallbackKeyEventButton
                                callBackFunc={this.handleCreateGroupKeyPress}
                                buttonAvailable={this.state.selectedGroup != null && this.state.selectedRows.length != 0}
                                clickFunc={this.updateGroup}
                                
                                text={'Add to Selected Group'}
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