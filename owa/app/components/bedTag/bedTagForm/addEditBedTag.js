import React from 'react';
import PropTypes from 'prop-types';
import axios from 'axios';

import UrlHelper from 'utilities/urlHelper';

require('./bedTagForm.css');
export default class AddEditBedTag extends React.Component {
    constructor(props, context) {
        super(props, context);

        this.intl = context.intl;
        this.bedTag = props.bedTagFunctions.getBedTagByUuid(props.bedTagUuid);
        this.state = {
            uuid: this.bedTag != null ? this.bedTag.uuid : null,
            name: this.bedTag != null ? this.bedTag.name : '',
            disableSubmit: false
        };

        this.urlHelper = new UrlHelper();
        this.onChangeNameField = this.onChangeNameField.bind(this);
        this.cancelEventHandler = this.cancelEventHandler.bind(this);
        this.onSubmitHandler = this.onSubmitHandler.bind(this);
    }

    onChangeNameField() {
        this.setState({ name: this.nameField.value });
    }

    cancelEventHandler(event) {
        event.preventDefault();
        this.props.bedTagFunctions.setState({ activePage: 'listing', pageData: {} });
    }

    onSubmitHandler(event) {
        event.preventDefault();
        this.setState({ disableSubmit: true });

        const self = this;
        const parameters = { name: this.state.name };

        axios({
            method: 'post',
            url: this.urlHelper.apiBaseUrl() + (this.state.uuid != null ? '/bedTag/' + this.state.uuid : '/bedTag'),
            headers: {'Content-Type': 'application/json'},
            data: parameters
        })
            .then(function(response) {
                self.setState({ uuid: response.data.uuid, disableSubmit: false });
                self.props.bedTagFunctions.fetchBedTags();
                const successMsg = self.intl.formatMessage({id: 'BED_TAG_SAVE_MSG'});
                self.props.bedTagFunctions.notify('success', successMsg);
                self.props.bedTagFunctions.setState({ activePage: 'listing', pageData: {} });
            })
            .catch(function(errorResponse) {
                self.setState({ disableSubmit: false });
                const error = errorResponse.response.data ? errorResponse.response.data.error : errorResponse;
                self.props.bedTagFunctions.notify('error', error.message.replace(/\[|\]/g, ''));
            });
    }

    render() {
        const isEdit = this.props.operation !== 'add';

        return (
            <div className="bed-form-page">
                <div className="bed-form-page-header">
                    <h1 className="bed-form-title">
                        {isEdit
                            ? this.intl.formatMessage({id: 'EDIT_BED_TAG_TITLE'})
                            : this.intl.formatMessage({id: 'ADD_BED_TAG_TITLE'})}
                    </h1>
                    <p className="bed-form-subtitle">
                        {isEdit
                            ? this.intl.formatMessage({id: 'EDIT_BED_TAG_SUBTITLE'})
                            : this.intl.formatMessage({id: 'ADD_BED_TAG_SUBTITLE'})}
                    </p>
                </div>

                <div className="bed-form-card">
                    <form onSubmit={this.onSubmitHandler}>
                        <div className="bed-form-field bed-form-field-full">
                            <label className="bed-form-label">
                                {this.intl.formatMessage({id: 'NAME'})}
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
                            <div className="bed-form-info-title">{this.intl.formatMessage({id: 'AUDIT_TRAIL'})}</div>
                            <div className="bed-form-info-text">{this.intl.formatMessage({id: 'AUDIT_TRAIL_TEXT'})}</div>
                        </div>
                    </div>
                    <div className="bed-form-info-card">
                        <div className="bed-form-info-icon-wrap">
                            <i className="fa fa-tag bed-form-info-icon" aria-hidden="true" />
                        </div>
                        <div className="bed-form-info-content">
                            <div className="bed-form-info-title">{this.intl.formatMessage({id: 'ACTIVE_UNITS'})}</div>
                            <div className="bed-form-info-text">{this.intl.formatMessage({id: 'ACTIVE_UNITS_TEXT'})}</div>
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
        );
    }
}

AddEditBedTag.propTypes = {
    bedTagUuid: PropTypes.string,
    operation: PropTypes.string,
    bedTagFunctions: PropTypes.object.isRequired
};

AddEditBedTag.contextTypes = {
    intl: PropTypes.object
};
