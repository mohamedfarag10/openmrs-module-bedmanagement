import React from 'react';
import PropTypes from 'prop-types';
import axios from 'axios';

import UrlHelper from 'utilities/urlHelper';

export default class BedBlock extends React.PureComponent {
    constructor(props, context) {
        super(props, context);
        this.intl = context.intl;
        this.urlHelper = new UrlHelper();
        this.getBlock = this.getBlock.bind(this);
        this.addEditBedHandler = this.addEditBedHandler.bind(this);
        this.onDeleteHandler = this.onDeleteHandler.bind(this);
    }

    addEditBedHandler(event) {
        if (event) {
            event.preventDefault();
            event.stopPropagation();
        }
        this.props.admissionLocationFunctions.setState({
            activePage: 'addEditBed',
            pageData: {
                layoutRow: this.props.layoutRow,
                layoutColumn: this.props.layoutColumn,
                bed: this.props.bed,
                operation: this.props.bed.bedUuid != null ? 'edit' : 'add'
            }
        });
    }

    onDeleteHandler(event) {
        event.preventDefault();
        event.stopPropagation();
        const self = this;
        const deleteConfirmationMsg = this.intl.formatMessage(
            {id: 'DELETE_BED_CONFIRM_MESSAGE'},
            {bed_number: this.props.bedNumber}
        );
        const deleteSuccessMsg = this.intl.formatMessage({id: 'DELETE_SUCCESSFULLY'});
        const confirmation = confirm(deleteConfirmationMsg);
        if (confirmation) {
            axios({
                method: 'delete',
                url: this.urlHelper.apiBaseUrl() + '/bed/' + this.props.bed.bedUuid
            })
                .then(function() {
                    self.props.admissionLocationFunctions.notify('success', deleteSuccessMsg);
                    self.props.loadAdmissionLocationLayout(
                        self.props.admissionLocationFunctions.getActiveLocationUuid()
                    );
                })
                .catch(function(errorResponse) {
                    const error = errorResponse.response.data ? errorResponse.response.data.error : errorResponse;
                    const errorMessage = error.message.includes('BedOccupiedException')
                        ? self.intl.formatMessage({id: 'CANNOT_DELETE_OCCUPIED_BED_ERROR'})
                        : error.message.replace(/\[|\]/g, '');
                    self.props.admissionLocationFunctions.notify('error', errorMessage);
                });
        }
    }

    getBlock() {
        if (this.props.bed.bedUuid == null) {
            return (
                <div className="bed-card-add" onClick={this.addEditBedHandler}>
                    <i className="fa fa-plus bed-card-add-icon" aria-hidden="true" />
                    <span className="bed-card-add-label">{this.intl.formatMessage({id: 'ADD_BED'})}</span>
                </div>
            );
        }

        const isOccupied = this.props.bed.status === 'OCCUPIED';
        return (
            <div className="bed-card" onClick={this.addEditBedHandler}>
                <div className="bed-card-icon">
                    <i className="fa fa-bed" aria-hidden="true" />
                </div>
                <div className="bed-card-name">{this.props.bed.bedNumber}</div>
                <div className={'bed-card-status' + (isOccupied ? ' occupied' : '')}>
                    {isOccupied
                        ? this.intl.formatMessage({id: 'OCCUPIED'})
                        : this.intl.formatMessage({id: 'AVAILABLE'})}
                </div>
                <div className="bed-card-actions">
                    <button
                        className="bed-card-action-btn"
                        title="Edit"
                        onClick={this.addEditBedHandler}>
                        <i className="fa fa-pencil" aria-hidden="true" />
                    </button>
                    <button
                        className="bed-card-action-btn"
                        title="Delete"
                        onClick={this.onDeleteHandler}>
                        <i className="fa fa-trash" aria-hidden="true" />
                    </button>
                </div>
            </div>
        );
    }

    render() {
        return this.getBlock();
    }
}

BedBlock.propTypes = {
    layoutRow: PropTypes.number.isRequired,
    layoutColumn: PropTypes.number.isRequired,
    bed: PropTypes.object.isRequired,
    loadAdmissionLocationLayout: PropTypes.func.isRequired,
    admissionLocationFunctions: PropTypes.object.isRequired
};

BedBlock.contextTypes = {
    intl: PropTypes.object
};