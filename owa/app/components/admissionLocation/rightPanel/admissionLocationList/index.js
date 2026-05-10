import React from 'react';
import PropTypes from 'prop-types';

import Breadcrumb from 'components/admissionLocation/rightPanel/breadcrumb';
import LocationBlock from 'components/admissionLocation/rightPanel/locationBlock';
import BedLayout from 'components/admissionLocation/rightPanel/bedLayout';
import AdmissionLocationHelper from 'utilities/admissionLocationHelper';

require('./admissionLocationList.css');
export default class AdmissionLocationList extends React.Component {
    constructor(props, context) {
        super(props, context);

        this.intl = context.intl;
        this.admissionLocationHelper = new AdmissionLocationHelper();
        this.childAdmissionLocations = this.admissionLocationHelper.getChildAdmissionLocations(
            props.admissionLocationFunctions.getAdmissionLocations(),
            props.activeUuid
        );
        this.addWardClickHandler = this.addWardClickHandler.bind(this);
        this.getBody = this.getBody.bind(this);
    }

    componentWillUpdate(nextProps, nextState) {
        this.childAdmissionLocations = this.admissionLocationHelper.getChildAdmissionLocations(
            this.props.admissionLocationFunctions.getAdmissionLocations(),
            nextProps.activeUuid
        );
    }

    addWardClickHandler() {
        this.props.admissionLocationFunctions.setState({
            activePage: 'addEditLocation',
            pageData: {operation: 'add'},
            activeUuid: this.props.activeUuid
        });
    }

    getPageHeader() {
        if (this.props.activeUuid == null) return null;
        const location = this.props.admissionLocationFunctions.getAdmissionLocationByUuid(this.props.activeUuid);
        if (!location) return null;
        return (
            <div className="location-page-header">
                <h1 className="location-page-title">{location.name}</h1>
                {location.description && (
                    <p className="location-page-subtitle">{location.description}</p>
                )}
            </div>
        );
    }

    getBody() {
        const managingLocationsEnabled = this.props.admissionLocationFunctions.isManagingLocationsEnabled();
        const addLabel = this.intl.formatMessage({
            id: this.props.activeUuid == null ? 'ADD_ADMISSION_LOCATION' : 'ADD_WARD'
        });

        if (Object.keys(this.childAdmissionLocations).length == 0 && this.props.activeUuid == null) {
            return managingLocationsEnabled && (
                <div className="location-cards-grid">
                    <div className="location-card-add" onClick={this.addWardClickHandler}>
                        <div className="location-card-add-icon">
                            <i className="fa fa-plus" aria-hidden="true" />
                        </div>
                        <span className="location-card-add-label">{addLabel}</span>
                    </div>
                </div>
            );
        } else if (Object.keys(this.childAdmissionLocations).length == 0) {
            return (
                <BedLayout
                    activeUuid={this.props.activeUuid}
                    admissionLocationFunctions={this.props.admissionLocationFunctions}
                />
            );
        } else {
            return (
                <div className="location-cards-grid">
                    {Object.keys(this.childAdmissionLocations).map((key) => (
                        <LocationBlock
                            key={key}
                            admissionLocation={this.props.admissionLocationFunctions.getAdmissionLocationByUuid(key)}
                            admissionLocationFunctions={this.props.admissionLocationFunctions}
                        />
                    ))}
                    {managingLocationsEnabled && (
                        <div className="location-card-add" onClick={this.addWardClickHandler}>
                            <div className="location-card-add-icon">
                                <i className="fa fa-plus" aria-hidden="true" />
                            </div>
                            <span className="location-card-add-label">{addLabel}</span>
                        </div>
                    )}
                </div>
            );
        }
    }

    render() {
        this.intl = this.context.intl;
        return (
            <div className="main-container">
                <Breadcrumb
                    activeUuid={this.props.activeUuid}
                    admissionLocationFunctions={this.props.admissionLocationFunctions}
                />
                {this.getPageHeader()}
                <div className="main-block">{this.getBody()}</div>
            </div>
        );
    }
}

AdmissionLocationList.contextTypes = {
    store: PropTypes.object,
    intl: PropTypes.object
};

AdmissionLocationList.propTypes = {
    activeUuid: PropTypes.string,
    admissionLocationFunctions: PropTypes.object.isRequired
};