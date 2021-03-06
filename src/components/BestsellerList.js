import React, { useState, useEffect, useCallback, useMemo } from "react";
import BookList from "./BookList";
import axios from 'axios';
import "../style/BestsellerList.scss"
import tab from "../style/image/tabBoard_bar.gif";
import PuffLoader from 'react-spinners/PuffLoader';
import RefreshIcon from '@material-ui/icons/Refresh';

const END_POINT = `${process.env.REACT_APP_END_POINT}`;


function Bestseller() {

    const [loadingState, setLoadingState] = useState(false);
    const [books, setBook] = useState([]);
    const [display] = useState(10);
    const [searchGenre, setSearchGenre] = useState("종합");
    const [isError, setIsError] = useState(false);

    const bestsellerGenre = useMemo(() => ["종합", "가정/요리/뷰티", "건강/취미/레저", "경제경영", "고전", "과학", "만화",
                            "사회과학", "소설/시/희곡", "어린이", "에세이", "여행", "역사", "예술/대중문화",
                            "유아", "인문학", "자기계발", "장르소설", "종교/역학", "좋은부모", "청소년"],[]);
    
    const genreCode = useMemo(()=> [0, 1230, 55890, 170, 2105, 987, 2551, 798, 1, 1108, 55889, 1196, 74, 517, 13789, 656,
                        336, 112011, 1237, 2030, 1137],[]);

    const getBestseller = useCallback( async (props) => {
        setBook([]);
        setIsError(false);
        setLoadingState(true);
        try{
            const res = await axios.get(`${END_POINT}/bestseller`, {
                params: {
                    code: genreCode[bestsellerGenre.indexOf(props.genre)],
                },
            });
            const booklist = res.data.info.bookList.map((item, index) => ({
                    id: index,
                    rank: item.rank,
                    description: item.description.replace(/(<([^>]+)>)/ig,""),
                    title: item.title.replace(/(<([^>]+)>)/ig,""),
                    image: item.image,
                    year: item.year,
                    author: item.author.replace(/(<([^>]+)>)/ig,""),
                    isbn: item.isbn.replace(/(<([^>]+)>)/ig,""),
                    publisher: item.publisher.replace(/(<([^>]+)>)/ig,""),
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
    },[bestsellerGenre, display, genreCode]);

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
                    {(props.i%11) < 10 ? (props.i === 10 || props.i === 20) ? null : <img className='tab' src={tab} alt=''></img>: <br></br>}
                </>
            );
        }
        else {
            return (
                <>
                    <span className="Genre" onClick={() => onClickGenre(props)}>{props.genre}</span>
                    {(props.i%11) < 10 ? (props.i === 10 || props.i === 20) ? null : <img className='tab' src={tab} alt=''></img> : <br></br>}
                </>
            );
        }
        
    }

    const selectBestsellerGenre = () => {
        return (
            <div className="BestsellerGenre">
                {bestsellerGenre.map((genre, i) => <RenderGenre key={genre} genre={genre} i={i} />)}
            </div>
        )
    }

    useEffect(() => {getBestseller({genre: searchGenre});},[searchGenre, getBestseller]);

    const onRefreshClick = () => {
        getBestseller({genre: searchGenre});
    }

    return (
        <div className="BestsellerList">
            <div className="BestsellerHeader">
                <h2>{searchGenre} 베스트 셀러 TOP 10</h2>
                <div className="RefreshButton">
                    <RefreshIcon fontSize="large" onClick={onRefreshClick}/>
                </div>
            </div>
            {selectBestsellerGenre()}
            <div style={{textAlign: 'center'}}>{loadingState && books.length === 0 ? 
                <>
                    <h5 style={{marginTop: "20px"}}>검색중입니다</h5>
                    <PuffLoader color={"#00ACFD"} loading={true} css={{display: "block", height: "100px", margin: "auto", marginTop: "20px"}} size={80} />
                </>: null}
            </div>
            {isError ? <><div style={{margin: "60px"}}>베스트 셀러 정보를 불러오는데 실패하였습니다.</div></> 
                    : books.map((book, i) => <BookList key={book.id} book={book} i={i} frommypage={false}/>)}
        </div>
    )
}

export default Bestseller;