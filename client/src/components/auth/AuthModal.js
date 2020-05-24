import React, { Component, Fragment } from 'react';
import {
    BrowserRouter as Router,
    Switch,
    Route,
    Redirect,
    useHistory,
    useLocation,
    withRouter
} from 'react-router-dom';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import RegisterModal from './authModal/RegisterModal';
import LoginModal from './authModal/LoginModal';
import Logout from './authModal/Logout';

import { withStyles } from '@material-ui/core/styles';

const styles = theme => ({
    appBarButton: {

        display: 'flex',

    },
});
class AuthModal extends Component {

    static propTypes = {
        auth: PropTypes.object.isRequired
    }

    render() {
        const { classes } = this.props;
        const { user } = this.props.auth;
        const manageLogin = (
            <div className={classes.appBarButton}>
                <RegisterModal />
                <LoginModal />
            </div>
        );

        return (
            <div>
                <Router>
                    <Switch>
                        <Route path='/' exact key='main' >
                            {manageLogin}
                        </Route>

                        <Route path='/login' exact key='login'>
                            {manageLogin}
                        </Route>

                        <Route path='/signup' exact key='signup'>
                            {manageLogin}
                        </Route>

                        <Route path='/logedin' exact>
                            <div className={classes.appBarButton} >

                                <span className="navbar-text mr-3">
                                    <strong>{user ? `Hello ${user.firstName}` : ''}</strong>
                                </span>
                                <Logout />
                            </div>
                        </Route>

                        <Route path='/forgetpassword' exact>
                            forget password
                        </Route>
                    </Switch>
                </Router>
            </div >
        )
    }
}

const mapStateToProps = state => ({
    auth: state.auth
});

export default connect(mapStateToProps, null)(withStyles(styles)(AuthModal));
