import React from 'react';
import {Switch, Route} from 'react-router-dom';
import PropTypes from 'prop-types';
import {IntlProvider, FormattedMessage} from 'react-intl';

import AdmissionLocationWrapper from 'components/admissionLocation/admissionLocationWrapper';
import BedTypeWrapper from 'components/bedType/bedTypeWrapper';
import BedTagWrapper from 'components/bedTag/bedTagWrapper';
import LocaleList from 'components/locale/localeList';
import StateApi from 'utilities/stateApi';
import UrlHelper from 'utilities/urlHelper';
import messages from 'i18n/messages';

const urlHelper = new UrlHelper();
require('./app.css');
require('babel-polyfill');
class App extends React.Component {
    static childContextTypes = {
        store: PropTypes.object
    };

    getChildContext() {
        return {
            store: new StateApi(this)
        };
    }

    constructor(props) {
        super(props);
        this.state = {
            localeCode: props.localeCode,
            allowedLocales: props.allowedLocales,
            messages:
                typeof messages[props.localeCode] !== 'undefined'
                    ? messages[props.localeCode]
                    : messages[props.defaultLocale]
        };
    }

    render() {
        return (
            <IntlProvider locale={this.state.localeCode} messages={this.state.messages}>
                <div style={{display: 'flex', flexDirection: 'column', minHeight: '100vh'}}>
                    <Switch>
                        <Route
                            path={urlHelper.owaPath() + '/admissionLocations.html'}
                            component={AdmissionLocationWrapper}
                        />
                        <Route path={urlHelper.owaPath() + '/bedTypes.html'} component={BedTypeWrapper} />
                        <Route path={urlHelper.owaPath() + '/bedTags.html'} component={BedTagWrapper} />
                    </Switch>
                    <LocaleList allowedLocales={this.state.allowedLocales} localeCode={this.state.localeCode} />
                    <footer className="app-footer">
                        <span className="app-footer-copy">© 2024 Clinical Management System. All rights reserved.</span>
                        <span className="app-footer-links">
                            <a href="#">Privacy Policy</a>
                            <a href="#">Terms of Service</a>
                            <a href="#">Support</a>
                        </span>
                    </footer>
                </div>
            </IntlProvider>
        );
    }
}

App.propTypes = {
    localeCode: PropTypes.string.isRequired,
    defaultLocale: PropTypes.string.isRequired,
    allowedLocales: PropTypes.array.isRequired
};

export default App;
