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
            description: this.bedType != null && this.bedType.description != null ? this.bedType.description : '',
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
        this.setState({ name: this.nameField.value });
    }

    onChangeDisplayNameField() {
        this.setState({ displayName: this.displayNameField.value });
    }

    onChangeDescription() {
        this.setState({ description: this.descriptionField.value });
    }

    cancelEventHandler(event) {
        event.preventDefault();
        this.props.bedTypeFunctions.setState({
            activePage: 'listing',
            pageData: {}
        });
    }

    onSubmitHandler(event) {
        event.preventDefault();
        this.setState({ disableSubmit: true });

        const self = this;
        const parameters = {
            name: this.state.name,
            displayName: this.state.displayName,
            description: this.state.description
        };

        axios({
            method: 'post',
            url: this.urlHelper.apiBaseUrl() + (this.state.uuid != null ? '/bedtype/' + this.state.uuid : '/bedtype'),
            headers: {'Content-Type': 'application/json'},
            data: parameters
        })
            .then(function(response) {
                self.setState({ uuid: response.data.uuid, disableSubmit: false });
                self.props.bedTypeFunctions.fetchBedTypes();
                const saveSuccessMsg = self.intl.formatMessage({id: 'BED_TYPE_SAVE_MSG'});
                self.props.bedTypeFunctions.notify('success', saveSuccessMsg);
                self.props.bedTypeFunctions.setState({ activePage: 'listing', pageData: {} });
            })
            .catch(function(errorResponse) {
                self.setState({ disableSubmit: false });
                const error = errorResponse.response.data ? errorResponse.response.data.error : errorResponse;
                self.props.bedTypeFunctions.notify('error', error.message.replace(/\[|\]/g, ''));
            });
    }

    render() {
        const isEdit = this.props.operation !== 'add';

        return (
            <div className="bed-form-page">
                <div className="bed-form-page-header">
                    <h1 className="bed-form-title">
                        {isEdit
                            ? this.intl.formatMessage({id: 'EDIT_BED_TYPE_TITLE'})
                            : this.intl.formatMessage({id: 'ADD_BED_TYPE_TITLE'})}
                    </h1>
                    <p className="bed-form-subtitle">
                        {isEdit
                            ? this.intl.formatMessage({id: 'EDIT_BED_TYPE_SUBTITLE'})
                            : this.intl.formatMessage({id: 'ADD_BED_TYPE_SUBTITLE'})}
                    </p>
                </div>

                <div className="bed-form-card">
                    <form onSubmit={this.onSubmitHandler}>
                        <div className="bed-form-row">
                            <div className="bed-form-field">
                                <label className="bed-form-label">
                                    {this.intl.formatMessage({id: 'BED_TYPE'})}
                                </label>
                                <input
                                    type="text"
                                    className="bed-form-input"
                                    value={this.state.name}
                                    ref={(input) => { this.nameField = input; }}
                                    required={true}
                                    onChange={this.onChangeNameField}
                                    id="name-field"
                                />
                            </div>
                            <div className="bed-form-field">
                                <label className="bed-form-label">
                                    {this.intl.formatMessage({id: 'DISPLAY_NAME'})}
                                </label>
                                <input
                                    type="text"
                                    className="bed-form-input"
                                    value={this.state.displayName}
                                    ref={(input) => { this.displayNameField = input; }}
                                    required={true}
                                    onChange={this.onChangeDisplayNameField}
                                    id="display-name-field"
                                />
                            </div>
                        </div>

                        <div className="bed-form-field bed-form-field-full">
                            <label className="bed-form-label">
                                {this.intl.formatMessage({id: 'DESCRIPTION'})}
                            </label>
                            <textarea
                                className="bed-form-textarea"
                                value={this.state.description}
                                ref={(input) => { this.descriptionField = input; }}
                                onChange={this.onChangeDescription}
                                id="description-field"
                                rows="4"
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
                            <i className="fa fa-history bed-form-info-icon" aria-hidden="true" />
                        </div>
                        <div className="bed-form-info-content">
                            <div className="bed-form-info-title">
                                {this.intl.formatMessage({id: 'AUDIT_TRAIL'})}
                            </div>
                            <div className="bed-form-info-text">
                                {this.intl.formatMessage({id: 'AUDIT_TRAIL_TEXT'})}
                            </div>
                        </div>
                    </div>
                    <div className="bed-form-info-card">
                        <div className="bed-form-info-icon-wrap">
                            <i className="fa fa-bed bed-form-info-icon" aria-hidden="true" />
                        </div>
                        <div className="bed-form-info-content">
                            <div className="bed-form-info-title">
                                {this.intl.formatMessage({id: 'ACTIVE_UNITS'})}
                            </div>
                            <div className="bed-form-info-text">
                                {this.intl.formatMessage({id: 'ACTIVE_UNITS_TEXT'})}
                            </div>
                        </div>
                    </div>
                    <div className="bed-form-info-card">
                        <div className="bed-form-info-icon-wrap">
                            <i className="fa fa-key bed-form-info-icon" aria-hidden="true" />
                        </div>
                        <div className="bed-form-info-content">
                            <div className="bed-form-info-title">
                                {this.intl.formatMessage({id: 'PERMISSIONS'})}
                            </div>
                            <div className="bed-form-info-text">
                                {this.intl.formatMessage({id: 'PERMISSIONS_TEXT'})}
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
