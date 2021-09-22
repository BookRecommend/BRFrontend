import React from 'react';
import { useDispatch } from 'react-redux';
import { updateLogout } from '../modules/LoginState';
import { GoogleLogout } from 'react-google-login';

const clientId = `${process.env.REACT_APP_GOOGLE_OAUTH_CLIENT_ID}`;


function Logout(props) {

    const dispatch = useDispatch();


    const onSuccess = () => {

        // props.setLoginInfo({});
        // props.setLoginState(false);
        props.setOpenMypage(false);
        props.setShowRankBest(true);
        dispatch(updateLogout());

    };

    return (
        <>
            <GoogleLogout
                clientId={clientId}
                buttonText="Logout"
                onLogoutSuccess={onSuccess} //성공시 실행
            ></GoogleLogout>
        </>
    );
}

export default Logout;