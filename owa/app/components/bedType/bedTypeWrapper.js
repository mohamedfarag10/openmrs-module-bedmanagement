import React from 'react';
import PropTypes from 'prop-types';
import axios from 'axios';
import _ from 'lodash';

import Header from 'components/header';
import LocationSidebar from 'components/admissionLocation/leftPanel/locationSidebar';
import BedTypeList from 'components/bedType/bedTypeList';
import AddEditBedType from 'components/bedType/bedTypeForm/addEditBedType';
import UrlHelper from 'utilities/urlHelper';
import ReactNotify from 'react-notify';

export default class BedTypeWrapper extends React.Component {
    constructor(props, context) {
        super(props, context);

        this.state = {
            bedTypes: [],
            activePage: 'listing',
            pageData: {}
        };

        this.intl = context.intl;
        this.urlHelper = new UrlHelper();
        this.initData = this.initData.bind(this);
        this.initData();
    }

    initData() {
        this.bedTypeFunctions.fetchBedTypes();
    }

    bedTypeFunctions = {
        setState: (stateData) => {
            this.setState({
                ...stateData
            });
        },
        getBedTypes: () => {
            return this.state.bedTypes;
        },
        getBedTypeByUuid: (bedTypeUuid) => {
            return _.find(this.state.bedTypes, function(bedType) {
                return bedType.uuid == bedTypeUuid;
            });
        },
        getBedTypeName: (bedTypeName) => {
            return _.find(this.state.bedTypes, function(bedType) {
                return bedType.name == bedTypeName;
            });
        },
        fetchBedTypes: () => {
            const self = this;
            axios
                .get(this.urlHelper.apiBaseUrl() + '/bedtype', {
                    params: {
                        v: 'full'
                    }
                })
                .then(function(response) {
                    self.setState({
                        bedTypes: response.data.results
                    });
                })
                .catch(function(errorResponse) {
                    const error = errorResponse.response.data ? errorResponse.response.data.error : errorResponse;
                    self.props.bedTypeFunctions.notify('error', error.message.replace(/\[|\]/g, ''));
                });
        },
        notify: (notifyType, message) => {
            const self = this;
            const successText = this.intl.formatMessage({id: 'SUCCESS'});
            const errorText = this.intl.formatMessage({id: 'ERROR'});
            const infoText = this.intl.formatMessage({id: 'INFO'});
            if (notifyType == 'success') {
                self.refs.notificator.success(successText, message, 5000);
            } else if (notifyType == 'error') {
                self.refs.notificator.error(errorText, message, 5000);
            } else {
                self.refs.notificator.error(infoText, message, 5000);
            }
        }
    };

    style = {
        wrapper: {
            backgroundColor: '#f0f4f5',
            minHeight: 'calc(100vh - 104px)',
            display: 'flex'
        },
        content: {
            flex: 1,
            minWidth: 0
        }
    };

    render() {
        return (
            <div>
                <ReactNotify ref="notificator" />
                <Header path={this.props.match.path} />
                <div style={this.style.wrapper} className="page-wrapper">
                    <LocationSidebar />
                    <div style={this.style.content}>
                        {this.state.activePage == 'listing' ? (
                            <BedTypeList bedTypes={this.state.bedTypes} bedTypeFunctions={this.bedTypeFunctions} />
                        ) : (
                            <AddEditBedType
                                bedTypeFunctions={this.bedTypeFunctions}
                                bedTypeUuid={this.state.pageData.bedTypeUuid}
                                operation={this.state.pageData.operation}
                            />
                        )}
                    </div>
                </div>
            </div>
        );
    }
}

BedTypeWrapper.contextTypes = {
    store: PropTypes.object,
    intl: PropTypes.object
};
