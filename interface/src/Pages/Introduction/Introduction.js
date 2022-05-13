import React, {Component, Suspense} from 'react';

import states from './../../Constants/States';

import LinearProgress from '@material-ui/core/LinearProgress';
import CallbackKeyEventButton from '../../Custom/CallbackKeyEventButton';

import DataOptions from './DataOptions';

const fetch = require('node-fetch');

const progress = 0;

class Introduction extends Component {
    constructor(props) {
        super(props);
        this.state = {
            dataOptions: null,
            dataOptionsFull: null,
            selectedData: null,
            sectionComplete: false,
        }
    }


    /**
    * When the component mounts, we get all of the titles of the parsed data set options.
    *
    * This lets us populate our dropdown.
    */
    async componentDidMount() {
        try {
            const response = await fetch('/data/get_all_data_options');
            
            if (!response.ok) {
                throw Error(response.statusText);
            }

            const data = await response.json();

            let optionsFull = data.options
            let formattedOptionsFull = [];

            for (let option_id in optionsFull) {
                formattedOptionsFull.push({id: option_id, text: optionsFull[option_id].name});
            }

            this.setState({
                dataOptions: formattedOptionsFull
            });
        } catch (error) {
            console.log(error);
        }
    }


    /**
    * Dropdown selection.
    */
    onSelect = (_, selectedItem) => {
        this.setState({selectedData: selectedItem, sectionComplete: true});
    }

    /**
    * Dropdown removal.
    */
    onRemove = (_, __) => {
        this.setState({selectedData: null, sectionComplete: false});
    }

    /**
    * Next button submit action.
    * 
    * We set the option id, which indicates the dataset we are interacting with in all subsequent 
    * backend calls. We also update the UI state.
    */
    onNextSubmit = () => {
        this.props.setOptionID(this.state.selectedData.id);
        this.props.updateState(states.openCoding);
    }
    
    /**
    * keyDownEvent for Next button hotkey
    */
    handleNextKeyPress = (event) => {
        if (event.key === ' ' && this.state.sectionComplete){
            this.onNextSubmit();
        }
    };

    render() {
        return (
            <div style={{ display: 'flex', flexDirection: 'column', height: '100%', width: '100%'}}>
                <div style={{ margin: '15px'}}>
                    Introduction
                </div>
                <div style={{  margin: '15px', display: 'flex', height: '75vh', width: '90vw', justifyContent: 'flex-start', alignItems: 'center', flexDirection: 'column'}}>
                    Please select an existing database to work from. If your database is not available, please follow the given instructions to add the data to your local code base.
                </div>
                <div>
                    <DataOptions
                        dataOptions={this.state.dataOptions}
                        onSelect={this.onSelect}
                        onRemove={this.onRemove}
                    />
                </div>
                <div style={{marginTop: '15px', width:'100%'}}>
                    <div style={{alignItems:'end'}}>
                        <CallbackKeyEventButton
                            buttonAvailable={this.state.sectionComplete}
                            callBackFunc={this.handleNextKeyPress}
                            clickFunc={this.onNextSubmit}
                            text={'Next (space)'}
                            keyMatch={' '}
                        />
                    </div>
                </div>
                <div style={{marginTop: '15px'}}>
                    <LinearProgress variant="determinate" value={progress}/>
                </div>
            </div>

        );
    }
}

export default Introduction;