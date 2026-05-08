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
        this.setState({name: this.nameField.value});
    }

    cancelEventHandler(event) {
        event.preventDefault();
        this.props.bedTagFunctions.setState({activePage: 'listing', pageData: {}});
    }

    onSubmitHandler(event) {
        event.preventDefault();
        this.setState({disableSubmit: true});
        const self = this;
        const parameters = {name: this.state.name};

        axios({
            method: 'post',
            url:
                this.urlHelper.apiBaseUrl() +
                (this.state.uuid != null ? '/bedTag/' + this.state.uuid : '/bedTag'),
            headers: {'Content-Type': 'application/json'},
            data: parameters
        })
            .then(function(response) {
                self.setState({uuid: response.data.uuid, disableSubmit: false});
                self.props.bedTagFunctions.fetchBedTags();
                const successMsg = self.intl.formatMessage({id: 'BED_TAG_SAVE_MSG'});
                self.props.bedTagFunctions.notify('success', successMsg);
                self.props.bedTagFunctions.setState({activePage: 'listing', pageData: {}});
            })
            .catch(function(errorResponse) {
                self.setState({disableSubmit: false});
                const error = errorResponse.response.data
                    ? errorResponse.response.data.error
                    : errorResponse;
                self.props.bedTagFunctions.notify('error', error.message.replace(/\[|\]/g, ''));
            });
    }

    render() {
        const isAdd = this.props.operation == 'add';
        const saving = this.state.disableSubmit;

        return (
            <div className="bed-tag-form-page">
                {/* Breadcrumb */}
                <div className="btg-breadcrumb">
                    <span>Clinical Settings</span>
                    <i className="fa fa-chevron-right" />
                    <span>Bed Configuration</span>
                    <i className="fa fa-chevron-right" />
                    <span className="btg-breadcrumb-active">
                        {isAdd ? 'Add Bed Tag' : 'Edit Bed Tag'}
                    </span>
                </div>

                {/* Main card */}
                <div className="btg-card">
                    <h2 className="btg-title">
                        {isAdd ? 'Add Bed Tag' : 'Edit Bed Tag'}
                    </h2>
                    <p className="btg-subtitle">
                        Define classification tags to categorize and filter hospital beds.
                    </p>

                    <form onSubmit={this.onSubmitHandler} className="btg-form">
                        {/* Tag Name */}
                        <div className="btg-field">
                            <label className="btg-label" htmlFor="name-field">
                                {this.intl.formatMessage({id: 'NAME'})}
                                <span className="btg-required"> *</span>
                            </label>
                            <input
                                id="name-field"
                                type="text"
                                className="btg-input"
                                value={this.state.name}
                                placeholder="e.g., ISOLATION, PEDIATRIC, HIGH_DEPENDENCY"
                                ref={(input) => { this.nameField = input; }}
                                required={true}
                                onChange={this.onChangeNameField}
                            />
                            <span className="btg-hint">
                                Unique tag name used to filter and group beds across the system.
                            </span>
                        </div>

                        {/* Action buttons */}
                        <div className="btg-actions">
                            <button
                                type="button"
                                onClick={this.cancelEventHandler}
                                className="btg-btn btg-btn-cancel">
                                Cancel
                            </button>
                            <button
                                type="submit"
                                disabled={saving}
                                className="btg-btn btg-btn-save">
                                <i className="fa fa-floppy-o" aria-hidden="true" />
                                {saving ? ' Saving…' : ' Save Bed Tag'}
                            </button>
                        </div>
                    </form>
                </div>

                {/* Info cards */}
                <div className="btg-info-row">
                    <div className="btg-info-card">
                        <div className="btg-info-icon">
                            <i className="fa fa-tag" />
                        </div>
                        <div>
                            <div className="btg-info-title">Flexible Tagging</div>
                            <div className="btg-info-desc">
                                Multiple tags can be assigned to a single bed for granular classification.
                            </div>
                        </div>
                    </div>
                    <div className="btg-info-card">
                        <div className="btg-info-icon">
                            <i className="fa fa-filter" />
                        </div>
                        <div>
                            <div className="btg-info-title">Quick Filtering</div>
                            <div className="btg-info-desc">
                                Tags appear as filters on the admission search and floor map screens.
                            </div>
                        </div>
                    </div>
                    <div className="btg-info-card">
                        <div className="btg-info-icon">
                            <i className="fa fa-history" />
                        </div>
                        <div>
                            <div className="btg-info-title">Audit Logging</div>
                            <div className="btg-info-desc">
                                Creation of new bed tags is tracked for administrative compliance auditing.
                            </div>
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
