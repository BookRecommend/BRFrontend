import React, { useCallback, useState } from "react";
//import axios from 'axios';
import { GoogleLogin } from 'react-google-login';
import { useDispatch, useSelector } from 'react-redux';
import updateLoginState, { updateLogin } from '../modules/LoginState';
import { selectRegion } from '../modules/SelectedRegionCode';
import Modal from "./Modal.js";

const clientId = "323793340670-isvcim8icgebo1juvq01iimrqohprd97.apps.googleusercontent.com"

function Login(props) {

    const dispatch = useDispatch();

    const[modal, setModal] = useState(false);
    const[modalInfo, setModalInfo] = useState({});
    
    const onSuccess = (res) => {
        let userInfo = {name: res.profileObj.name, 
                        sex: '0',
                        age: "20",
                        region: "31",
                        subregion: "103",
                        imgURL: res.profileObj.imageUrl, 
                        username: String(res.profileObj.googleId),
                        history: { bookId: "",
                                    title: "",
                                    author: "",
                                    publisher: "",
                                    ISBN: "",},
                        };

        // axios.post(`${END_POINT}/login`,{username: userInfo.username})
        // .then((response) => {
        //     //Object.assign(userInfo, response.data);
        //     userInfo = {...userInfo, _id: response.data._id}
        //     const text = response.data.stt
        //     let textList = []
        //     for(const t of text) {
        //         const item = {
        //             id : t._id,
        //             text : t.text
        //         };
        //         textList.push(item)
        //     }
        //     refreshTokenSetup(res);

        console.log("Login Info",userInfo);
        //props.setLoginInfo(userInfo);

        // setModalInfo({
        //     title: "Login Success",
        //     description: `Welcome ${userInfo.name}`,
        //     clickoff: true
        // });
        // setModal(true);

        //props.setLoginState(true);

        dispatch(updateLogin(userInfo));
        dispatch(selectRegion({
            region: userInfo.region,
            subregion: userInfo.subregion,
        }));
    }
    
    //로그인 실패시 실행
    const onFailure = (res) => {
        console.log("login fail",res)

        setModalInfo({
            title: "Login Fail",
            description: res.error,
            clickoff: true
        });
        setModal(true);
    }

    return (
        <div className='GoogleLoginButton'>
            <GoogleLogin
                clientId={clientId}
                buttonText="Login with Google"
                onSuccess={onSuccess} // 성공시 실행
                onFailure={onFailure} // 실패시 실행
                cookiePolicy={'single_host_origin'}
                />
            {modal ? <Modal
                setModal={setModal} 
                title={modalInfo.title}
                description={modalInfo.description}
                clickoff={false}
            /> : null}
        </div>
    );
}

export default Login;