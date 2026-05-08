import React from 'react';
import PropTypes from 'prop-types';

import AdmissionLocationHelper from 'utilities/admissionLocationHelper';

export default class HierarchyItem extends React.Component {
    constructor(props, context) {
        super(props, context);

        this.admissionLocationHelper = new AdmissionLocationHelper();

        this.childAdmissionLocations = this.admissionLocationHelper.getChildAdmissionLocations(
            this.props.hierarchyFunction.getAdmissionLocations(),
            this.props.admissionLocation.uuid
        );

        this.onClickIcon = this.onClickIcon.bind(this);
        this.onClickTitle = this.onClickTitle.bind(this);
    }

    componentWillUpdate(nextProps, nextState) {
        this.childAdmissionLocations = this.admissionLocationHelper.getChildAdmissionLocations(
            this.props.hierarchyFunction.getAdmissionLocations(),
            this.props.admissionLocation.uuid
        );
    }

    onClickIcon(e) {
        e.stopPropagation();
        this.props.hierarchyFunction.toggleIsOpen(
            this.props.admissionLocation.uuid,
            this.props.admissionLocation.isOpen
        );
    }

    onClickTitle() {
        this.props.hierarchyFunction.setAdmissionLocationIsOpen(this.props.admissionLocation.uuid, true);
        this.props.hierarchyFunction.setState({
            activeUuid: this.props.admissionLocation.uuid,
            activePage: 'listing',
            pageData: {}
        });
    }

    render() {
        if (!this.props.isParentOpen) return null;

        const hasChildren = Object.keys(this.childAdmissionLocations).length > 0;
        const isOpen = this.props.admissionLocation.isOpen;
        const isActive = this.props.hierarchyFunction.getActiveUuid() == this.props.admissionLocation.uuid;

        const iconClass = hasChildren
            ? `fa fa-chevron-${isOpen ? 'down' : 'right'} tree-icon`
            : 'fa fa-circle tree-icon leaf';

        return (
            <div>
                <div
                    className={`tree-node${isActive ? ' active' : ''}`}
                    onClick={this.onClickTitle}
                >
                    <i
                        className={iconClass}
                        onClick={this.onClickIcon}
                        aria-hidden="true"
                    />
                    <span className="tree-label">{this.props.admissionLocation.name}</span>
                </div>
                {hasChildren && isOpen && (
                    <div className="tree-vertical-border">
                        {Object.keys(this.childAdmissionLocations).map((uuid) => (
                            <HierarchyItem
                                key={uuid}
                                isParentOpen={isOpen}
                                hierarchyFunction={this.props.hierarchyFunction}
                                admissionLocation={this.childAdmissionLocations[uuid]}
                            />
                        ))}
                    </div>
                )}
            </div>
        );
    }
}

HierarchyItem.propTypes = {
    isParentOpen: PropTypes.bool.isRequired,
    hierarchyFunction: PropTypes.object.isRequired,
    admissionLocation: PropTypes.shape({
        name: PropTypes.string.isRequired,
        uuid: PropTypes.string.isRequired,
        parentAdmissionLocationUuid: PropTypes.string,
        isOpen: PropTypes.bool.isRequired,
        isHigherLevel: PropTypes.bool.isRequired
    })
};

HierarchyItem.contextTypes = {
    intl: PropTypes.object
};
