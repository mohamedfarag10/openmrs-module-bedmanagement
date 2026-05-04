import React from 'react';
import PropTypes from 'prop-types';
import axios from 'axios';

import UrlHelper from 'utilities/urlHelper';

require('./admissionLocationForm.css');
export default class SetBedLayout extends React.Component {
    constructor(props, context) {
        super(props, context);
        this.initData = this.initData.bind(this);
        this.initData();

        this.state = {
            locationUuid: this.admissionLocation.uuid,
            row: props.row,
            column: props.column,
            disableSubmit: false,
            rowFieldError: '',
            columnFieldError: ''
        };

        this.intl = context.intl;
        this.urlHelper = new UrlHelper();
        this.onChangeColumnField = this.onChangeColumnField.bind(this);
        this.onChangeRowField = this.onChangeRowField.bind(this);
        this.cancelEventHandler = this.cancelEventHandler.bind(this);
        this.onSubmitHandler = this.onSubmitHandler.bind(this);
    }

    componentWillUpdate(nextProps, nextState) {
        this.initData();
    }

    initData() {
        this.admissionLocation = this.props.admissionLocationFunctions.getAdmissionLocationByUuid(
            this.props.activeUuid
        );
    }

    onChangeRowField() {
        if (this.rowField.value >= 1) {
            this.setState({rowFieldError: '', row: Number(this.rowField.value)});
        } else {
            let errorMsg = '';
            if (this.rowField.value == '') {
                errorMsg = this.intl.formatMessage({id: 'ROW_REQUIRED_MSG'});
            } else if (this.rowField.value <= 0) {
                errorMsg = this.intl.formatMessage({id: 'ROW_SHOULD_GREATER_THAN_ZERO'});
            }
            this.setState({rowFieldError: errorMsg, row: this.rowField.value});
        }
    }

    onChangeColumnField() {
        if (this.columnField.value >= 1 && this.columnField.value <= 10) {
            this.setState({columnFieldError: '', column: Number(this.columnField.value)});
        } else {
            let errorMsg = '';
            if (this.columnField.value == '') {
                errorMsg = this.intl.formatMessage({id: 'COLUMN_REQUIRED_MSG'});
            } else if (this.columnField.value <= 0 || this.columnField.value > 10) {
                errorMsg = this.intl.formatMessage({id: 'COLUMN_SHOULD_GREATER_THAN_ZERO'});
            }
            this.setState({columnFieldError: errorMsg, column: this.columnField.value});
        }
    }

    cancelEventHandler(event) {
        event.preventDefault();
        this.props.admissionLocationFunctions.setState({
            activePage: 'listing',
            pageData: {},
            activeUuid: this.props.activeUuid
        });
    }

    onSubmitHandler(event) {
        event.preventDefault();
        if (this.state.rowFieldError != '' || this.state.columnFieldError != '') {
            const errorMsg = this.intl.formatMessage({id: 'FIX_ERROR_MSG'});
            this.props.admissionLocationFunctions.notify('error', errorMsg);
            return;
        }

        this.setState({disableSubmit: true});
        const self = this;
        const parameters = {
            bedLayout: {row: this.state.row, column: this.state.column}
        };

        axios({
            method: 'post',
            url: this.urlHelper.apiBaseUrl() + '/admissionLocation/' + this.state.locationUuid,
            params: {v: 'layout'},
            headers: {'Content-Type': 'application/json'},
            data: parameters
        })
            .then(function() {
                self.setState({disableSubmit: false});
                const successMsg = self.intl.formatMessage({id: 'BED_LAYOUT_SAVE_MSG'});
                self.props.admissionLocationFunctions.notify('success', successMsg);
                self.props.admissionLocationFunctions.setState({
                    activePage: 'listing',
                    activeUuid: self.props.activeUuid
                });
            })
            .catch(function(errorResponse) {
                self.setState({disableSubmit: false});
                const error = errorResponse.response.data ? errorResponse.response.data.error : errorResponse;
                self.props.admissionLocationFunctions.notify('error', error.message.replace(/\[|\]/g, ''));
            });
    }

    render() {
        return (
            <div className="main-container">
                <div className="bed-form-page">
                    <div className="bed-form-page-header">
                        <div style={{display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px'}}>
                            <i className="fa fa-th" aria-hidden="true" style={{fontSize: '20px', color: '#007d79'}} />
                            <h1 className="bed-form-title" style={{margin: 0}}>
                                {this.intl.formatMessage({id: 'SET_LAYOUT'})}
                            </h1>
                            <span className="bed-form-badge">Configuration</span>
                        </div>
                    </div>

                    <div className="bed-form-card">
                        <form onSubmit={this.onSubmitHandler}>
                            <div className="bed-form-field bed-form-field-full">
                                <div className="bed-form-location-display">
                                    <i className="fa fa-map-marker" aria-hidden="true" style={{color: '#007d79', marginRight: '8px'}} />
                                    <div>
                                        <div className="bed-form-location-label">
                                            {this.intl.formatMessage({id: 'LOCATION'})}
                                        </div>
                                        <div className="bed-form-location-name">{this.admissionLocation.name}</div>
                                    </div>
                                </div>
                            </div>

                            <div className="bed-form-row">
                                <div className="bed-form-field">
                                    <label className="bed-form-label">
                                        {this.intl.formatMessage({id: 'ROWS'})}
                                    </label>
                                    <input
                                        type="number"
                                        className="bed-form-input"
                                        value={this.state.row}
                                        ref={(input) => {this.rowField = input;}}
                                        required={true}
                                        onChange={this.onChangeRowField}
                                        placeholder="e.g. 4"
                                        id="row-field"
                                    />
                                    {this.state.rowFieldError != '' && (
                                        <p className="bed-form-error">{this.state.rowFieldError}</p>
                                    )}
                                </div>
                                <div className="bed-form-field">
                                    <label className="bed-form-label">
                                        {this.intl.formatMessage({id: 'COLUMNS'})}
                                    </label>
                                    <input
                                        type="number"
                                        className="bed-form-input"
                                        value={this.state.column}
                                        ref={(input) => {this.columnField = input;}}
                                        required={true}
                                        onChange={this.onChangeColumnField}
                                        placeholder="e.g. 5"
                                        id="column-field"
                                    />
                                    {this.state.columnFieldError != '' && (
                                        <p className="bed-form-error">{this.state.columnFieldError}</p>
                                    )}
                                </div>
                            </div>

                            <div className="bed-form-info-box">
                                <i className="fa fa-info-circle" aria-hidden="true" />
                                <span>
                                    Defining rows and columns will create a grid structure for bed management.
                                    Ensure the count matches the physical capacity of the room.
                                </span>
                            </div>

                            <div className="bed-form-actions">
                                <button
                                    type="button"
                                    className="bed-form-cancel-btn"
                                    onClick={this.cancelEventHandler}>
                                    {this.intl.formatMessage({id: 'CANCEL'})}
                                </button>
                                <button
                                    type="submit"
                                    className="bed-form-save-btn"
                                    disabled={this.state.disableSubmit}>
                                    {this.state.disableSubmit
                                        ? this.intl.formatMessage({id: 'SAVING'})
                                        : this.intl.formatMessage({id: 'SAVE_LAYOUT'})}
                                </button>
                            </div>
                        </form>
                    </div>

                    <p className="bed-form-audit-note">
                        Configuration changes are logged for clinical audit purposes.
                    </p>
                </div>
            </div>
        );
    }
}

SetBedLayout.propTypes = {
    row: PropTypes.number,
    column: PropTypes.number,
    activeUuid: PropTypes.string,
    admissionLocationFunctions: PropTypes.object.isRequired
};

SetBedLayout.contextTypes = {
    intl: PropTypes.object
};