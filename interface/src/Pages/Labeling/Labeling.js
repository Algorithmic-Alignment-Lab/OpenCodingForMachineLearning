import React, {Component} from 'react';

import states from './../../Constants/States';
// import progress from './../../Constants/States';
import Button from '@material-ui/core/Button';
import LinearProgress from '@material-ui/core/LinearProgress';

const progress = 60;

class Labeling extends Component {
    constructor(props) {
        super(props);
    }

    onNextSubmit = () => {
        this.props.updateState(states.verification);
    }

    render() {
        return (
        <div>
            <div>
                Labeling
            </div>
            <LinearProgress variant="determinate" value={progress}/>
            <Button onClick={this.onNextSubmit}>
                Next
            </Button>
        </div>);
    }
}

export default Labeling;