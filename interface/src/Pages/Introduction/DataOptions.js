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
            selectedValues: null,
        };
    }

    componentDidUpdate(prevProps) {
        if (this.props.dataOptions !== prevProps.dataOptions
             || this.props.disabled !== prevProps.disabled) {
            this.setState({
                options: this.props.dataOptions,
                disabled: this.props.disabled,
                selectedValues: null, // reset selection when data options change
            });


        }
    }

    /**
    * Dropdown selection.
    */
    onSelect = (_, selectedItem) => {
        this.props.onSelect(_, selectedItem);
        this.setState({
            selectedValues: [selectedItem],
        });
    }

    /**
    * Dropdown removal.
    */
    onRemove = (_, selectedItem) => {
        this.props.onRemove(_, selectedItem);
        this.setState({
            selectedValues: null,
        });
    }

    render() {
        return (
            <Multiselect
                disable={this.state.disabled}
                placeholder={this.props.displayText}
                selectedValues={this.state.selectedValues}
                options={this.state.options}
                singleSelect={true}
                displayValue={this.props.displayValue}
                onSelect={this.onSelect}
                onRemove={this.onRemove}
            />
        );
      }
}
