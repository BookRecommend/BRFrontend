import React, { useState, useEffect, useCallback, useMemo } from "react";
import { useSelector } from 'react-redux';
import BookList from "./BookList";
import axios from 'axios';
import "../style/LibraryRank.scss"
import tab from "../style/image/tabBoard_bar.gif";
import PuffLoader from 'react-spinners/PuffLoader';
import RefreshIcon from '@material-ui/icons/Refresh';

const END_POINT = `${process.env.REACT_APP_END_POINT}`;

function leftPad(value) { if (value >= 10) { return value; } return `0${value}`; }

let deftoday = new Date();
    let today1 = new Date();
    let defTemp = new Date(today1.setMonth(today1.getMonth()-3));
    let endDate = `${deftoday.getFullYear()}-${leftPad(deftoday.getMonth() + 1)}-${leftPad(deftoday.getDate())}`;
    const defaultTerm = { startdate:  `${defTemp.getFullYear()}-${leftPad(defTemp.getMonth() + 1)}-${leftPad(defTemp.getDate())}`,
                            enddate: `${deftoday.getFullYear()}-${leftPad(deftoday.getMonth() + 1)}-${leftPad(deftoday.getDate())}`};


function LibraryRank() {

    const [loadingState, setLoadingState] = useState(false);
    const [books, setBook] = useState([]);
    const [display] = useState(10);
    const [searchGenre, setSearchGenre] = useState("전체");
    const [searchTerm, setSearchTerm] = useState(defaultTerm);
    const [selected, setSelected] = useState("3개월");
    const [isError, setIsError] = useState(false);

    const loginState = useSelector(state => state.updateLoginState.login);
    const loginInfo = useSelector(state => state.updateLoginState.user);


    const rankGenre = useMemo(() => ["전체", "철학", "종교", "사회과학", "자연과학",
                        "기술과학", "예술", "언어", "문학", "역사"],[]);
    const genreCode = useMemo(() => [0, 1, 2, 3, 4, 5, 6, 7, 8, 9],[]);
    const age = {
        "0": "영유아(0~5세)",
        "6": "유아(6~7세)",
        "8": "초등(8~13세)",
        "14": "청소년(14~19세)",
        "20": "20대",
        "30": "30대",
        "40": "40대",
        "50": "50대",
        "60": "60세 이상",
        "-1": "전연령",
    };

    const getLibraryRank = useCallback( async (props) => {
        setBook([]);
        setIsError(false);
        setLoadingState(true);
        try{
            const res = await axios.get(`${END_POINT}/library`, {
                params: {
                    startdate: searchTerm.startdate,
                    enddate: searchTerm.enddate,
                    age: (loginState ? loginInfo.age : -1),
                    code: genreCode[rankGenre.indexOf(props.genre)],
                },
            });
            const booklist = res.data.info.result.map((item, index) => ({
                    id: index,
                    rank: item.rank,
                    description: item.description,
                    title: item.title,
                    image: item.image,
                    year: item.year,
                    author: item.author,
                    isbn: item.isbn,
                    publisher: item.publisher,
                })
            );
            
            let testlist = [];
            let k = 0;
            let temp = [];

            for (let i = 0; i < display * 10; i++) {
                if (typeof(booklist[i]) !== "undefined" && booklist[i] !== "undefined") {
                    temp[k] = booklist[i];
                    k++;
                }
            }

            if (temp.length !== 0) {
                testlist = temp;
            }
            setBook(testlist);
            setLoadingState(false);
        }
        catch (error) {
        console.log(error);
        setLoadingState(false);
        setIsError(true);
        }
    },[display, genreCode, loginInfo.age, loginState, rankGenre, searchTerm.enddate, searchTerm.startdate]);

    const onClickGenre = (props) => {
        if (props.genre !== searchGenre){
            setBook([]);
            setSearchGenre(props.genre);
        }
    }

    const RenderGenre = (props) => {
        if (searchGenre === props.genre) {
            return (
                <>
                    <span className="GenreSelected" onClick={() => onClickGenre(props)}>{props.genre}</span>
                    {(props.i%11) < 10 ? (props.i === 9) ? null : <img className='tab' src={tab} alt=''></img> : <br></br>}
                </>
            );
        }
        else {
            return (
                <>
                    <span className="Genre" onClick={() => onClickGenre(props)}>{props.genre}</span>
                    {(props.i%11) < 10 ? (props.i === 9) ? null : <img className='tab' src={tab} alt=''></img> : <br></br>}
                </>
            );
        }
    }

    const selectRankGenre = () => {
        return (
            <div className="LibraryRankGenre">
                {rankGenre.map((genre, i) => <RenderGenre key={genre} genre={genre} i={i} />)}
            </div>
        )
    }

    const SelectTerm = () => {

        
        let today = new Date();
        const onChange = (e) => {
            setSelected(e.target.value);
            
            switch (e.target.value) {
                case "1주" :
                    let temp1 = new Date(today.setDate(today.getDate()-7));
                    const term1 = { startdate:  `${leftPad(temp1.getFullYear())}-${leftPad(temp1.getMonth() + 1)}-${leftPad(temp1.getDate())}`,
                                    enddate: endDate};
                    setSearchTerm(term1);
                    break;
                case "1개월" :
                    let temp2 = new Date(today.setMonth(today.getMonth()-1));
                    const term2 = { startdate:  `${leftPad(temp2.getFullYear())}-${leftPad(temp2.getMonth() + 1)}-${leftPad(temp2.getDate())}`,
                                    enddate: endDate};
                    setSearchTerm(term2);
                    break;
                case "3개월" :
                    let temp3 = new Date(today.setMonth(today.getMonth()-3));
                    const term3 = { startdate:  `${leftPad(temp3.getFullYear())}-${leftPad(temp3.getMonth() + 1)}-${leftPad(temp3.getDate())}`,
                                    enddate: endDate};
                    setSearchTerm(term3);
                    break;
                case "6개월" :
                    let temp4 = new Date(today.setMonth(today.getMonth()-6));
                    const term4 = { startdate:  `${leftPad(temp4.getFullYear())}-${leftPad(temp4.getMonth() + 1)}-${leftPad(temp4.getDate())}`,
                                    enddate: endDate};
                    setSearchTerm(term4);
                    break;
                case "1년" :
                    let temp5 = new Date(today.setFullYear(today.getFullYear()-1));
                    const term5 = { startdate:  `${leftPad(temp5.getFullYear())}-${leftPad(temp5.getMonth() + 1)}-${leftPad(temp5.getDate())}`,
                                    enddate: endDate};
                    setSearchTerm(term5);
                    break;
                default:
            }
        }

        return (
            <div className="SelectTerm" >
                <span>검색 기간 : </span>
                <select name="term" onChange={onChange} value={selected}>
                    <option value="1주">1주</option>
                    <option value="1개월">1개월</option>
                    <option value="3개월">3개월</option>
                    <option value="6개월">6개월</option>
                    <option value="1년">1년</option>
                </select>
            </div>
        )
    }

    useEffect(() => {getLibraryRank({genre: searchGenre});}, [getLibraryRank, searchGenre]);

    const onRefreshClick = () => {
        getLibraryRank({genre: searchGenre});
    }

    return (
        <div className="LibraryRank">
            <div className="LibraryRankHeader">
                <h2>{selected} {loginState ? age[loginInfo.age] : age["-1"]} {searchGenre} 인기대출도서 TOP 10</h2>
                <div className="RefreshButton">
                    <RefreshIcon fontSize="large" onClick={onRefreshClick}/>
                </div>
            </div>
            {selectRankGenre()}
            <SelectTerm />
            <div style={{textAlign: 'center'}}>{loadingState && books.length === 0 ? 
                <>
                    <h5 style={{marginTop: "20px"}}>검색중입니다</h5>
                    <PuffLoader color={"#00ACFD"} loading={true} css={{display: "block", height: "100px", margin: "auto", marginTop: "20px"}} size={80} />
                </>: null}
            </div>
            {isError ? <><div style={{margin: "60px"}}>인기대출도서 정보를 불러오는데 실패하였습니다.</div></>
                    : books.map((book, i) => <BookList key={book.id} book={book} i={i} frommypage={false} />)}
        </div>
    )
}

export default LibraryRank;