import React from 'react';
import PropTypes from 'prop-types';

import BedTypeListRow from 'components/bedType/bedTypeList/bedTypelistRow';

require('./bedTypeList.css');
export default class BedTypeList extends React.Component {
    constructor(props, context) {
        super(props, context);

        this.intl = context.intl;
        this.state = { filterText: '' };
        this.addNewHandler = this.addNewHandler.bind(this);
        this.handleFilter = this.handleFilter.bind(this);
    }

    addNewHandler(event) {
        event.preventDefault();
        this.props.bedTypeFunctions.setState({
            activePage: 'addEdit',
            pageData: {
                operation: 'add',
                bedTypeId: null
            }
        });
    }

    handleFilter(event) {
        this.setState({ filterText: event.target.value });
    }

    render() {
        this.intl = this.context.intl;
        const { filterText } = this.state;
        const filteredBedTypes = this.props.bedTypes.filter((bt) => {
            const q = filterText.toLowerCase();
            return (
                !q ||
                (bt.name || '').toLowerCase().includes(q) ||
                (bt.displayName || '').toLowerCase().includes(q) ||
                (bt.description || '').toLowerCase().includes(q)
            );
        });

        return (
            <div className="bed-config-page">
                <div className="bed-config-header">
                    <h1 className="bed-config-title">
                        {this.intl.formatMessage({ id: 'BED_CONFIGURATION' })}
                    </h1>
                    <p className="bed-config-subtitle">
                        {this.intl.formatMessage({ id: 'BED_CONFIGURATION_SUBTITLE' })}
                    </p>
                </div>

                <div className="bed-type-card">
                    <div className="bed-type-section-header">
                        <h2 className="bed-type-section-title">
                            {this.intl.formatMessage({ id: 'EXISTING_BED_TYPES' })}
                        </h2>
                        <div className="bed-type-search-wrap">
                            <i className="fa fa-search bed-type-search-icon" aria-hidden="true" />
                            <input
                                type="text"
                                className="bed-type-search-input"
                                placeholder={this.intl.formatMessage({ id: 'FILTER_BED_TYPES' })}
                                value={filterText}
                                onChange={this.handleFilter}
                            />
                        </div>
                    </div>

                    <table className="bed-type-table">
                        <thead>
                            <tr>
                                <th>{this.intl.formatMessage({ id: 'NAME' })}</th>
                                <th>{this.intl.formatMessage({ id: 'DISPLAY_NAME' })}</th>
                                <th className="description">{this.intl.formatMessage({ id: 'DESCRIPTION' })}</th>
                                <th>{this.intl.formatMessage({ id: 'ACTION' })}</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredBedTypes.length === 0 ? (
                                <tr>
                                    <td colSpan="4" className="bed-type-empty">
                                        {this.intl.formatMessage({ id: 'NO_DATA_TO_DISPLAY' })}
                                    </td>
                                </tr>
                            ) : (
                                filteredBedTypes.map((bedType, key) => (
                                    <BedTypeListRow
                                        key={key}
                                        bedType={bedType}
                                        bedTypeFunctions={this.props.bedTypeFunctions}
                                    />
                                ))
                            )}
                        </tbody>
                    </table>

                    <div className="bed-type-add-btn-container">
                        <button onClick={this.addNewHandler} className="bed-type-add-btn">
                            <i className="fa fa-plus" aria-hidden="true" />
                            &nbsp; {this.intl.formatMessage({ id: 'ADD_NEW_BED_TYPE' })}
                        </button>
                    </div>
                </div>
            </div>
        );
    }
}

BedTypeList.propTypes = {
    bedTypes: PropTypes.array.isRequired,
    bedTypeFunctions: PropTypes.object.isRequired
};

BedTypeList.contextTypes = {
    intl: PropTypes.object
};
