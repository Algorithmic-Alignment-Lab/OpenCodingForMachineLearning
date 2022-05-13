import React, { Component, useEffect, useState } from 'react';

import Multiselect from 'multiselect-react-dropdown';

/**
* Single-select drop-down for populating dataset options.
*/
export default class DataOptions extends Component {

    constructor() {
        super();
        this.state = {
            options: [],
        };
    }

    componentDidUpdate(prevProps) {
        console.log('component updated');
        if (this.props.dataOptions !== prevProps.dataOptions) {
            console.log('prop data:', this.props.dataOptions)
            this.setState({
                options: this.props.dataOptions
            });
        }
    }

    render() {
        return (
            <Multiselect
                placeholder={"Select data set"}
                options={this.state.options}
                singleSelect={true}
                displayValue="text"
                onSelect={this.props.onSelect}
                onRemove={this.props.onRemove}
            />
        );
      }
}
