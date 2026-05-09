import React from 'react';
import PropTypes from 'prop-types';
import axios from 'axios';

import UrlHelper from 'utilities/urlHelper';

export default class BedTagListRow extends React.Component {
    constructor(props, context) {
        super(props, context);

        this.intl = context.intl;
        this.urlHelper = new UrlHelper();
        this.deleteHandler = this.deleteHandler.bind(this);
        this.editHandler = this.editHandler.bind(this);
    }

    deleteHandler(event) {
        event.preventDefault();

        const self = this;
        const deleteConfirmationMsg = this.intl.formatMessage(
            {id: 'DELETE_BED_TAG_CONFIRM_MSG'},
            {bed_tag_name: this.props.bedTag.name}
        );
        const confirmation = confirm(deleteConfirmationMsg);
        if (confirmation) {
            axios({
                method: 'delete',
                url: this.urlHelper.apiBaseUrl() + '/bedTag/' + this.props.bedTag.uuid
            })
                .then(function() {
                    const deleteSuccessMsg = self.intl.formatMessage({id: 'DELETE_SUCCESSFULLY'});
                    self.props.bedTagFunctions.notify('success', deleteSuccessMsg);
                    self.props.bedTagFunctions.fetchBedTags();
                })
                .catch(function(errorResponse) {
                    const error = errorResponse.response.data ? errorResponse.response.data.error : errorResponse;
                    self.props.bedTagFunctions.notify('error', error.message.replace(/\[|\]/g, ''));
                });
        }
    }

    editHandler(event) {
        event.preventDefault();

        this.props.bedTagFunctions.setState({
            activePage: 'addEdit',
            pageData: {
                operation: 'edit',
                bedTagUuid: this.props.bedTag.uuid
            }
        });
    }

    render() {
        this.intl = this.context.intl;
        return (
            <tr>
                <td>{this.props.bedTag.name}</td>
                <td>
                    <div className="bed-tag-action-btns">
                        <button className="bed-tag-edit-btn" onClick={this.editHandler}>
                            <i className="fa fa-pencil" aria-hidden="true" />
                            {this.intl.formatMessage({id: 'EDIT'})}
                        </button>
                        <button className="bed-tag-delete-btn" onClick={this.deleteHandler}>
                            <i className="fa fa-trash" aria-hidden="true" />
                            {this.intl.formatMessage({id: 'DELETE'})}
                        </button>
                    </div>
                </td>
            </tr>
        );
    }
}

BedTagListRow.propTypes = {
    bedTag: PropTypes.object.isRequired,
    bedTagFunctions: PropTypes.object.isRequired
};

BedTagListRow.contextTypes = {
    intl: PropTypes.object
};
