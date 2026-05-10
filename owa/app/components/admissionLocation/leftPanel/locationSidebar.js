import React from 'react';
import PropTypes from 'prop-types';
import axios from 'axios';
import _ from 'lodash';
import AdmissionLocationHelper from 'utilities/admissionLocationHelper';
import UrlHelper from 'utilities/urlHelper';

require('./hierarchy.css');

/**
 * A self-contained tree item used by LocationSidebar (read-only, no navigation side-effects).
 */
class SidebarItem extends React.Component {
    constructor(props) {
        super(props);
        this.admissionLocationHelper = new AdmissionLocationHelper();
        this.state = {isOpen: false};
        this.childLocations = this.admissionLocationHelper.getChildAdmissionLocations(
            props.allLocations,
            props.location.uuid
        );
    }

    componentWillUpdate(nextProps) {
        this.childLocations = this.admissionLocationHelper.getChildAdmissionLocations(
            nextProps.allLocations,
            nextProps.location.uuid
        );
    }

    render() {
        if (!this.props.isParentOpen) return null;
        const hasChildren = Object.keys(this.childLocations).length > 0;
        const {isOpen} = this.state;
        const iconClass = hasChildren
            ? `fa fa-chevron-${isOpen ? 'down' : 'right'} tree-icon`
            : 'fa fa-circle tree-icon leaf';

        return (
            <div>
                <div
                    className="tree-node"
                    onClick={() => hasChildren && this.setState({isOpen: !isOpen})}
                >
                    <i className={iconClass} aria-hidden="true" />
                    <span className="tree-label">{this.props.location.name}</span>
                </div>
                {hasChildren && isOpen && (
                    <div className="tree-vertical-border">
                        {Object.keys(this.childLocations).map((uuid) => (
                            <SidebarItem
                                key={uuid}
                                isParentOpen={isOpen}
                                location={this.childLocations[uuid]}
                                allLocations={this.props.allLocations}
                            />
                        ))}
                    </div>
                )}
            </div>
        );
    }
}

/**
 * Standalone Location Hierarchy sidebar — fetches its own data.
 * Use this in pages that don't have admissionLocationFunctions (BedTypes, BedTags).
 */
export default class LocationSidebar extends React.Component {
    constructor(props) {
        super(props);
        this.urlHelper = new UrlHelper();
        this.admissionLocationHelper = new AdmissionLocationHelper();
        this.state = {
            admissionLocations: {},
            isOpen: true
        };
        this.fetchLocations();
        this.toggleRoot = this.toggleRoot.bind(this);
    }

    fetchLocations() {
        const self = this;
        axios
            .get(this.urlHelper.apiBaseUrl() + '/location?tag=Admission%20Location&v=full')
            .then(function(response) {
                const uuidList = _.map(response.data.results, (l) => l.uuid);
                const locations = _.reduce(
                    response.data.results,
                    (acc, curr) => {
                        if (_.includes(uuidList, curr.uuid)) {
                            acc[curr.uuid] = {
                                uuid: curr.uuid,
                                name: curr.name,
                                description: curr.description,
                                parentAdmissionLocationUuid:
                                    curr.parentLocation != null ? curr.parentLocation.uuid : null,
                                isOpen: false,
                                isHigherLevel:
                                    curr.parentLocation != null
                                        ? !_.includes(uuidList, curr.parentLocation.uuid)
                                        : true
                            };
                        }
                        return acc;
                    },
                    {}
                );
                self.setState({admissionLocations: locations});
            })
            .catch(() => {});
    }

    toggleRoot(e) {
        e.stopPropagation();
        this.setState((s) => ({isOpen: !s.isOpen}));
    }

    render() {
        const intl = this.context.intl;
        const {isOpen, admissionLocations} = this.state;
        const higherLevel = this.admissionLocationHelper.getHigherLevelAdmissionLocations(admissionLocations);
        const locationHierarchyLabel = intl
            ? intl.formatMessage({id: 'LOCATION_HIERARCHY'})
            : 'Location Hierarchy';
        const admissionLocationsLabel = intl
            ? intl.formatMessage({id: 'ADMISSION_LOCATIONS'})
            : 'Admission Locations';

        return (
            <div className="left-container">
                <div className="tree-card">
                    <div className="tree-heading">
                        <i className="fa fa-sitemap" aria-hidden="true" />
                        <span className="tree-heading-text">{locationHierarchyLabel}</span>
                    </div>
                    <div className="tree-items">
                        <div className="tree-root-node" onClick={this.toggleRoot}>
                            <i
                                className={`fa fa-chevron-${isOpen ? 'down' : 'right'} tree-icon`}
                                aria-hidden="true"
                            />
                            <span className="tree-label">{admissionLocationsLabel}</span>
                        </div>
                        {isOpen && (
                            <div className="tree-children">
                                {Object.keys(higherLevel).map((uuid) => (
                                    <SidebarItem
                                        key={uuid}
                                        isParentOpen={isOpen}
                                        location={higherLevel[uuid]}
                                        allLocations={admissionLocations}
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

LocationSidebar.contextTypes = {
    intl: PropTypes.object
};
