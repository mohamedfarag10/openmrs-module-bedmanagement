import React from 'react';
import PropTypes from 'prop-types';

import AdmissionLocationHelper from 'utilities/admissionLocationHelper';
import HierarchyItem from 'components/admissionLocation/leftPanel/hierarchyItem';

require('./hierarchy.css');
export default class LocationHierarchy extends React.Component {
    constructor(props, context) {
        super(props, context);

        this.intl = context.intl;
        this.admissionLocationHelper = new AdmissionLocationHelper();
        this.higherLevelAdmissionLocations = this.admissionLocationHelper.getHigherLevelAdmissionLocations(
            props.admissionLocationFunctions.getAdmissionLocations()
        );
        this.onClickTitle = this.onClickTitle.bind(this);
        this.onClickIcon = this.onClickIcon.bind(this);
    }

    hierarchyFunction = {
        toggleIsOpen: (locationUuid, isOpen) => {
            if (locationUuid != null) {
                this.hierarchyFunction.setAdmissionLocationIsOpen(locationUuid, !isOpen);
            } else {
                this.props.admissionLocationFunctions.setState({
                    isOpen: this.props.isOpen ? false : true
                });
            }
        },
        setAdmissionLocationIsOpen: (locationUuid, isOpen) => {
            const admissionLocations = this.hierarchyFunction.getAdmissionLocations();
            if (admissionLocations[locationUuid].isOpen !== isOpen) {
                admissionLocations[locationUuid].isOpen = isOpen;
                this.props.admissionLocationFunctions.setState({
                    admissionLocations: admissionLocations
                });
            }
        },
        setState: (stateData) => {
            this.props.admissionLocationFunctions.setState(stateData);
        },
        getActiveUuid: () => {
            return this.props.admissionLocationFunctions.getActiveLocationUuid();
        },
        setActiveUuid: (admissionLocationUuid) => {
            this.props.admissionLocationFunctions.setActiveLocationUuid(admissionLocationUuid);
        },
        getAdmissionLocations: () => {
            return this.props.admissionLocationFunctions.getAdmissionLocations();
        }
    };

    onClickIcon(e) {
        e.stopPropagation();
        this.hierarchyFunction.toggleIsOpen(null, this.props.isOpen);
    }

    onClickTitle() {
        this.hierarchyFunction.setState({
            activeUuid: null,
            isOpen: true,
            activePage: 'listing',
            pageData: {}
        });
    }

    componentWillUpdate(nextProps, nextState) {
        this.higherLevelAdmissionLocations = this.admissionLocationHelper.getHigherLevelAdmissionLocations(
            this.props.admissionLocationFunctions.getAdmissionLocations()
        );
    }

    render() {
        this.intl = this.context.intl;
        const isRootActive = this.hierarchyFunction.getActiveUuid() == null;
        const isOpen = this.props.isOpen;

        return (
            <div className="left-container">
                <div className="tree-card">
                    <div className="tree-heading">
                        <i className="fa fa-sitemap" aria-hidden="true" />
                        <span className="tree-heading-text">Location Hierarchy</span>
                    </div>
                    <div className="tree-items">
                        <div
                            className={`tree-root-node${isRootActive ? ' active' : ''}`}
                            onClick={this.onClickTitle}
                        >
                            <i
                                className={`fa fa-chevron-${isOpen ? 'down' : 'right'} tree-icon`}
                                onClick={this.onClickIcon}
                                aria-hidden="true"
                            />
                            <span className="tree-label">
                                {this.intl.formatMessage({id: 'ADMISSION_LOCATIONS'})}
                            </span>
                        </div>
                        {isOpen && (
                            <div className="tree-children">
                                {Object.keys(this.higherLevelAdmissionLocations).map((uuid) => (
                                    <HierarchyItem
                                        key={uuid}
                                        isParentOpen={isOpen}
                                        hierarchyFunction={this.hierarchyFunction}
                                        admissionLocation={this.higherLevelAdmissionLocations[uuid]}
                                    />
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        );
    }
}

LocationHierarchy.propTypes = {
    isOpen: PropTypes.bool.isRequired,
    admissionLocationFunctions: PropTypes.object.isRequired
};

LocationHierarchy.contextTypes = {
    intl: PropTypes.object
};
