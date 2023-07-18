import React, { Component } from 'react';

import FixedSlider from '../../Custom/FixedSlider';
import CallbackKeyEventButton from '../../Custom/CallbackKeyEventButton';
import Loading from '../../Custom/Loading';

/**
* Single-select drop-down for populating dataset options.
*/
export default class PretrainingModal extends Component {

    constructor() {
        super();
        this.state = {
            visible: false,
            enabled: true,
            showLoading: false,
            showAdvanced: false,
            name: null,
            batchSize: 50,
            numEpochs: 5,
        };
    }

    componentDidUpdate(prevProps) {
        if (this.props.showPretrainingModal !== prevProps.showPretrainingModal) {
            this.setState({
                visible: this.props.showPretrainingModal
            });
        }

        if (this.props.enablePretrainingModal !== prevProps.enablePretrainingModal) {
            this.setState({
                enabled: this.props.enablePretrainingModal
            });
        }

        if (this.props.pretraining !== prevProps.pretraining) {
            this.setState({
                showLoading: this.props.pretraining
            });
        }

        if (this.props.modelName !== prevProps.modelName){
            this.setState({
                name: this.props.modelName
            });
        }

    }

    /**
     * Handles changing batch size.
    */
    handleBatchSizeChange = (value) => {
        this.setState({batchSize: value});
    }

    /**
     * Handles changing number of epochs.
    */
    handleNumEpochsChange = (value) => {
        this.setState({numEpochs: value});
    }

    /**
    * Pretrain button submit action.
    */
    onPretrainSubmit = () => {
        this.props.pretrainNewModel(this.state.batchSize, this.state.numEpochs);
    }
    
    
    handlePretrainKeyPress = (event) => {
        if (event.key === '/' && this.state.enabled){
            this.onPretrainSubmit();
        }
    };

    /**
    * Advanced Settings submit action.
    */
    onAdvancedSubmit = () => {
        this.setState({
            showAdvanced: !this.state.showAdvanced,
        })
    }

    /**
    * keyDownEvent for Advanced Settings button hotkey
    */
    handleAdvancedKeyPress = (event) => {
        if (event.key === 'a' && this.state.enabled){
            this.onAdvancedSubmit();
        }
    }


    render() {
        return (this.state.visible) ? 
            (<div style={{ padding: '15px', marginLeft: '10px', marginBottom: '10px', backgroundColor: 'rgba(0,0,0,.05)', display: 'flex', width: '88vw', justifyContent: 'space-evenly', flexDirection: 'row', borderRadius: '10px'}}>
                    <div>
                        {(this.state.showAdvanced) ?
                        (<div style = {{width: '60vw'}}>
                            <div style = {{alignItems: 'center', marginBottom: '10px'}}>
                                {"What batch size should the model be pretrained with?"}
                                <b style = {{marginLeft: '5px'}}>
                                    {this.state.batchSize}
                                </b> 
                            </div>
                            <div style = {{ marginBottom: '20px'}}>
                                <FixedSlider 
                                    name='Batch Size'
                                    width={'60vw'}
                                    startValue={1}
                                    endValue={100}
                                    defaultValue={50}
                                    updateValue={this.handleBatchSizeChange}
                                />
                            </div>
                            <div style = {{alignItems: 'center', marginBottom: '10px'}}>
                                {"How many epochs should the model be pretrained with?"}
                                <b style = {{marginLeft: '5px'}}>
                                    {this.state.numEpochs}
                                </b> 
                            </div>
                            <div>
                                <FixedSlider 
                                    name='Number of Epochs'
                                    width={'10vw'}
                                    startValue={1}
                                    endValue={15}
                                    defaultValue={5}
                                    updateValue={this.handleNumEpochsChange}
                                />
                            </div> 
                        </div>):
                        (<div style = {{width: '60vw'}}>
                            {"Batch Size: "}
                            <b style = {{marginLeft: '5px'}}>
                                {this.state.batchSize}
                            </b>
                            <div style = {{marginLeft: '5px'}}/>
                            {"Number of Epochs: "}
                            <b style = {{marginLeft: '5px'}}>
                                {this.state.numEpochs}
                            </b>
                        </div>)}
                    </div>
                    <div style={{marginLeft: '20px', width:'100%'}}>
                        <CallbackKeyEventButton
                            buttonAvailable={this.state.enabled}
                            callBackFunc={this.handlePretrainKeyPress}
                            clickFunc={this.onPretrainSubmit}
                            text={'Pretrain Model (/)'}
                            keyMatch={'/'}
                        />
                        { 
                            (this.state.showLoading) ? 
                            (<div style={{marginTop: '15px', width:'100%'}}>
                                <Loading/>
                            </div>) :
                            ( (this.state.name === null) ?
                                null :
                                <div style={{marginTop: '15px', width:'100%'}}>
                                    Created {this.state.name}
                                </div>
                            )
                        }  
                    </div> 
                    <div style={{marginLeft: '10px', width:'100%'}}>
                        <CallbackKeyEventButton
                            buttonAvailable={this.state.enabled}
                            callBackFunc={this.handleAdvancedKeyPress}
                            clickFunc={this.onAdvancedSubmit}
                            text={'Advanced Settings (a)'}
                            keyMatch={'a'}
                        />  
                    </div>     
            </div>) :
            (
                null
            );
      }
}