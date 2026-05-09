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

// Languages that read right-to-left
const RTL_LOCALES = ['ar', 'he', 'fa', 'ur'];

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

    isRTL() {
        return RTL_LOCALES.includes(this.state.localeCode);
    }

    componentDidUpdate(prevProps, prevState) {
        if (prevState.localeCode !== this.state.localeCode) {
            document.documentElement.dir = this.isRTL() ? 'rtl' : 'ltr';
            document.documentElement.lang = this.state.localeCode;
        }
    }

    componentDidMount() {
        document.documentElement.dir = this.isRTL() ? 'rtl' : 'ltr';
        document.documentElement.lang = this.state.localeCode;
    }

    render() {
        return (
            <IntlProvider locale={this.state.localeCode} messages={this.state.messages}>
                <div dir={this.isRTL() ? 'rtl' : 'ltr'}>
                    <Switch>
                        <Route
                            path={urlHelper.owaPath() + '/admissionLocations.html'}
                            component={AdmissionLocationWrapper}
                        />
                        <Route path={urlHelper.owaPath() + '/bedTypes.html'} component={BedTypeWrapper} />
                        <Route path={urlHelper.owaPath() + '/bedTags.html'} component={BedTagWrapper} />
                    </Switch>
                    <div className="app-footer">
                        <LocaleList allowedLocales={this.state.allowedLocales} localeCode={this.state.localeCode} />
                    </div>
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
