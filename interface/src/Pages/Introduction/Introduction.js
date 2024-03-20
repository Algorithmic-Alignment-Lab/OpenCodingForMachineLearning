import React, {Component} from 'react';

import states from './../../Constants/States';

import LinearProgress from '@material-ui/core/LinearProgress';
import CallbackKeyEventButton from '../../Custom/CallbackKeyEventButton';
// import FixedSlider from './FixedSlider';
// import PretrainingModal from './PretrainingModal';

import DataOptions from './DataOptions';

import '../../Custom/styles.css';

// const fetch = require('node-fetch');

const progress = 0;

const pretrainNew = 'Pretrain New Model';

class Introduction extends Component {
    constructor(props) {
        super(props);
        this.state = {
            dataOptions: null,
            dataOptionsFull: null,
            selectedData: null,
            dataOptionSelected: false,
            sectionComplete: false,
            numAnnotate: 50,
            showIntro: false,
        }
    }


    /**
    * When the component mounts, we get all of the titles of the parsed data set options.
    *
    * This lets us populate our dropdown.
    */
    async componentDidMount() {
        try {
            
            const prepData = await this.props.getDataWithParams('/data/prep_data',{"username": this.props.getUsername()});
            // show 404 or 500 errors
            if (!prepData.ok) {
                throw Error(prepData.statusText);
            }
            await prepData
            
            const appendCSV = await this.props.getDataWithParams('/data/append_csv',{"username": this.props.getUsername()})
            // show 404 or 500 errors
            if (!appendCSV.ok) {
                throw Error(appendCSV.statusText);
            }
            await appendCSV

            this.setState({
                numAnnotate: appendCSV.numAnnotate,
                showIntro: true
            });

            console.log("NumAnnotate:", this.state.numAnnotate)

            const response = await this.props.getDataWithParams('/data/get_all_data_options', {"username": this.props.getUsername()});
            
            if (!response.ok) {
                throw Error(response.statusText);
            }

            const data = await response;

            let optionsFull = data.options;

            let formattedOptionsFull = [];

            for (let option_id in optionsFull) {
                let models = [];
                
                for (let model in optionsFull[option_id].models){
                    models.push({model: optionsFull[option_id].models[model]})
                }

                formattedOptionsFull.push({id: option_id, text: optionsFull[option_id].name, models: models});
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
    onSelectDataOption = (_, selectedItem) => {
        this.setState({
            selectedData: selectedItem,
            pretrainedDropdown: selectedItem.models.concat([{model: pretrainNew}]),
            dataOptionSelected: true,
            selectedModel: null,
            sectionComplete: true
        });
    }

    /**
    * Dropdown removal.
    */
    onRemoveDataOption = (_, __) => {
        this.setState({
            selectedData: null, 
            pretrainedDropdown: ['Pretrain New Model'],
            dataOptionSelected: false,
            sectionComplete: false
        });
    }

    /**
    * Next button submit action.
    * 
    * We set the option id, which indicates the dataset we are interacting with in all subsequent 
    * backend calls. We also update the UI state.
    */
    onNextSubmit = () => {
        this.props.setOptionID(this.state.selectedData.id);
        this.props.setConstants([this.state.numAnnotate]);
        this.props.updateState(states.openCoding);
        this.props.setName(this.state.selectedData.text)
    }
    
    /**
    * keyDownEvent for Next button hotkey
    */
    handleNextKeyPress = (event) => {
        if (event.key === ' ' && this.state.sectionComplete){
            this.onNextSubmit();
        }
    };

    confirmUsername = () => {
        var inputField = document.getElementById('uname');
        inputField.disabled = true;
        this.props.setUsername(document.getElementById("uname").value)
    }
    

    render() {
        if(this.state.showIntro) {
        return (
            <div style={{ display: 'flex', flexDirection: 'column', height: '100%', width: '100%'}}>
                <div style={{ margin: '15px'}}>
                    <b>
                        Introduction
                    </b>
                </div>
                <div style={{ overflow: 'scroll', height: "80vh", width: "95vw" }}>
                    <div style={{ margin: '15px', display: 'flex', height: '65vh', width: '91vw', justifyContent: 'flex-start', flexDirection: 'column'}}>
                        <div style = {{alignItems: 'center', marginBottom: '10px'}}>
                            Please select your uploaded chat from the dropdown menu: '{this.props.getUsername()} combined chat'.
                        </div>
                        <div style = {{ marginBottom: '20px'}}>
                            <DataOptions
                                disabled={false}
                                dataOptions={this.state.dataOptions}
                                displayValue={'text'}
                                displayText={'Select dataset'}
                                onSelect={this.onSelectDataOption}
                                onRemove={this.onRemoveDataOption}
                            />
                        </div>
                        <div>
                        <br></br>
                            You will now interact with your interactions with the model in 2 stages:
                            <br></br>
                            <br></br>
                            &nbsp; &nbsp; &nbsp; &nbsp; 1. <b>Annotation Stage</b>: You will be asked to generate labels (value/quality) for the model’s responses. You can assign more than one label to an instance.
                            <br></br>
                            <br></br>
                            &nbsp; &nbsp; &nbsp; &nbsp; 2. <b>Grouping Stage</b>: You will create a series of groups based on your annotations. Each instance can belong to only one group.
                        </div>
                    </div>
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

        ); } else {
            return (<div></div>);
        }
    }
}

export default Introduction;