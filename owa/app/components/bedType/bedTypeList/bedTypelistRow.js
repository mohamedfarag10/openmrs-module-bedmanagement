import React from 'react';
import PropTypes from 'prop-types';
import axios from 'axios';

import UrlHelper from 'utilities/urlHelper';

export default class BedTypeListRow extends React.Component {
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
            {id: 'DELETE_BED_TYPE_CONFIRM_MSG'},
            {bed_type_name: this.props.bedType.name}
        );
        const confirmation = confirm(deleteConfirmationMsg);
        if (confirmation) {
            axios({
                method: 'delete',
                url: this.urlHelper.apiBaseUrl() + '/bedtype/' + this.props.bedType.uuid
            })
                .then(function() {
                    const deleteSuccessMsg = self.intl.formatMessage({id: 'DELETE_SUCCESSFULLY'});
                    self.props.bedTypeFunctions.notify('success', deleteSuccessMsg);
                    self.props.bedTypeFunctions.fetchBedTypes();
                })
                .catch(function(errorResponse) {
                    const error = errorResponse.response.data ? errorResponse.response.data.error : errorResponse;
                    self.props.bedTypeFunctions.notify('error', error.message.replace(/\[|\]/g, ''));
                });
        }
    }

    editHandler(event) {
        event.preventDefault();

        this.props.bedTypeFunctions.setState({
            activePage: 'addEdit',
            pageData: {
                operation: 'edit',
                bedTypeUuid: this.props.bedType.uuid
            }
        });
    }

    render() {
        this.intl = this.context.intl;
        const { bedType } = this.props;
        return (
            <tr>
                <td>{bedType.name}</td>
                <td>{bedType.displayName}</td>
                <td>
                    {bedType.description ? (
                        bedType.description
                    ) : (
                        <span style={{color: '#a8a8a8', fontStyle: 'italic'}}>
                            {this.intl.formatMessage({id: 'NO_DESCRIPTION_PROVIDED'})}
                        </span>
                    )}
                </td>
                <td>
                    <div className="bed-type-action-btns">
                        <button className="bed-type-edit-btn" onClick={this.editHandler}>
                            <i className="fa fa-pencil" aria-hidden="true" />
                            {this.intl.formatMessage({id: 'EDIT'})}
                        </button>
                        <button className="bed-type-delete-btn" onClick={this.deleteHandler}>
                            <i className="fa fa-trash" aria-hidden="true" />
                            {this.intl.formatMessage({id: 'DELETE'})}
                        </button>
                    </div>
                </td>
            </tr>
        );
    }
}

BedTypeListRow.propTypes = {
    bedType: PropTypes.object.isRequired,
    bedTypeFunctions: PropTypes.object.isRequired
};

BedTypeListRow.contextTypes = {
    intl: PropTypes.object
};
