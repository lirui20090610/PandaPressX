import React, { Component } from 'react';
import { Link as RouterLink, withRouter } from 'react-router-dom';
import Avatar from '@material-ui/core/Avatar';
import Button from '@material-ui/core/Button';
import CssBaseline from '@material-ui/core/CssBaseline';
import TextField from '@material-ui/core/TextField';
import FormControlLabel from '@material-ui/core/FormControlLabel';
import Checkbox from '@material-ui/core/Checkbox';
import Grid from '@material-ui/core/Grid';
import Box from '@material-ui/core/Box';
import Dialog from '@material-ui/core/Dialog';
import Paper from '@material-ui/core/Paper';
import IconButton from '@material-ui/core/IconButton';
import CloseIcon from '@material-ui/icons/Close';
import LockOutlinedIcon from '@material-ui/icons/LockOutlined';
import Typography from '@material-ui/core/Typography';
import { withStyles } from '@material-ui/core/styles';
import Container from '@material-ui/core/Container';
import Link from '@material-ui/core/Link';

import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import Copyright from '../../common/Copyright';
import Errors from '../../common/Errors';
import { login } from '../../../actions/authActions';
import { clearErrors } from '../../../actions/errorActions';




const styles = theme => ({

    paper: {
        marginTop: theme.spacing(8),
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
    },
    avatar: {
        margin: theme.spacing(1),
        backgroundColor: theme.palette.secondary.main,
    },
    form: {
        width: '90%', // Fix IE 11 issue.
        marginTop: theme.spacing(1),
    },
    submit: {
        margin: theme.spacing(3, 0, 2),
    },
    CloseButton: {
        position: 'absolute',
        top: '0',
        right: '0'
    },
    alert: {
        width: '100%',
    },
    image: {
        backgroundImage: `url(${"/static/avatars/1.jpg"})`,
        backgroundRepeat: 'no-repeat',
        backgroundColor:
            theme.palette.type === 'light' ? theme.palette.grey[50] : theme.palette.grey[900],
        backgroundSize: 'cover',
        backgroundPosition: 'center',
    },
});

class LoginModal extends Component {
    state = {
        modal: false,
        email: '',
        password: '',
    }



    componentWillReceiveProps() {
        this.props.history.location.pathname === '/login' ?
            this.setState({ modal: true })
            : null
    }

    componentDidUpdate(prevProps) {
    }

    toggle = () => {
        this.setState({
            modal: !this.state.modal
        });
    }



    onChange = (e) => {
        this.setState({
            [e.target.name]: e.target.value,
        });
    }

    onSubmit = (e) => {
        e.preventDefault();

        const { email, password } = this.state;

        const user = {
            email,
            password
        }

        // Attempt to login
        this.props.login(user);
        this.props.history.push('/');




    }

    render() {
        const { classes } = this.props;
        return (



            <Container maxWidth="xs" >
                <CssBaseline />
                <Button variant="contained" color="primary" onClick={this.toggle} >
                    Login
                </Button>
                <Dialog open={this.state.modal} >

                    <Grid container >
                        <Grid item xs={false} sm={4} md={4} className={classes.image} />
                        <Grid item xs={12} sm={8} md={8} component={Paper} elevation={6} square>
                            <div className={classes.paper}>
                                <IconButton onClick={this.toggle} className={classes.CloseButton}>
                                    <CloseIcon />
                                </IconButton>
                                <Avatar className={classes.avatar}>
                                    <LockOutlinedIcon />
                                </Avatar>
                                <Typography component="h1" variant="h5">
                                    Sign in
                        </Typography>
                                <form className={classes.form} noValidate onSubmit={this.onSubmit} onChange={this.onChange}>
                                    <TextField
                                        variant="outlined"
                                        margin="normal"
                                        required
                                        fullWidth
                                        id="email"
                                        label="Email Address"
                                        name="email"
                                        autoComplete="email"
                                        autoFocus
                                    />
                                    <TextField
                                        variant="outlined"
                                        margin="normal"
                                        required
                                        fullWidth
                                        name="password"
                                        label="Password"
                                        type="password"
                                        id="password"
                                        autoComplete="current-password"
                                    />
                                    <FormControlLabel
                                        control={<Checkbox value="remember" color="primary" />}
                                        label="Remember me"
                                    />

                                    <Button
                                        type="submit"
                                        fullWidth
                                        variant="contained"
                                        color="primary"
                                        className={classes.submit}
                                    >
                                        Sign In
                                </Button>


                                    <Grid container>
                                        <Grid item xs>
                                            <Link component={RouterLink} to="/forgetpassword" >
                                                Forgot password?
                                    </Link>
                                        </Grid>
                                        <Grid item>
                                            <Link component={RouterLink} to="/signup" onClick={this.toggle}>
                                                Don't have an account? Sign Up
                                    </Link>
                                        </Grid>
                                    </Grid>
                                </form>

                                <Box mt={8}>
                                    <Copyright />
                                </Box>
                            </div>
                        </Grid >
                    </Grid>

                </Dialog>
            </Container>


        )
    };
}

LoginModal.propTypes = {
    login: PropTypes.func.isRequired,
}

const mapStateToProps = (state) => ({
});

LoginModal = withRouter(LoginModal);
LoginModal = (withStyles(styles)(LoginModal));
export default connect((mapStateToProps), { login })(LoginModal);