import React from 'react';
import {Link} from 'react-router-dom';
import PropTypes from 'prop-types';
import {FormattedMessage} from 'react-intl';
import UrlHelper from 'utilities/urlHelper';

require('./header.css');
class Header extends React.Component {
    urlHelper = new UrlHelper();

    linkClass = (path) => {
        return this.props.path == path ? 'active' : '';
    };

    render() {
        return (
            <nav className="app-nav">
                <span className="nav-brand">Bed Management</span>
                <ul className="nav-links">
                    <li>
                        <Link
                            to={this.urlHelper.owaPath() + '/admissionLocations.html'}
                            className={this.linkClass(this.urlHelper.owaPath() + '/admissionLocations.html')}>
                            <FormattedMessage id="ADMISSION_LOCATIONS" />
                        </Link>
                    </li>
                    <li>
                        <Link
                            to={this.urlHelper.owaPath() + '/bedTypes.html'}
                            className={this.linkClass(this.urlHelper.owaPath() + '/bedTypes.html')}>
                            <FormattedMessage id="BED_TYPES" />
                        </Link>
                    </li>
                    <li>
                        <Link
                            to={this.urlHelper.owaPath() + '/bedTags.html'}
                            className={this.linkClass(this.urlHelper.owaPath() + '/bedTags.html')}>
                            <FormattedMessage id="BED_TAGS" />
                        </Link>
                    </li>
                </ul>
                <a href={this.urlHelper.originPath() + '/openmrs'} className="nav-return">
                    <i className="fa fa-arrow-left" aria-hidden="true" />
                    Return to Admin Dashboard
                </a>
            </nav>
        );
    }
}

Header.contextTypes = {
    router: PropTypes.object,
    intl: PropTypes.object
};

export default Header;