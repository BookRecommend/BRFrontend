import React, { useState, useCallback, useEffect } from "react";
import { useDispatch, useSelector } from 'react-redux';
import axios from "axios";
import RegionCodeTranslate from './RegionCodeTranslate';
import RenderMaps from "./Map";
import { updateUserInfo } from '../modules/LoginState';
import PuffLoader from 'react-spinners/PuffLoader';
import "../style/BookList.scss";
import Accordion from 'react-bootstrap/Accordion'
import Button from 'react-bootstrap/Button';

const default_Thumbnail = `${process.env.REACT_APP_DEFAULT_THUMBNAIL}`;
const END_POINT = `${process.env.REACT_APP_END_POINT}`;

function leftPad(value) { if (value >= 10) { return value; } return `0${value}`; }

const BookList = (props) => {
    
    const selectedRegion = useSelector(state => state.selectedRegion);
    const loginState = useSelector(state=> state.updateLoginState.login);
    const loginInfo = useSelector(state=> state.updateLoginState.user);

    const { book, i, frommypage } = props;

    let deftoday = new Date();
    let today = `${deftoday.getFullYear()}-${leftPad(deftoday.getMonth() + 1)}-${leftPad(deftoday.getDate())}`;

    const dispatch = useDispatch();
    const[showDetail, setShowDetail] = useState(false);
    const[bookDetail, setBookDetail] = useState({});
    const[loadingState, setLoadingState] = useState(false);

    let isDelete = false;

    useEffect(() => {
        if (showDetail)
        {
            getBookDetail();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedRegion]);

    const getBookDetail =  useCallback(async () => {
        setLoadingState(true);
        try{
            const res = await axios.post(`${END_POINT}/result`,
                JSON.stringify({
                    isbn: book.isbn,
                    title: book.title,
                    region: selectedRegion.region,
                    subregion: selectedRegion.subregion,
                    username: (loginState ? loginInfo.username : null),
                    date: today,
                    author: book.author,
                    publisher: book.publisher,
                    frommypage: (loginState ? frommypage === true ? true : false : true),
                    image: book.image,
                    isExtraSearchNeeded: (book.description && book.description !== "" ? false : true)
                }), {
                headers: {
                    "Content-Type": `application/json`,
                    },
            });
            
            if(res.data.message === "success"){
                setBookDetail(res.data);
                if (!book.description || book.description === ""){
                    book.description = res.data.info.description;
                }
                if (res.data.info.bookId > 0){
                    let temp = loginInfo.history;
                
                    temp.unshift({
                        bookId: res.data.info.bookId,
                        title: book.title,
                        date: today,
                        author: book.author,
                        description: book.description,
                        publisher: book.publisher,
                        isbn: book.isbn,
                        image: book.image
                    });
                    dispatch(updateUserInfo({
                        ...loginInfo,
                        history: temp,
                    }));
                    
                }
            }
            else {
                console.log(res.data.message);
                setBookDetail({info:{price: "0", stock: ""} ,message: "failure"});
            }
            
        }
        
        catch (error) {
        console.log(error);
        alert("????????? ??????????????? ??????????????? ?????????????????????.")
        }

        setLoadingState(false);
    },[book, dispatch, frommypage, loginInfo, loginState, selectedRegion.region, selectedRegion.subregion, today]);

    const deleteSearchList = async () => {
        isDelete = true;
        try{
            const res = await axios({
                method: 'DELETE',
                url: `${END_POINT}/member/history`,
                data: {
                    bookId: book.bookId
                }
            });

            if (res.data.message === "success") {
                alert("?????? ??????");
                let temp = loginInfo.history;
                temp.splice(i, 1);
                dispatch(updateUserInfo({
                    ...loginInfo,
                    history: temp,
                }));
            }
            else {
                alert("?????? ??????");
            }
        }
        catch (error) {
            console.log(error);
            alert("?????? ??????");
        }
    }

    const onClickfunc = useCallback( (props) => {
        
        if(props.showDtl === true){
            setShowDetail(false);
        }
        else{
            if (isDelete) {
                setShowDetail(false);
                return;
            }
            getBookDetail();
            setShowDetail(true);
        }
        
    },[getBookDetail, isDelete]);


    const RenderLiblist = useCallback(() => {
        if (bookDetail.message === 'success') {
            if (bookDetail.info.libraries.length === 0) {
                return(
                    <p>?????? ????????? ????????????.</p>
                )
            }
            else {
                return(
                    <>
                        <p>?????? ????????? ???????????? ????????? ??????</p>
                        <div className="LibraryList">
                            <Accordion alwaysOpen>
                                {bookDetail.info.libraries.map((lib, i) =><LibraryDetail key={lib.name} lib={lib} i={i} j={book.isbn} />)}
                            </Accordion>
                            
                        </div>
                    </>
                )
            }
        }
        else {
            return(
                <p>?????? ?????? ????????? ????????? ???????????? ????????????.</p>
            )
        }

        
    },[bookDetail, book]);

    const LibraryDetail = useCallback((props) => {

        const { lib, i } = props;

        return(
            <>
                <div className="LibraryInfo">
                    <Accordion.Item eventKey={i}>
                        <Accordion.Header>{lib.name}</Accordion.Header>
                        <Accordion.Body>
                            <div className="Library">
                                    <div className="LibraryDescription">
                                        <span>???&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;??? : {lib.address}</span><br/><br/>
                                        <span>???????????? : {lib.available === 'Y' ? "????????????" : "?????????"}</span>
                                    </div>
                                    <RenderMaps location={{
                                            longitude: lib.longitude,
                                            latitude: lib.latitude
                                        }} i={i} />
                            </div>
                        </Accordion.Body>
                    </Accordion.Item>
                </div>
            </>
        )
    },[])

    const renderDetail = useCallback((book) => {

        let temp = RegionCodeTranslate({code: selectedRegion.region + selectedRegion.subregion});
        
        return (
            <>
                <tr style={{backgroundColor: "#ffffff"}}>
                    <td colSpan="2">
                        <div className="BookDetailInfo">
                            <h4>??? ??????</h4>
                            <span>{(book.description) ? book.description : "??? ???????????? ????????????."}</span><br/><br/>
                            <span>?????? : {bookDetail.info.price}???</span><br/>
                            <span>?????? : {bookDetail.info.stock === "available" ? <>???????????? <a href={bookDetail.info.link} target="_blank" rel="noreferrer">???????????? ?????? (?????????)</a></> : "?????? ??????"}</span><br/><br/>
                            <div className="LibraryInfo">
                                <h4>????????? ?????? ??????</h4>
                                <div className="LibraryDetailInfo">
                                    <p>????????? ?????? : {temp.fullName}</p>
                                    <RenderLiblist bookDetail={bookDetail}/>
                                </div>
                                {}
                            </div>            
                        </div>               
                    </td>
                </tr>
                <tr style={{backgroundColor: "#ffffff"}}>
                    <td colSpan="2">
                        <div style={{textAlign: "center"}}>
                            <Button variant="secondary" className="CloseDetailButton" onClick={() => setShowDetail(false)}>
                                ??????
                            </Button>
                        </div>
                    </td>
                </tr>
            </>
        )
    },[selectedRegion, bookDetail])

    const handleImgError = (e) => {
        e.target.src = default_Thumbnail;
    }

    const renderLoading = () => {
        return(
            <tr style={{backgroundColor: "#ffffff"}}>
                <td style={{textAlign: "center"}}>
                    <h5>??????????????????</h5>
                    <PuffLoader color={"#00ACFD"} loading={true} css={{display: "block", height: "100px", margin: "auto", marginTop: "20px"}} size={80} />
                </td>
            </tr>
        )
    }
    
    return (
        <div className="BookInfoBox">
            <table style={{width: "100%"}}>
                <tbody>
                    <tr className="BookInfo" onClick={() => onClickfunc(props={e: i+1, showDtl: showDetail})} >
                        <td className="BookImgTable">
                            <table>
                                <tbody>
                                    <tr>
                                        <td>
                                            <img className="BookImg" src={book.image ? book.image : default_Thumbnail} onError={handleImgError} alt={book.title} /> 
                                        </td>
                                        <td>
                                            <span>{typeof(book.rank) !== 'undefined' && book.rank+". "}{book.title}</span>
                                            <br></br>
                                            <span>{book.author}</span>
                                            <span>???</span>
                                            <span>{book.publisher}</span>
                                            <span>???</span>
                                            <span>{book.isbn}</span>
                                            <span>???</span>
                                            <span>{frommypage ? book.date : book.year}</span>
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </td>                                                                
                        <td>
                            {frommypage ?
                            <Button variant="light" className="DeleteSearchListButton" style={{marginBottom: "85px"}}  onClick={() => deleteSearchList()}>
                                X
                            </Button> : null}
                        </td>
                    </tr>                                    
                    {showDetail ?
                    (loadingState ? renderLoading() : renderDetail(book))
                    : null}
                </tbody>
            </table>
            
        </div>
    );
};


export default BookList;
