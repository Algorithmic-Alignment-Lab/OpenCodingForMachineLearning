import React, {Component} from 'react';

import states from './../../Constants/States';
// import progress from './../../Constants/States';
import KeyEventButton from '../../Custom/KeyEventButton';
import CallbackKeyEventButton from '../../Custom/CallbackKeyEventButton';
import NextEventButton from '../../Custom/NextEventButton';
import NextButton from './NextButton';
import Button from '@material-ui/core/Button';
import LinearProgress from '@material-ui/core/LinearProgress';
import Multiselect from 'multiselect-react-dropdown';

const progress = 80;

// TODO: hot keys for retrain/continue prompt
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
            // newLabelVisible: false,
            nextArrowEnabled: false,
            modalEnabled: false,
            sectionComplete: false,
            labelColor: 'black',
            progressPercent: 0,
            newLabel: null,
        };
    }

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
            // newLabelVisible: false,
            nextArrowEnabled: false,
            modalEnabled: false,
            sectionComplete: false,
            labelColor: 'black',
            progressPercent: 0,
            newLabel: null,
        });
    }

    // Responsible for saving new labels and then finetuning with said labels
    // Response is a number (20) predictions made after finetuning
    async train (predictedLabels, modelType) {
        const data = await this.props.postData('/data/train_and_predict', {"rows": predictedLabels, "model": modelType, "id": this.props.getOptionID()});
        console.log('response ok:', data.ok);
        if (data.ok){
            // const data = await this.props.getDataWithParams('/data/get_verification_data', {"id": this.props.getOptionID()});
            console.log("response recieved: " + data.labeled);
            let rows = [];
            let labels = []
            let olabels = []
            for (let obj of data.labeled) {
                rows.push({id: obj["id"], text: obj["text"]});
                labels.push({id: obj["id"], label: obj["label"]});
                olabels.push({id: obj["id"], label: obj["label"]})
            }
            console.log('rows:', rows);
            console.log('labels:', labels);
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

    async componentDidMount () {
        try {
            const predictedLabels = this.props.getLabels();
            // TODO: labeled dataset is empty
            console.log('previously saved labels:', predictedLabels);

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

    onNextArrowClick = () => {

        console.log("clicked next arrow");
        console.log("max index:", this.state.maxItemIndex);
        console.log("curr index:", this.state.currentItemIndex);
        let nextIndex = this.state.currentItemIndex + 1;
        let number = nextIndex + 1;
        let maxNumber = this.state.maxItemIndex + 1;
        // let percent = nextIndex / this.state.maxItemIndex * 100.0;
        console.log("next index:", nextIndex);
        console.log("-----------------------");

        if (nextIndex <= this.state.maxItemIndex){
            this.multiselectRef.current.resetSelectedValues();
            this.setState({
                currentItemIndex: nextIndex,
                currentItem: this.state.chosenRows[nextIndex],
                currentLabel: this.state.predictedLabels[nextIndex],
                // newLabelVisible: false,
                nextArrowEnabled: false,
                newLabel: null,
                labelColor: 'black',
                // progressPercent: percent,
                
            });
        }
    }

    onGoodClick = () => {

        // goodItem.accuracy = 1;

        // let updatedRows = this.state.chosenRows.slice(0, itemIndex).concat([goodItem], this.state.chosenRows.slice(itemIndex+1, this.state.maxItemIndex + 1));
        
        let nextIndex = this.state.currentItemIndex + 1;
        let percent = nextIndex / (this.state.maxItemIndex + 1) * 100.0;

        if (this.state.currentItemIndex === this.state.maxItemIndex){
            // if (this.state.modalEnabled){ // sus fix for not allowing user to update accuracy multiple times at the end
            //     accuracy -= 1;
            // }

            this.setState({
                // chosenRows: updatedRows,
                nextArrowEnabled: true,
                modalEnabled: true,
                labelColor: 'green',
                progressPercent: percent,
            });
        } else {
            this.setState({
                // chosenRows: updatedRows,
                nextArrowEnabled: true,
                labelColor: 'green',
                progressPercent: percent,
            });

            this.onNextArrowClick();
        }
    }

    // onBadClick = () => {

    //     this.setState({
    //         labelColor: 'red'
    //     });

    //     this.openNewLabel();
    // }

    // openNewLabel = () => {
    //     document.getElementById("newLabel").focus();
    //     this.setState({newLabelVisible: true});
    // }

    onNewLabelSubmit = () => {
        console.log("new label: %s", this.state.newLabel);
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

    handleNextButton = (event) => {
        if (event.key === 'ArrowRight' && this.state.currentItemIndex < this.state.maxItemIndex && this.state.nextArrowEnabled){
            this.onNextArrowClick();
        }
    }

    handleSubmitButton = (event) => {
        if (event.key === 'Enter') {
            this.onNewLabelSubmit();
        }
    }

    handleTrainAgain = (event) => {
        if (event.key === 't' && this.state.modalEnabled) {
            
            this.retrain();
        }
    }

    handleContinue = (event) => {
        if (event.key === 'c' && this.state.modalEnabled) {
            this.closeModal();
        }
    }

    onSelect = (selectedList, selectedItem) => {
        this.setState({newLabel: selectedItem.label});
    }

    onRemove = (selectedList, removedItem) => {
        this.setState({newLabel: null});
    }

    onNextSubmit = () => {
        this.props.updateState(states.results);
    }

    generateAccuracy = () => {
        let ac = 0;
        for (let i = 0; i < this.state.predictedLabels.length; i++){
            // console.log('predicted: ' + this.state.predictedLabels[i]['label']);
            // console.log('actual: ' + this.state.originalLabels[i]['label']);
            if (this.state.predictedLabels[i]['label'] === this.state.originalLabels[i]['label']) {
                ac += 1;
                // console.log('accurate!');
            }
        }
        let accuracy = ac/this.state.predictedLabels.length*100.0;
        return accuracy
    }

    retrain = () => {
        // send results to server; reset state; retrain
        const predictedLabels = this.state.predictedLabels;
        let accuracy = this.generateAccuracy();
        this.props.saveAccuracy(accuracy);
        this.resetState();
        this.train(predictedLabels, 1); // we retrain successively
    }

    closeModal = () => {
        let accuracy = this.generateAccuracy();
        this.props.saveAccuracy(accuracy);
        console.log('calling close modal');
        // close modal; activate next button
        this.setState({
            modalEnabled: false,
            sectionComplete: true,
        });

    }

    handleNextKeyPress = (event) => {
        console.log('trying to move to next (section complete):' + this.state.sectionComplete);
        // TODO: prompt training, prediction, and labeling of the rest of the dataset (perhaps results is responsible for this)
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
                    Verification
                </div>
                {
                    this.state.isLoading ? (
                        <div style={{height: '75%', width: '100%', justifyContent: 'flex-start', alignItems: 'center', alignContent: 'center', flexDirection: 'column'}}>
                            Loading ...
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
                                <KeyEventButton
                                    buttonAvailable={true}
                                    clickFunc={this.onGoodClick}
                                    keyMatch={"y"}
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
                                    options={this.state.labelOptions} // Options to display in the dropdown
                                    singleSelect={true}
                                    onSelect={this.onSelect} // Function will trigger on select event
                                    onRemove={this.onRemove} // Function will trigger on remove event
                                    displayValue="label" // Property name to display in the dropdown options
                                />
                            </div>
                            <CallbackKeyEventButton
                                callBackFunc={this.handleSubmitButton}
                                buttonAvailable={true}
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
                        <NextEventButton 
                            callBackFunc={this.handleNextKeyPress}
                            buttonAvailable={this.state.sectionComplete}
                            clickFunc={this.onNextSubmit}
                            text={'Next (space)'}
                            keyMatch={' '}
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