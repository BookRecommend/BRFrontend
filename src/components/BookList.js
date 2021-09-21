import React, { useState, useEffect, useCallback } from "react";
import { useDispatch, useSelector } from 'react-redux';
import axios from "axios";
import RegionCodeTranslate from './RegionCodeTranslate';
import RenderMaps from "./Map";
import { updateUserInfo } from '../modules/LoginState';
import "../style/BookList.scss";
import { selectRegion } from '../modules/SelectedRegionCode';
import { load } from 'cheerio';

const default_Thumbnail = "https://bookthumb-phinf.pstatic.net/cover/069/862/06986295.jpg?type=m1&udate=20180918"

// const END_POINT = "/v1/search/book.json";
// const Client_ID = "6kzLim7jrHaqIQQcyTyH";
// const Client_PW = "TKnpNps3Gg";

const END_POINT = "http://ec2-3-19-120-63.us-east-2.compute.amazonaws.com:8080";

function leftPad(value) { if (value >= 10) { return value; } return `0${value}`; }

const BookList = (props) => {
    
    const selectedRegion = useSelector(state => state.selectedRegion);
    const loginState = useSelector(state=> state.updateLoginState.login);
    const loginInfo = useSelector(state=> state.updateLoginState.user);

    const { book, i, frommypage } = props;

    let deftoday = new Date();
    let today = `${deftoday.getFullYear()}-${leftPad(deftoday.getMonth() + 1)}-${leftPad(deftoday.getDate())}`;

    const dispatch = useDispatch();

    // const[modal, setModal] = useState(false);
    // const[modalList, setList] = useState(1);
    const[clickList, setClickList] = useState(1);
    const[showDetail, setShowDetail] = useState(false);
    const[libSelected,setLibSelected] = useState(-1);
    const[currentRegion, setCurrentRegion] = useState({});
    const[bookDetail, setBookDetail] = useState({});
    const[loadingState, setLoadingState] = useState(false);

    let bookDetail3 = {};

    const testbid = book.bookId;
    

    const getBookDetail = async () => {
        setLoadingState(true);
        try{
            console.log("request book", book);
            console.log("request info",{
                isbn: book.isbn,
                title: book.title,
                region: selectedRegion.region,
                subregion: selectedRegion.subregion,
                username: loginInfo.username,
                date: today,
                author: book.author,
                publisher: book.publisher,
                frommypage: frommypage
            });
            console.log("post!");
            
            const res = await axios.post(`${END_POINT}/result`,
                JSON.stringify({
                    isbn: book.isbn,
                    title: book.title,
                    region: selectedRegion.region,
                    subregion: selectedRegion.subregion,
                    username: loginInfo.username,
                    date: today,
                    author: book.author,
                    publisher: book.publisher,
                    frommypage: (frommypage === true ? true : false)
                }), {
                headers: {
                    "Content-Type": `application/json`,
                    },
            });
            
            console.log("post complete");
            console.log("book detail", res.data);
            
            if(res.data.message === "success"){
                setBookDetail(res.data);
                bookDetail3 = res.data;
                if (res.data.info.bookId > 0){
                    console.log("search list added");
                    let temp = loginInfo.history;
                
                    temp.push({
                        bookId: res.data.info.bookId,
                        title: book.title,
                        date: today,
                        author: book.author,
                        publisher: book.publisher,
                        isbn: book.isbn,
                    });
                    dispatch(updateUserInfo({
                        ...loginInfo,
                        history: temp,
                    }));
                    
                }
            }
            else {
                setBookDetail({message: "failure"});
            }
            
        }
        
        catch (error) {
        console.log(error);
        alert("선택하신 책의 도서관 보유정보를 가져오는데 실패하였습니다.")
        }

        setLoadingState(false);
    };

    const deleteSearchList = async () => {
        try{
            const res = await axios({
                method: 'DELETE',
                url: `${END_POINT}/member/history`,
                data: {
                    bookId: book.bookId
                }
            });

            if (res.data.message === "success") {
                alert("삭제 성공");
                let temp = loginInfo.history;
                //console.log("i", i);
                temp.splice(i, 1);
                //console.log("temp",temp);
                dispatch(updateUserInfo({
                    ...loginInfo,
                    history: temp,
                }));
            }
            else {
                alert("삭제 실패");
            }
        }
        catch (error) {
            console.log(error);
            alert("삭제 실패");
        }
    }

    const onClickfunc = useCallback( (props) => {
        //setList(e);
        //setModal(true);
        //console.log("onClick1", props.e, clickList, showDetail, props.showDtl);
        
        if(props.showDtl === true){
            
            setLibSelected(-1);
            setShowDetail(false);
            //console.log("onClick2", props.e, clickList, showDetail, props.showDtl);
        
        }
        else{
            getBookDetail();
            setClickList(props.e);
            setShowDetail(true);
        }
        
    }, [selectedRegion]);

    //console.log('props.bookslist', book);
    // useEffect(() => {
    //     console.log("redux selRegion", selectedRegion.region, selectedRegion.subregion);
        
        
    // }, []);

    const RenderLiblist = useCallback(() => {

        //console.log("renderInfo", bookDetail);
        //console.log("bDtl3", bookDetail3);
        if (bookDetail.message === 'success') {
            if (bookDetail.info.libraries.length === 0) {
                return(
                    <p>현재 해당 도서를 구비중인 도서관이 없습니다.</p>
                )
            }
            else {
                return(
                    <>
                        <p>해당 도서를 구비중인 도서관 목록</p>
                        <div className="LibraryList">
                            {bookDetail.info.libraries.map((lib, i) =><LibraryDetail key={lib.name} lib={lib} i={i} />)}
                        </div>
                    </>
                )
            }
            
        }
        else {
            return(
                <p>현재 해당 도서의 정보가 제공되지 않습니다.</p>
            )
        }

        
    },[bookDetail])

    const libDtlOnClick = useCallback((i) => {
        if (libSelected !== i) {
            setLibSelected(i);
        }
        else if (libSelected === i) {
            setLibSelected(-1);
        }
    },[libSelected, setLibSelected])

    const renderLibInfo = useCallback((lib) => {
        return (
            <>
                <span>주소 : {lib.address}</span><br/>
                <span>대출상태 : {lib.available === 'Y' ? "대출가능" : "대출중"}</span>
                <br/>
                <br/>
            </>
        )
    },[libSelected])

    const LibraryDetail = useCallback((props) => {

        const { lib, i } = props;

        return(
            <>
                <div className="LibraryInfo">
                    <details>
                        <summary><span onClick={() => libDtlOnClick(i)}>{lib.name}</span></summary><br/>
                        <span>주소 : {lib.address}</span><br/>
                        <span>대출상태 : {lib.available === 'Y' ? "대출가능" : "대출중"}</span>
                    </details>
                    


                    {/* {libSelected === i ? renderLibInfo(lib) : null} */}
                </div>
            </>
        )
    },[libDtlOnClick, renderLibInfo, libSelected])

    


    const renderDetail = useCallback((book) => {

        
        
        let temp = RegionCodeTranslate({code: selectedRegion.region + selectedRegion.subregion});
        //console.log(RegionCodeTranslate({code: selectedRegion.region + selectedRegion.subregion}))

        return (
            <>
                <tr>
                    <td colSpan="2">
                        <div className="BookDetailInfo">
                            <span>{book.description}</span><br/>
                            <span>가격 : {bookDetail.info.price}원</span><br/>
                            <span>재고 : {bookDetail.info.stock === "available" ? "재고 있음" : "재고 없음"}</span>
                            <div className="LibraryInfo">
                                <div className="LibraryDetailInfo">
                                    <p>선택된 지역 : {temp.fullName}</p>
                                    <RenderLiblist bookDetail={bookDetail}/>
                                </div>
                                {/* <RenderMaps location={{
                                    longitude: 126.9777500,
                                    latitude: 37.566300
                                }} /> */}
                            </div>            
                        </div>               
                    </td>
                </tr>
                <tr>
                    <td colSpan="2">
                        <div style={{textAlign: "center"}}>
                            <button className="CloseDetailButton" onClick={() => setShowDetail(false)}>
                                닫기
                            </button>
                        </div>
                    </td>
                </tr>
            </>
        )
    },[selectedRegion, bookDetail])

    //setTemp(props.books[page])
    //console.log('temp',temp);)
    //if (typeof(book) !== "undefined" && book !== "undefined") {

    const handleImgError = (e) => {
        e.target.src = default_Thumbnail;
    }

    const renderLoading = () => {
        return(
            <tr>
                <td>
                    <span>Loading...</span>
                </td>
            </tr>
        )
    }
    
    return (
        <div className="BookInfoBox" >
            <table style={{width: "100%"}}>
                <tbody>
                    <tr onClick={() => onClickfunc(props={e: i+1, showDtl: showDetail})} style={{display: "flex",alignItems: "center" , minHeight: "125px"}}>
                        <td className="BookImgTable">
                            <img className="BookImg" src={book.image ? book.image : default_Thumbnail} onError={handleImgError} alt={book.title} />
                        </td>                                                                
                        <td>
                            <span>{typeof(book.rank) !== 'undefined' && book.rank+". "}{book.title}</span>
                            <br></br>
                            <span>{book.author}</span>
                            <span>ㅣ</span>
                            <span>{book.publisher}</span>
                            <span>ㅣ</span>
                            <span>{book.isbn}</span>
                            <span>ㅣ</span>
                            <span>{frommypage ? book.date : book.year}</span>
                            
                        </td>                                         
                    </tr>                                    
                    {showDetail ?
                    (loadingState ? renderLoading() : renderDetail(book))
                    : null}
                </tbody>
            </table>
            {frommypage ?
                            <button className="DeleteSearchListButton" onClick={() => deleteSearchList()}>
                                X
                            </button> : null}
        </div>
    );
    //}
    // else{
    //     return "No result";
    // }
    

    // return (
    //     props.books.map((book, i) => {
    //         //if (typeof(book) !== "undefined" && book !== "undefined") {
    //         //}

            
    //     })
    // ); 
};

{/* {modal && (modalList === (i+1)) ? 
                            <Modal setModal={setModal} 
                                title={book.title}
                                description={book.description}
                                clickoff={true}
                            /> : null} */}

export default BookList;
