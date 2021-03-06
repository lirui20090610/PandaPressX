import axios from 'axios';
import { returnErrors } from './errorActions';
import {
    USER_LOADED,
    USER_LOADING,
    EMAIL_VALIDATING,
    EMAIL_VALID,
    EMAIL_INVALID,
    RESEND_CODE,
    RESEND_DONE,
    AUTH_ERROR,
    LOGIN_SUCCESS,
    LOGIN_FAIL,
    LOGOUT_SUCCESS,
    REGISTER_SUCCESS,
    REGISTER_FAIL,

} from '../actions/types';



// Setup config/headers and token
export const tokenConfig = getState => {
    // Get token from localstorage
    const token = getState().auth.token;

    // Headers
    const config = {
        headers: {
            "Content-type": "application/json"
        }
    }

    // If token, add to headers
    if (token) {
        config.headers['x-auth-token'] = token;
    }

    return config;
}


// Check token & load user
export const loadUser = () => (dispatch, getState) => {
    dispatch({
        type: USER_LOADING
    });
    axios.get('/api/auth/user', tokenConfig(getState))
        .then(res => dispatch({
            type: USER_LOADED,
            payload: res.data
        }))
        .catch(err => {
            dispatch(returnErrors(err.response.data.msg));
            dispatch({
                type: AUTH_ERROR
            });
        });
}
// Register User
export const register = ({ firstName, lastName, email, password }) => dispatch => {
    // Headers
    const config = {
        headers: {
            'Content-Type': 'application/json'
        }
    }

    // Request body
    const body = JSON.stringify({ firstName, lastName, email, password });

    axios.post('/api/users', body, config)
        .then(res => dispatch({
            type: REGISTER_SUCCESS,
            payload: res.data
        }))
        .catch(err => {
            dispatch(returnErrors(err.response.data.msg));
            dispatch({
                type: REGISTER_FAIL
            });
        });
}

// Login User
export const login = ({ email, password }) => dispatch => {
    // Headers
    const config = {
        headers: {
            'Content-Type': 'application/json'
        }
    }

    // Request body
    const body = JSON.stringify({ email, password });

    axios.post('/api/auth', body, config)
        .then(res => dispatch({
            type: LOGIN_SUCCESS,
            payload: res.data
        }))
        .catch(err => {
            dispatch(returnErrors(err.response.data.msg));
            dispatch({
                type: LOGIN_FAIL
            });
        });
}


// verify users' email
export const validateEmail = (email) => dispatch => {
    // Headers
    const config = {
        headers: {
            'Content-Type': 'application/json'
        }
    }

    // Request body
    const body = JSON.stringify({ email });

    axios.post('/api/users/email', body, config)
        .then(res => {
            console.log(res);
            dispatch({
                type: EMAIL_VALIDATING
            })
        })
        .catch(err => {
            dispatch(returnErrors(err.response.data.msg));
            dispatch({
                type: EMAIL_INVALID
            });
        });

}

// resend verificaiton code to users' email
export const resend = (email) => (dispatch, getState) => {
    // Headers
    const config = {
        headers: {
            'Content-Type': 'application/json'
        }
    }

    axios.get(`/api/users/resend/${email}`, config)
        .then(res => {
            console.log(res);
            dispatch({
                type: RESEND_CODE
            })
        })

}
export const resetResent = () => (dispatch) => {
    dispatch({
        type: RESEND_DONE
    })
}

// Logout User
export const logout = () => {
    return {
        type: LOGOUT_SUCCESS
    };
};

