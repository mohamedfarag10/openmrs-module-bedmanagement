import React from 'react';
import PropTypes from 'prop-types';
import axios from 'axios';

import UrlHelper from 'utilities/urlHelper';

require('./bedTypeForm.css');
export default class AddEditBedType extends React.Component {
    constructor(props, context) {
        super(props, context);

        this.bedType = props.bedTypeFunctions.getBedTypeByUuid(props.bedTypeUuid);
        this.state = {
            uuid: this.bedType != null ? this.bedType.uuid : null,
            name: this.bedType != null ? this.bedType.name : '',
            displayName: this.bedType != null ? this.bedType.displayName : '',
            description:
                this.bedType != null && this.bedType.description != null ? this.bedType.description : '',
            disableSubmit: false
        };

        this.intl = context.intl;
        this.urlHelper = new UrlHelper();
        this.onChangeNameField = this.onChangeNameField.bind(this);
        this.onChangeDisplayNameField = this.onChangeDisplayNameField.bind(this);
        this.onChangeDescription = this.onChangeDescription.bind(this);
        this.cancelEventHandler = this.cancelEventHandler.bind(this);
        this.onSubmitHandler = this.onSubmitHandler.bind(this);
    }

    onChangeNameField() {
        this.setState({name: this.nameField.value});
    }

    onChangeDisplayNameField() {
        this.setState({displayName: this.displayNameField.value});
    }

    onChangeDescription() {
        this.setState({description: this.descriptionField.value});
    }

    cancelEventHandler(event) {
        event.preventDefault();
        this.props.bedTypeFunctions.setState({activePage: 'listing', pageData: {}});
    }

    onSubmitHandler(event) {
        event.preventDefault();
        this.setState({disableSubmit: true});
        const self = this;
        const parameters = {
            name: this.state.name,
            displayName: this.state.displayName,
            description: this.state.description
        };

        axios({
            method: 'post',
            url:
                this.urlHelper.apiBaseUrl() +
                (this.state.uuid != null ? '/bedtype/' + this.state.uuid : '/bedtype'),
            headers: {'Content-Type': 'application/json'},
            data: parameters
        })
            .then(function(response) {
                self.setState({uuid: response.data.uuid, disableSubmit: false});
                self.props.bedTypeFunctions.fetchBedTypes();
                const saveSuccessMsg = self.intl.formatMessage({id: 'BED_TYPE_SAVE_MSG'});
                self.props.bedTypeFunctions.notify('success', saveSuccessMsg);
                self.props.bedTypeFunctions.setState({activePage: 'listing', pageData: {}});
            })
            .catch(function(errorResponse) {
                self.setState({disableSubmit: false});
                const error = errorResponse.response.data
                    ? errorResponse.response.data.error
                    : errorResponse;
                self.props.bedTypeFunctions.notify('error', error.message.replace(/\[|\]/g, ''));
            });
    }

    render() {
        this.intl = this.context.intl;
        const isAdd = this.props.operation == 'add';
        const saving = this.state.disableSubmit;

        return (
            <div className="bed-type-form-page">
                {/* Breadcrumb */}
                <div className="btf-breadcrumb">
                    <span>Clinical Settings</span>
                    <i className="fa fa-chevron-right" />
                    <span>Bed Configuration</span>
                    <i className="fa fa-chevron-right" />
                    <span className="btf-breadcrumb-active">
                        {isAdd ? 'Add Bed Type' : 'Edit Bed Type'}
                    </span>
                </div>

                {/* Main card */}
                <div className="btf-card">
                    <h2 className="btf-title">
                        {isAdd ? 'Add Bed Type' : 'Edit Bed Type'}
                    </h2>
                    <p className="btf-subtitle">
                        Define clinical parameters and naming conventions for new hospital beds.
                    </p>

                    <form onSubmit={this.onSubmitHandler} className="btf-form">
                        {/* Bed Type */}
                        <div className="btf-field">
                            <label className="btf-label" htmlFor="name-field">
                                {this.intl.formatMessage({id: 'BED_TYPE'})}
                                <span className="btf-required"> *</span>
                            </label>
                            <input
                                id="name-field"
                                type="text"
                                className="btf-input"
                                value={this.state.name}
                                placeholder="e.g., ICU_BED_VENT"
                                ref={(input) => { this.nameField = input; }}
                                required={true}
                                onChange={this.onChangeNameField}
                            />
                            <span className="btf-hint">
                                Unique internal system identifier (Alpha-numeric, no spaces).
                            </span>
                        </div>

                        {/* Display Name */}
                        <div className="btf-field">
                            <label className="btf-label" htmlFor="display-name-field">
                                {this.intl.formatMessage({id: 'DISPLAY_NAME'})}
                                <span className="btf-required"> *</span>
                            </label>
                            <input
                                id="display-name-field"
                                type="text"
                                className="btf-input"
                                value={this.state.displayName}
                                placeholder="e.g., Intensive Care Unit Bed (Ventilator Capable)"
                                ref={(input) => { this.displayNameField = input; }}
                                required={true}
                                onChange={this.onChangeDisplayNameField}
                            />
                            <span className="btf-hint">
                                The name medical staff will see in the clinical dashboards.
                            </span>
                        </div>

                        {/* Description */}
                        <div className="btf-field">
                            <label className="btf-label" htmlFor="description-field">
                                {this.intl.formatMessage({id: 'DESCRIPTION'})}:
                            </label>
                            <textarea
                                id="description-field"
                                className="btf-textarea"
                                value={this.state.description}
                                placeholder="Describe the specific use case, equipment requirements, or patient eligibility for this bed type..."
                                ref={(input) => { this.descriptionField = input; }}
                                onChange={this.onChangeDescription}
                                rows={4}
                            />
                        </div>

                        {/* Action buttons */}
                        <div className="btf-actions">
                            <button
                                type="button"
                                onClick={this.cancelEventHandler}
                                className="btf-btn btf-btn-cancel">
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={saving}
                                className="btf-btn btf-btn-save">
                                <i className="fa fa-floppy-o" aria-hidden="true" />
                                {saving ? ' Saving…' : ' Save Bed Type'}
                            </button>
                        </div>
                    </form>
                </div>

                {/* Info cards */}
                <div className="btf-info-row">
                    <div className="btf-info-card">
                        <div className="btf-info-icon">
                            <i className="fa fa-info-circle" />
                        </div>
                        <div>
                            <div className="btf-info-title">Standardization</div>
                            <div className="btf-info-desc">
                                Consistent bed types help in accurate patient flow reporting across departments.
                            </div>
                        </div>
                    </div>
                    <div className="btf-info-card">
                        <div className="btf-info-icon">
                            <i className="fa fa-eye" />
                        </div>
                        <div>
                            <div className="btf-info-title">Live Preview</div>
                            <div className="btf-info-desc">
                                Display names are visible on the floor map and admission search screens.
                            </div>
                        </div>
                    </div>
                    <div className="btf-info-card">
                        <div className="btf-info-icon">
                            <i className="fa fa-history" />
                        </div>
                        <div>
                            <div className="btf-info-title">Audit Logging</div>
                            <div className="btf-info-desc">
                                Creation of new bed types is tracked for administrative compliance auditing.
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

AddEditBedType.propTypes = {
    bedTypeUuid: PropTypes.string,
    operation: PropTypes.string,
    bedTypeFunctions: PropTypes.object.isRequired
};

AddEditBedType.contextTypes = {
    intl: PropTypes.object
};
