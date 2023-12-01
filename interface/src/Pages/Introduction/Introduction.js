import React, {Component} from 'react';

import states from './../../Constants/States';

import LinearProgress from '@material-ui/core/LinearProgress';
import CallbackKeyEventButton from '../../Custom/CallbackKeyEventButton';
import FixedSlider from './FixedSlider';
import PretrainingModal from './PretrainingModal';

import DataOptions from './DataOptions';

import '../../Custom/styles.css';

const fetch = require('node-fetch');

const progress = 0;

const pretrainNew = 'Pretrain New Model';

class Introduction extends Component {
    constructor(props) {
        super(props);
        this.state = {
            dataOptions: null,
            dataOptionsFull: null,
            pretrainedDropdown: [pretrainNew],
            selectedData: null,
            selectedModel: null,
            modelName: null,
            dataOptionSelected: false,
            modelSelected: false,
            showAdvanced: false,
            pretrainingNew: false,
            pretrainingStarted: false,
            pretrainingComplete: false,
            sectionComplete: false,
            numAnnotate: 50,
            numVerify: 50,
            numMinVerify: 20,
            batchSize: 50,
            numEpochs: 1,
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
            this.setState({
                showIntro: true
            });
    

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
    * Dropdown model selection.
    */
    onSelectPretrainedModel = (_, selectedItem) => {
        this.setState({
            selectedModel: selectedItem,
            modelName: selectedItem.model === pretrainNew ? null : selectedItem.model,
            modelSelected: true,
            pretrainingNew: selectedItem.model === pretrainNew,
            sectionComplete: selectedItem.model !== pretrainNew
        });
    }

    /**
    * Dropdown model removal.
    */
    onRemovePretrainedModel = (_, __) => {
        this.setState({
            selectedModel: null, 
            modelName: null,
            modelSelected: false,
            sectionComplete: false
        });
    }


    pretrainNewModel = async (batchSize, numEpochs) => {
        // get data option
        const dataOption = this.state.selectedData.id;

        // update state to show loading and disable additional pretraining submissions
        this.setState({
            pretrainingStarted: true,
        });

        console.log(this.props.getUsername())

        try {
            const response = await this.props.postData('/data/pretrain_model', {"id": dataOption, "batch_size": batchSize, "num_epochs": numEpochs, "username": this.props.getUsername()});
            
            if (!response.ok) {
                throw Error(response.statusText);
            }

            if (response.model === null){
                this.setState({
                    selectedModel: {model: "Error pretraining model"},
                    modelName: "Error pretraining model",
                    pretrainingComplete: true,
                    sectionComplete:  false
                });
            } else {
                // now we're done loading, but still disable pressing pre-train again
                this.setState({
                    selectedModel: {model: response.model}, // no longer pretraining default
                    modelName: response.model,
                    pretrainingComplete: true,
                    sectionComplete: true
                });
            }
        } catch (error) {
            console.log(error);
            this.setState({
                selectedModel: {model: "Error pretraining model"},
                modelName: "Error pretraining model",
                pretrainingComplete: true,
                sectionComplete: false
            });
        }
    }

    /**
    * Next button submit action.
    * 
    * We set the option id, which indicates the dataset we are interacting with in all subsequent 
    * backend calls. We also update the UI state.
    */
    onNextSubmit = () => {
        this.props.setOptionID(this.state.selectedData.id);
        this.props.setConstants([this.state.numAnnotate, this.state.numVerify, this.state.numMinVerify, this.state.batchSize, this.state.numEpochs, this.state.selectedModel.model]);
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

    /**
    * Advanced Settings button submit action.
    */
    onAdvancedSubmit = () => {
        this.setState({
            showAdvanced: !this.state.showAdvanced
        });
    }
    
    /**
    * keyDownEvent for Advanced Settings button hotkey
    */
    handleAdvancedKeyPress = (event) => {
        if (event.key === ';'){
            this.onAdvancedSubmit();
        }
    };

    /**
     * Handles changing number of desired annotation samples.
     */
    handleAnnotationChange = (value) => {
        this.setState({numAnnotate: value});
    }

    /**
     * Handles changing number of desired prediction samples.
     */
    handleVerificationChange = (value) => {
        this.setState({numVerify: value});
    }

    /**
     * Handles changing desired batch size.
     */
    handleBatchSizeChange = (value) => {
        this.setState({batchSize: value});
    }

    /**
     * Handles desired number of epochs.
     */
    handleNumEpochsChange = (value) => {
        this.setState({numEpochs: value});
    }

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
                <div style={{ margin: '15px'}}>
                    <label for="username">Username:   </label>
                    <input type="text" id="uname" name="uname" enabled="false"></input>
                    <button onClick={this.confirmUsername}>OK</button>
                </div>
                <div style={{ overflow: 'scroll', height: "80vh", width: "95vw" }}>
                    <div style={{ margin: '15px', display: 'flex', height: '65vh', width: '91vw', justifyContent: 'flex-start', flexDirection: 'column'}}>
                        <div style = {{alignItems: 'center', marginBottom: '10px'}}>
                            Please select an existing database to work from. If your database is not available, please follow the given instructions to add the data to your local code base.
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
                        <div style = {{alignItems: 'center', marginBottom: '10px'}}>
                            Select a pre-existing pretrained model to use, or pretrain a new model.
                        </div>
                        <div style = {{ marginBottom: '20px'}}>
                            <DataOptions
                                disabled={!this.state.dataOptionSelected}
                                dataOptions={this.state.pretrainedDropdown}
                                displayValue={'model'}
                                displayText={'Select pretrained model'}
                                onSelect={this.onSelectPretrainedModel}
                                onRemove={this.onRemovePretrainedModel}
                            />
                        </div>
                        {/* visible if we have asked to pretrain, enabled if we haven't clicked the pretrain button, and loading
                        until pretraining is complete */}
                        <PretrainingModal
                            modelName={this.state.modelName}
                            showPretrainingModal={this.state.pretrainingNew}
                            enablePretrainingModal={!this.state.pretrainingStarted}
                            pretraining={this.state.pretrainingStarted && !this.state.pretrainingComplete}
                            pretrainNewModel={this.pretrainNewModel}
                        />
                        <div style = {{marginBottom: '20px'}}>
                            <CallbackKeyEventButton
                                buttonAvailable={true}
                                callBackFunc={this.handleAdvancedKeyPress}
                                clickFunc={this.onAdvancedSubmit}
                                text={'Advanced Settings (;)'}
                                keyMatch={';'}
                            />
                        </div>
                        {(this.state.showAdvanced) ?
                            (<div>
                                <div style = {{alignItems: 'center', marginBottom: '10px'}}>
                                    {"How many text samples would you like to annotate?"}
                                    <b style = {{marginLeft: '5px'}}>
                                        {this.state.numAnnotate}
                                    </b> 
                                </div>
                                <div style = {{ marginBottom: '20px'}}>
                                    <FixedSlider 
                                        name='Annotation Samples'
                                        width={'90vw'}
                                        startValue={10}
                                        endValue={300}
                                        defaultValue={100}
                                        updateValue={this.handleAnnotationChange}
                                    />
                                </div>
                                <div style = {{alignItems: 'center', marginBottom: '10px'}}>
                                    {"How many predictions should the model make during each verification round?"}
                                    <b style = {{marginLeft: '5px'}}>
                                        {this.state.numVerify}
                                    </b> 
                                </div>
                                <div style = {{ marginBottom: '20px'}}>
                                    <FixedSlider 
                                        name='Annotation Samples'
                                        width={'90vw'}
                                        startValue={10}
                                        endValue={300}
                                        defaultValue={100}
                                        updateValue={this.handleVerificationChange}
                                    />
                                </div>
                                <div style = {{alignItems: 'center', marginBottom: '10px'}}>
                                    {"What batch size should the model be finetuned with?"}
                                    <b style = {{marginLeft: '5px'}}>
                                        {this.state.batchSize}
                                    </b> 
                                </div>
                                <div style = {{ marginBottom: '20px'}}>
                                    <FixedSlider 
                                        name='Batch Size'
                                        width={'29.5vw'}
                                        startValue={1}
                                        endValue={100}
                                        defaultValue={50}
                                        updateValue={this.handleBatchSizeChange}
                                    />
                                </div>
                                <div style = {{alignItems: 'center', marginBottom: '10px'}}>
                                    {"How many epochs should the model be finetuned with?"}
                                    <b style = {{marginLeft: '5px'}}>
                                        {this.state.numEpochs}
                                    </b> 
                                </div>
                                <div style = {{ marginBottom: '20px'}}>
                                    <FixedSlider 
                                        name='Number of Epochs'
                                        width={'10vw'}
                                        startValue={1}
                                        endValue={15}
                                        defaultValue={1}
                                        updateValue={this.handleNumEpochsChange}
                                    />
                                </div>
                            </div>) :
                            null}
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