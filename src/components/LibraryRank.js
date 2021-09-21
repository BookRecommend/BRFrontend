import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from 'react-redux';
import BookList from "./BookList";
import axios from 'axios';
import "../style/BestsellerList.scss"

const END_POINT = "http://ec2-3-19-120-63.us-east-2.compute.amazonaws.com:8080";

// const END_POINT = "/v1/search/book.json";
// const Client_ID = "6kzLim7jrHaqIQQcyTyH";
// const Client_PW = "TKnpNps3Gg";

function leftPad(value) { if (value >= 10) { return value; } return `0${value}`; }

let deftoday = new Date();
    let today1 = new Date();
    let defTemp = new Date(today1.setMonth(today1.getMonth()-3));
    let endDate = `${deftoday.getFullYear()}-${leftPad(deftoday.getMonth() + 1)}-${leftPad(deftoday.getDate())}`;
    const defaultTerm = { startdate:  `${defTemp.getFullYear()}-${leftPad(defTemp.getMonth() + 1)}-${leftPad(defTemp.getDate())}`,
                                enddate: `${deftoday.getFullYear()}-${leftPad(deftoday.getMonth() + 1)}-${leftPad(deftoday.getDate())}`};


function LibraryRank() {

    const [loadingState, setLoadingState] = useState(false);
    //const [searchText, setSearchText] = useState("");
    const [books, setBook] = useState([]);
    //const [page, setPage] = useState(1);
    //const [totalPage, setTotalPage] = useState(0);
    const [display, setDisplay] = useState(10);
    //const [searchState, setSearchState] = useState(false);
    const [searchGenre, setSearchGenre] = useState("전체");
    const [searchTerm, setSearchTerm] = useState(defaultTerm);
    const [selected, setSelected] = useState("3개월");

    const loginInfo = useSelector(state => state.updateLoginState.user);


    const rankGenre = ["전체", "철학", "종교", "사회과학", "자연과학",
                        "기술과학", "예술", "언어", "문학", "역사"];
    
    const genreCode = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];

    
    

    const getLibraryRank = async (props) => {

        //setSearchTerm(defaultTerm);

        setBook([]);
        setLoadingState(true);
        console.log("code", genreCode[rankGenre.indexOf(props.genre)]);
        //console.log("dfT", defaultTerm);
        console.log("term", searchTerm);
        try{
            const res = await axios.get(`${END_POINT}/library`, {
                params: {
                    // query: props.genre,
                    // display: display*10
                    startdate: searchTerm.startdate,
                    enddate: searchTerm.enddate,
                    age: loginInfo.age,
                    code: genreCode[rankGenre.indexOf(props.genre)],
                },
                // headers: {
                //     "X-Naver-Client-Id": Client_ID,
                //     "X-Naver-Client-Secret": Client_PW
                // }
            });
            console.log(res.data);
            const booklist = res.data.info.result.map((item, index) => ({
                    id: index,
                    rank: item.rank,
                    title: item.title.replace(/(<([^>]+)>)/ig,""),
                    image: item.image,
                    author: item.author.replace(/(<([^>]+)>)/ig,""),
                    isbn: item.isbn.replace(/(<([^>]+)>)/ig,""),
                    year: item.year.replace(/(<([^>]+)>)/ig,""),
                    //description: item.description.replace(/(<([^>]+)>)/ig,""),
                    publisher: item.publisher.replace(/(<([^>]+)>)/ig,""),
                    //link: item.link
                })
            );
            
            let testlist = [];
            let totalpage = 0;
            let k = 0;
            let temp = [];

            for (let i = 0; i < display * 10; i++) {
                if (typeof(booklist[i]) !== "undefined" && booklist[i] !== "undefined") {
                    //console.log('booklist[i]',booklist[i]);
                    //console.log(booklist[i].length);
                    temp[k] = booklist[i];
                    k++;
                }
            }

            if (temp.length !== 0) {
                testlist = temp;
                totalpage++;
            }
    
            //setTotalPage(1);
            setBook(testlist);
            //setSearchState(true);
            setLoadingState(false);
            console.log("term", searchTerm);
            //console.log("testlist",testlist);
        }
        catch (error) {
        console.log(error);
        }
    };

    const onClickGenre = (props) => {
        console.log('props.genre',props.genre);
        if (props.genre !== searchGenre){
            setBook([]);
            setSearchGenre(props.genre);
        }
        //getLibraryRank({genre: searchGenre})
    }

    const RenderGenre = (props) => {
        //console.log(props);
        return (
            <>
                <span onClick={() => onClickGenre(props)}>{props.genre}</span>
                {(props.i%11) < 10 ? <span>, </span> : <br></br>}
            </>
        )
    }

    const selectRankGenre = () => {
        return (
            <div className="BestsellerGenre">
                {rankGenre.map((genre, i) => <RenderGenre key={genre} genre={genre} i={i} />)}
            </div>
        )
    }

    const SelectTerm = () => {

        
        let today = new Date();
        // let defTemp = new Date(today.setMonth(today.getMonth()-3));
        // const defaultTerm = { startdate:  `${defTemp.getFullYear()}-${defTemp.getMonth() + 1}-${defTemp.getDate()}`,
        //                 enddate: `${today.getFullYear()}-${today.getMonth() + 1}-${today.getDate()}`};
        // useEffect(() => {setSearchTerm(defaultTerm);}, [])
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

    //useEffect(() => {}, [])
    useEffect(() => {getLibraryRank({genre: searchGenre});},[searchGenre, searchTerm]);

    return (
        <div className="BestsellerList">
            <h2>{selected} {searchGenre} 인기대출도서</h2>
            {selectRankGenre()}
            <SelectTerm />
            <h2 style={{textAlign: 'center'}}>{loadingState && books.length === 0 ? "Loading..." : null}</h2>
            {books.map((book, i) => <BookList key={book.id} book={book} i={i} frommypage={false} />)}
        </div>
    )
}

export default LibraryRank;