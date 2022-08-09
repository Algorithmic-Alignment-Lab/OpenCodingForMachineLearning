import React, {Component} from 'react';

import states from './../../Constants/States';
// import progress from './../../Constants/States';
import CallbackKeyEventButton from '../../Custom/CallbackKeyEventButton';
import NextButton from './NextButton';
import LinearProgress from '@material-ui/core/LinearProgress';
import Multiselect from 'multiselect-react-dropdown';
import Loading from '../../Custom/Loading';

const progress = 75;

class Verification extends Component {
    constructor(props) {
        super(props);
        this.multiselectRef = React.createRef();
        this.state = {
            isLoading: true,
            isLoadingLabelSet: true,
            currentItemIndex: 0,
            maxItemIndex: -1,
            currentItem: {id: -1, text: ''},
            currentLabel: {id: -1, label: ''},
            labelOptions: [],
            chosenRows: [],
            originalLabels: [],
            predictedLabels: [],
            nextArrowEnabled: false,
            modalEnabled: false,
            sectionComplete: false,
            labelColor: 'black',
            progressPercent: 0,
            newLabel: null,
        };
    }

    /**
     * Refreshes state variables to beginning of verification process.
     */
    resetState = () => {
        this.setState({
            isLoading: true,
            currentItemIndex: 0,
            maxItemIndex: -1,
            currentItem: {id: -1, text: ''},
            currentLabel: {id: -1, label: ''},
            chosenRows: [],
            originalLabels: [],
            predictedLabels: [],
            nextArrowEnabled: false,
            modalEnabled: false,
            sectionComplete: false,
            labelColor: 'black',
            progressPercent: 0,
            newLabel: null,
        });
    }

    /**
     * Saves new labels by sending verified predictions to server, received new predictions back.
     */
    async train (predictedLabels, modelType) {
        const data = await this.props.postData('/data/train_and_predict', {"rows": predictedLabels, "model": modelType, "id": this.props.getOptionID()});
        console.log('response ok:', data.ok);
        if (data.ok){

            let rows = [];
            let labels = []
            let olabels = []
            for (let obj of data.labeled) {
                rows.push({id: obj["id"], text: obj["text"]});
                labels.push({id: obj["id"], label: obj["label"]});
                olabels.push({id: obj["id"], label: obj["label"]})
            }

            this.setState({
                isLoading: false,
                chosenRows: rows,
                originalLabels: olabels,
                predictedLabels: labels,
                currentItem: rows[0],
                currentLabel: labels[0],
                maxItemIndex: rows.length -1,
            });

        } else {
            this.setState({
                isLoading: false,
                currentItem: {id: -1, text: 'Failed to Load'},
                currentLabel: {id: -1, label: 'Failed to Load'},
            });
        }
    }

    /**
    * When the component mounts, we prompt the server to get the set of labels created
    * for this dataset (dataset selected via option id
    */
    async componentDidMount () {
        try {
            const predictedLabels = this.props.getLabels();
            
            // TODO: labeled dataset is empty

            await this.train(predictedLabels, 0);

            const response = await this.props.getDataWithParams('/data/get_label_set', {"id": this.props.getOptionID()});
            
            if (!response.ok) {
                throw Error(response.statusText);
            }

            const rows = response.rows;
            this.setState({
                isLoadingLabelSet: false,
                labelOptions: rows
            });
        } catch (error) {
            console.log(error);
        }
    }

    /**
     * Click function that progresses to the next prediction.
     */
    onNextArrowClick = () => {
        let nextIndex = this.state.currentItemIndex + 1;
        if (nextIndex <= this.state.maxItemIndex){
            this.multiselectRef.current.resetSelectedValues();
            this.setState({
                currentItemIndex: nextIndex,
                currentItem: this.state.chosenRows[nextIndex],
                currentLabel: this.state.predictedLabels[nextIndex],
                nextArrowEnabled: false,
                newLabel: null,
                labelColor: 'black',
            });
        }
    }

    /**
     * Click function that signifies accurate prediction. Progresses user to next prediction. 
     */
    onGoodClick = () => {
        let nextIndex = this.state.currentItemIndex + 1;
        let percent = nextIndex / (this.state.maxItemIndex + 1) * 100.0;

        if (this.state.currentItemIndex === this.state.maxItemIndex){
            this.setState({
                nextArrowEnabled: true,
                modalEnabled: true,
                labelColor: 'green',
                progressPercent: percent,
            });
        } else {
            this.setState({
                nextArrowEnabled: true,
                labelColor: 'green',
                progressPercent: percent,
            });

            this.onNextArrowClick();
        }
    }

    /**
     * Submit function that signifies amended prediction. Progresses user to next prediction. 
     */
    onNewLabelSubmit = () => {

        if (this.state.newLabel !== null) {
            let prevLabel = this.state.currentLabel;
            let itemIndex = this.state.currentItemIndex;

            prevLabel.label = this.state.newLabel;

            let nextIndex = this.state.currentItemIndex + 1;
            let percent = nextIndex / (this.state.maxItemIndex + 1) * 100.0;

            let updatedLabels = this.state.predictedLabels.slice(0, itemIndex).concat([prevLabel], this.state.predictedLabels.slice(itemIndex+1, this.state.maxItemIndex + 1));
    
            if (this.state.currentItemIndex === this.state.maxItemIndex){
                this.setState({
                    predictedLabels: updatedLabels,
                    currentLabel: prevLabel,
                    nextArrowEnabled: true,
                    modalEnabled: true,
                    labelColor: 'black',
                    progressPercent: percent,
                });
            } else {
                this.setState({
                    predictedLabels: updatedLabels,
                    currentLabel: prevLabel,
                    nextArrowEnabled: true,
                    labelColor: 'black',
                    progressPercent: percent,
                });
            }

            this.onNextArrowClick();

        }

    }

    /**
     * Callback function for next-hotkey-enabled button
     */
    handleNextButton = (event) => {
        if (event.key === 'ArrowRight' && this.state.currentItemIndex < this.state.maxItemIndex && this.state.nextArrowEnabled){
            this.onNextArrowClick();
        }
    }  

    /**
     * Callback function for yes button.
     */
    handleYesButton = (event) => {
        if (event.key === 'y') {
            this.onGoodClick();
        }
    }

    /**
     * Callback function for submit button.
     */
    handleSubmitButton = (event) => {
        if (event.key === 'Enter' && this.state.newLabel !== null) {
            this.onNewLabelSubmit();
        }
    }

    /**
     * Callback function for train button.
     */
    handleTrainAgain = (event) => {
        if (event.key === 't' && this.state.modalEnabled) {
            this.retrain();
        }
    }

    /**
     * Callback function for continue button.
     */
    handleContinue = (event) => {
        if (event.key === 'c' && this.state.modalEnabled) {
            this.closeModal();
        }
    }

    /**
     * Select function for dropdown.
     */
    onSelect = (selectedList, selectedItem) => {
        this.setState({newLabel: selectedItem.label});
    }

    /**
     * Remove function for dropdown.
     */
    onRemove = (selectedList, removedItem) => {
        this.setState({newLabel: null});
    }

    /**
     * Next submit action. Updates page UI state.
     */
    onNextSubmit = () => {
        this.props.updateState(states.results);
    }

    /**
     * Generates accuracy for a round by summing the number of unchanged predictions.
     */
    generateAccuracy = () => {
        let ac = 0;
        for (let i = 0; i < this.state.predictedLabels.length; i++){
            if (this.state.predictedLabels[i]['label'] === this.state.originalLabels[i]['label']) {
                ac += 1;
            }
        }
        let accuracy = ac/this.state.predictedLabels.length*100.0;
        return accuracy
    }

    /**
     * Prompts retraining of model and reset of Verification stage.
     */
    retrain = () => {
        // send results to server; reset state; retrain
        const fullLabels = [];

        for (let i = 0; i < this.state.predictedLabels.length; i++){
            fullLabels.push({id: this.state.predictedLabels[i].id, true_label: this.state.predictedLabels[i].label, predicted_label: this.state.originalLabels[i].label});
        }

        let accuracy = this.generateAccuracy();
        this.props.saveAccuracy(accuracy);
        this.resetState();
        this.train(fullLabels, 1); // we retrain successively
    }

    /**
     * Should be called if continue is selected; section is now complete.
     */
    closeModal = () => {
        let accuracy = this.generateAccuracy();
        this.props.saveAccuracy(accuracy);
        this.setState({
            modalEnabled: false,
            sectionComplete: true,
        });

    }   

    /**
    * Callback function for next submit action.
    */
    handleNextKeyPress = (event) => {
        if (event.key === ' ' && this.state.sectionComplete){
            // save these labels
            this.props.saveLabels(this.state.predictedLabels);
            this.onNextSubmit();
        }
    };


    render() {
        return (
            <div style={{display: 'flex', flexDirection: 'column', height: '100%', width: '100%' }}>
                <div style={{ margin: '15px'}}>
                    <b>
                        Verification
                    </b>
                </div>
                {
                    this.state.isLoading ? (
                        <div style={{height: '75%', width: '100%', justifyContent: 'flex-start', alignItems: 'center', alignContent: 'center', flexDirection: 'column'}}>
                            <Loading/>
                        </div>
                    ) : (
                    <div style={{ display: 'flex', height: '75%', width: '100%', justifyContent: 'flex-start', alignItems: 'center', flexDirection: 'column'}}>
                        <div style={{marginTop: '10px', display: 'flex', alignItems: 'center', height: '15vh'}}>
                            {/* below is for centering purposes */}
                            <NextButton
                                    buttonAvailable={false}
                                    hidden={true}
                                    handleNextButton={()=> {}}
                                    clickFunc={()=> {}}
                                    currIndex={this.state.maxItemIndex + 1}
                                    maxIndex={this.state.maxItemIndex}
                                    text={"<"}
                            />
                            {/* above is for centering purposes */}
                            <div style={{marginRight: '10px', marginLeft: '10px', width: '80vw'}}>
                                <div style={{ marginBottom: '10px', textAlign: "center"}}>
                                    {this.state.currentItem.text}
                                </div>
                                <div style={{textAlign: "center"}}>
                                    {'Label: '}
                                    <i style={{color: this.state.labelColor}}>
                                        {this.state.currentLabel.label}
                                    </i>
                                </div>
                                <div style={{ marginTop: '10px'}}> 
                                    <LinearProgress variant="determinate" value={this.state.progressPercent}/>
                                </div>
                            </div>
                            <NextButton
                                buttonAvailable={this.state.nextArrowEnabled}
                                handleNextButton={this.handleNextButton}
                                clickFunc={this.onNextArrowClick}
                                currIndex={this.state.currentItemIndex}
                                maxIndex={this.state.maxItemIndex}
                                hidden={false}
                                text={">"}
                            />
                        </div>
                        <div style={{marginTop: '10px', textAlign: "center"}}>
                            {"Is the predicted label accurate?"}
                        </div>
                        <div style={{ display: 'flex', marginTop: "25px", width: '30vw', justifyContent: 'space-between', alignItems: 'flex-start'}}>
                            <div style={{width: '15vw', widthmarginRight: '5px'}}>
                                <CallbackKeyEventButton
                                    buttonAvailable={true}
                                    clickFunc={this.onGoodClick}
                                    callBackFunc={this.handleYesButton}
                                    text={"Yes (y)"}
                                />
                            </div>
                            <div style={{width: '15vw', marginLeft: '5px'}}>
                                <div style={{marginBottom: '10px'}}>
                                <Multiselect
                                    ref={this.multiselectRef}
                                    id={"newLabel"}
                                    placeholder={"Select new label"}
                                    hidePlaceholder={true}
                                    options={this.state.labelOptions} 
                                    singleSelect={true}
                                    onSelect={this.onSelect}
                                    onRemove={this.onRemove}
                                    displayValue="label"
                                />
                            </div>
                            <CallbackKeyEventButton
                                callBackFunc={this.handleSubmitButton}
                                buttonAvailable={this.state.newLabel !== null}
                                clickFunc={this.onNewLabelSubmit}
                                text={"Submit (enter)"}
                            />
                            </div>
                        </div>
                        <div hidden={!this.state.modalEnabled} style={{marginTop: '25px'}}>
                            <div>
                                <div>
                                    {"The accuracy of the predictions was "}{(this.state.modalEnabled) ? this.generateAccuracy(): 0}{"%. Would you like to train again or continue?"}
                                </div>
                                <div style={{ display: 'flex', marginTop: "25px", width: '35vw', justifyContent: 'space-between', alignItems: 'center'}}>
                                    <CallbackKeyEventButton
                                        callBackFunc={this.handleTrainAgain}
                                        buttonAvailable={this.state.modalEnabled}
                                        clickFunc={this.retrain}
                                        text={"Train again (t)"}
                                    />
                                    <CallbackKeyEventButton
                                        callBackFunc={this.handleContinue}
                                        buttonAvailable={this.state.modalEnabled}
                                        clickFunc={this.closeModal}
                                        text={"Continue (c)"}
                                    />
                                </div>
                            </div>
                        </div>
                    </div>
                )}
                <div style={{margin: '15px', width:'100%'}}>
                    <div style={{alignItems:'end'}}>
                        <CallbackKeyEventButton
                            callBackFunc={this.handleNextKeyPress}
                            buttonAvailable={this.state.sectionComplete}
                            clickFunc={this.onNextSubmit}
                            text={'Next (space)'}
                        />
                    </div>
                </div>
                <div style={{ margin: '15px'}}>
                    <LinearProgress variant="determinate" value={progress}/>
                </div>
            </div>
        )
    }

}

export default Verification;