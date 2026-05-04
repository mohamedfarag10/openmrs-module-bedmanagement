import React from 'react';
import PropTypes from 'prop-types';
import axios from 'axios';

import UrlHelper from 'utilities/urlHelper';

require('./admissionLocationForm.css');
export default class AddEditAdmissionLocation extends React.Component {
    constructor(props, context) {
        super(props, context);

        this.urlHelper = new UrlHelper();
        this.initData = this.initData.bind(this);
        this.initData();

        this.state = {
            uuid: this.admissionLocation != null ? this.admissionLocation.uuid : null,
            name: this.admissionLocation != null ? this.admissionLocation.name : '',
            description:
                this.admissionLocation != null && this.admissionLocation.description != null
                    ? this.admissionLocation.description
                    : '',
            parentAdmissionLocationUuid: this.parentAdmissionLocationUuid,
            disableSubmit: false
        };

        this.intl = context.intl;
        this.onChangeNameField = this.onChangeNameField.bind(this);
        this.onChangeDescriptionField = this.onChangeDescriptionField.bind(this);
        this.onSelectParentLocation = this.onSelectParentLocation.bind(this);
        this.cancelEventHandler = this.cancelEventHandler.bind(this);
        this.onSubmitHandler = this.onSubmitHandler.bind(this);
    }

    initData() {
        this.admissionLocation =
            this.props.operation == 'add'
                ? null
                : this.props.admissionLocationFunctions.getAdmissionLocationByUuid(this.props.activeUuid);
        this.parentAdmissionLocationUuid =
            this.props.operation == 'add'
                ? this.props.activeUuid
                : this.admissionLocation != null ? this.admissionLocation.parentAdmissionLocationUuid : null;
        this.visitLocations = this.props.admissionLocationFunctions.getVisitLocations();
        this.parentAdmissionLocation =
            this.parentAdmissionLocationUuid != null
                ? this.props.admissionLocationFunctions.getAdmissionLocationByUuid(this.parentAdmissionLocationUuid)
                : null;
    }

    componentWillUpdate(nextProps, nextState) {
        this.initData();
    }

    onChangeNameField() {
        this.setState({ name: this.nameField.value });
    }

    onChangeDescriptionField() {
        this.setState({ description: this.descriptionField.value });
    }

    onSelectParentLocation() {
        this.setState({
            parentAdmissionLocationUuid: this.parentSelector.value != '' ? this.parentSelector.value : null
        });
    }

    cancelEventHandler(event) {
        event.preventDefault();
        this.props.admissionLocationFunctions.setState({
            activePage: 'listing',
            pageData: {},
            activeUuid: this.parentAdmissionLocation != null ? this.parentAdmissionLocation.uuid : null
        });
    }

    onSubmitHandler(event) {
        event.preventDefault();
        this.setState({ disableSubmit: true });
        const self = this;
        const parameters = {
            parentLocationUuid: this.state.parentAdmissionLocationUuid,
            name: this.state.name,
            description: this.state.description
        };

        axios({
            method: 'post',
            url:
                this.urlHelper.apiBaseUrl() +
                (this.state.uuid != null ? '/admissionLocation/' + this.state.uuid : '/admissionLocation'),
            headers: {'Content-Type': 'application/json'},
            data: parameters
        })
            .then(function(response) {
                self.setState({ disableSubmit: false });
                self.props.admissionLocationFunctions.setState({
                    activeUuid: response.data.ward.uuid
                });
                const successMsg = self.intl.formatMessage({id: 'ADMISSION_LOCATION_SAVE_MSG'});
                self.props.admissionLocationFunctions.notify('success', successMsg);
                self.props.admissionLocationFunctions.reFetchAllAdmissionLocations();
                self.props.admissionLocationFunctions.setState({
                    activePage: 'listing',
                    pageData: {},
                    activeUuid: self.parentAdmissionLocation != null ? self.parentAdmissionLocation.uuid : null
                });
            })
            .catch(function(errorResponse) {
                self.setState({ disableSubmit: false });
                const error = errorResponse.response.data ? errorResponse.response.data.error : errorResponse;
                self.props.admissionLocationFunctions.notify('error', error.message.replace(/\[|\]/g, ''));
            });
    }

    render() {
        const isEdit = this.props.operation !== 'add';
        const entityLabel = this.intl.formatMessage({
            id: this.parentAdmissionLocation == null ? 'ADMISSION_LOCATION' : 'WARD'
        });

        return (
            <div className="main-container">
                <div className="bed-form-page">
                    <div className="bed-form-page-header">
                        <h1 className="bed-form-title">
                            {isEdit ? this.intl.formatMessage({id: 'EDIT'}) : this.intl.formatMessage({id: 'ADD'})}{' '}
                            {entityLabel}
                        </h1>
                        <p className="bed-form-subtitle">
                            {isEdit
                                ? this.intl.formatMessage({id: 'EDIT_ADMISSION_LOCATION_SUBTITLE'})
                                : this.intl.formatMessage({id: 'ADD_ADMISSION_LOCATION_SUBTITLE'})}
                        </p>
                    </div>

                    <div className="bed-form-card">
                        <form onSubmit={this.onSubmitHandler}>
                            <div className="bed-form-field bed-form-field-full">
                                <label className="bed-form-label">
                                    {this.intl.formatMessage({id: 'PARENT_LOCATION'})}
                                </label>
                                {this.parentAdmissionLocation != null ? (
                                    <div className="bed-form-static">{this.parentAdmissionLocation.name}</div>
                                ) : (
                                    <select
                                        className="bed-form-select"
                                        name="parent-location"
                                        onChange={this.onSelectParentLocation}
                                        ref={(dropDown) => (this.parentSelector = dropDown)}
                                        value={
                                            this.state.parentAdmissionLocationUuid != null
                                                ? this.state.parentAdmissionLocationUuid
                                                : ''
                                        }>
                                        <option value="">{this.intl.formatMessage({id: 'NONE'})}</option>
                                        {Object.keys(this.visitLocations).map((key) => (
                                            <option key={key} value={this.visitLocations[key].uuid}>
                                                {this.visitLocations[key].name}
                                            </option>
                                        ))}
                                    </select>
                                )}
                            </div>

                            <div className="bed-form-field bed-form-field-full">
                                <label className="bed-form-label">
                                    {this.intl.formatMessage({id: 'NAME'})}
                                </label>
                                <input
                                    type="text"
                                    className="bed-form-input"
                                    onChange={this.onChangeNameField}
                                    value={this.state.name}
                                    required={true}
                                    ref={(input) => { this.nameField = input; }}
                                />
                            </div>

                            <div className="bed-form-field bed-form-field-full">
                                <label className="bed-form-label">
                                    {this.intl.formatMessage({id: 'DESCRIPTION'})}
                                </label>
                                <textarea
                                    className="bed-form-textarea"
                                    name="description"
                                    rows="4"
                                    onChange={this.onChangeDescriptionField}
                                    value={this.state.description}
                                    ref={(textArea) => (this.descriptionField = textArea)}
                                />
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
                                        : this.intl.formatMessage({id: 'SAVE_CHANGES'})}
                                </button>
                            </div>
                        </form>
                    </div>

                    <div className="bed-form-info-cards">
                        <div className="bed-form-info-card">
                            <div className="bed-form-info-icon-wrap">
                                <i className="fa fa-map-marker bed-form-info-icon" aria-hidden="true" />
                            </div>
                            <div className="bed-form-info-content">
                                <div className="bed-form-info-title">{this.intl.formatMessage({id: 'LOCATION'})}</div>
                                <div className="bed-form-info-text">{this.intl.formatMessage({id: 'LOCATION_INFO_TEXT'})}</div>
                            </div>
                        </div>
                        <div className="bed-form-info-card">
                            <div className="bed-form-info-icon-wrap">
                                <i className="fa fa-history bed-form-info-icon" aria-hidden="true" />
                            </div>
                            <div className="bed-form-info-content">
                                <div className="bed-form-info-title">{this.intl.formatMessage({id: 'AUDIT_TRAIL'})}</div>
                                <div className="bed-form-info-text">{this.intl.formatMessage({id: 'AUDIT_TRAIL_TEXT'})}</div>
                            </div>
                        </div>
                        <div className="bed-form-info-card">
                            <div className="bed-form-info-icon-wrap">
                                <i className="fa fa-key bed-form-info-icon" aria-hidden="true" />
                            </div>
                            <div className="bed-form-info-content">
                                <div className="bed-form-info-title">{this.intl.formatMessage({id: 'PERMISSIONS'})}</div>
                                <div className="bed-form-info-text">{this.intl.formatMessage({id: 'PERMISSIONS_TEXT'})}</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

AddEditAdmissionLocation.defaultProps = {
    activeUuid: null,
    operation: 'add'
};

AddEditAdmissionLocation.propTypes = {
    activeUuid: PropTypes.string,
    operation: PropTypes.string,
    admissionLocationFunctions: PropTypes.object.isRequired
};

AddEditAdmissionLocation.contextTypes = {
    intl: PropTypes.object
};
