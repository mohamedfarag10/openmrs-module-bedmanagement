import React from 'react';
import PropTypes from 'prop-types';

import BedTagListRow from 'components/bedTag/bedTagList/bedTagListRow';

require('./bedTagList.css');
export default class BedTagList extends React.Component {
    constructor(props, context) {
        super(props, context);

        this.intl = context.intl;
        this.state = { filterText: '' };
        this.addNewHandler = this.addNewHandler.bind(this);
        this.handleFilter = this.handleFilter.bind(this);
    }

    addNewHandler(event) {
        event.preventDefault();
        this.props.bedTagFunctions.setState({
            activePage: 'addEdit',
            pageData: { operation: 'add', bedTagId: null }
        });
    }

    handleFilter(event) {
        this.setState({ filterText: event.target.value });
    }

    render() {
        const { filterText } = this.state;
        const filteredBedTags = this.props.bedTags.filter((bt) => {
            return !filterText || (bt.name || '').toLowerCase().includes(filterText.toLowerCase());
        });

        return (
            <div className="bed-config-page">
                <div className="bed-config-header">
                    <h1 className="bed-config-title">
                        {this.intl.formatMessage({ id: 'BED_TAGS_CONFIGURATION' })}
                    </h1>
                    <p className="bed-config-subtitle">
                        {this.intl.formatMessage({ id: 'BED_TAGS_CONFIGURATION_SUBTITLE' })}
                    </p>
                </div>

                <div className="bed-tag-card">
                    <div className="bed-tag-section-header">
                        <h2 className="bed-tag-section-title">
                            {this.intl.formatMessage({ id: 'EXISTING_BED_TAGS' })}
                        </h2>
                        <div className="bed-tag-search-wrap">
                            <i className="fa fa-search bed-tag-search-icon" aria-hidden="true" />
                            <input
                                type="text"
                                className="bed-tag-search-input"
                                placeholder={this.intl.formatMessage({ id: 'FILTER_BED_TAGS' })}
                                value={filterText}
                                onChange={this.handleFilter}
                            />
                        </div>
                    </div>

                    <table className="bed-tag-table">
                        <thead>
                            <tr>
                                <th>{this.intl.formatMessage({ id: 'NAME' })}</th>
                                <th>{this.intl.formatMessage({ id: 'ACTION' })}</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredBedTags.length === 0 ? (
                                <tr>
                                    <td colSpan="2" className="bed-tag-empty">
                                        {this.intl.formatMessage({ id: 'NO_DATA_TO_DISPLAY' })}
                                    </td>
                                </tr>
                            ) : (
                                filteredBedTags.map((bedTag, key) => (
                                    <BedTagListRow
                                        key={key}
                                        bedTag={bedTag}
                                        bedTagFunctions={this.props.bedTagFunctions}
                                    />
                                ))
                            )}
                        </tbody>
                    </table>

                    <div className="bed-tag-add-btn-container">
                        <button onClick={this.addNewHandler} className="bed-tag-add-btn">
                            <i className="fa fa-plus" aria-hidden="true" />
                            &nbsp; {this.intl.formatMessage({ id: 'ADD_NEW_BED_TAG' })}
                        </button>
                    </div>
                </div>
            </div>
        );
    }
}

BedTagList.propTypes = {
    bedTags: PropTypes.array.isRequired,
    bedTagFunctions: PropTypes.object.isRequired
};

BedTagList.contextTypes = {
    intl: PropTypes.object
};
