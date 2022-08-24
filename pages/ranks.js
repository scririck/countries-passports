import WorldMap from '../components/WorldMap';
import Flag from '../components/Flags';
import CountryCounter from '../components/CountryCounter';
import { useState, useContext } from "react";
import { Context } from '../lib/Context';

export default function RankPage() {

    const {
        passport, 
        vPassport, 
        passportRanks, 
        rankValues, 
        getCCFromTitle, 
        getRankFullName,
        getPassportRank
    } = useContext(Context);

    const [selectedRank, setSelectedRank] = useState('power');
    
    const getPass = () => {
        return selectedRank === 'visitor'? vPassport : passport;
    }

    const [showNum, setShowNum] = useState(10);

    const getMapRanks = (type) => {
        const map = {};
        if(passportRanks && passportRanks[type]){
            const length = passportRanks[type].length;
            passportRanks[type].forEach((c,index) => {
                map[c.title] = {
                    fill: hslToHex(30, 50, mapRange(index, length, 0, 15, 60)),
                }
            });
        }
        return map;
    }

    function mapRange (value, a, b, c, d) {
        value = (value - a) / (b - a);
        return c + value * (d - c);
    }

    const hslToHex = (h, s, l) => {
        l /= 100;
        const a = s * Math.min(l, 1 - l) / 100;
        const f = n => {
          const k = (n + h / 30) % 12;
          const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
          return Math.round(255 * color).toString(16).padStart(2, '0');   // convert to Hex and prefix "0" if needed
        };
        return `#${f(0)}${f(8)}${f(4)}`;
      }

    return(
        <div className="page ranks-page">
            <header>
                {rankValues && Object.keys(rankValues).map( title => (
                    <section key={"section_"+title} className={`${selectedRank === title? 'active' : ''}`} onClick={()=>{
                        setSelectedRank(title);
                    }}>{getRankFullName(title)}</section>
                ))}
            </header>
            <div className="ranks-container">
                <div className="rank-map">
                        <WorldMap 
                            countryData={getMapRanks(selectedRank)}
                            highlightOnOver={false}
                        />
                </div>
                <div className="ranks">
                    {rankValues[selectedRank] && rankValues[selectedRank].map( (value, i) => {
                        if(i < showNum){
                            return (
                                <div key={`rank_${i+1}`} className="rank-group">
                                    <div className={`title num${i+1}`}><div className={`num`}>#{i+1}</div> on {getRankFullName(selectedRank)}</div>
                                    <div className="rank-countries">
                                    {passportRanks[selectedRank].map((rank, i)=>{
                                        if(rank.rank === value){
                                            return(
                                                <div key={'rank'+i} className="rank-country">
                                                    <Flag cc={getCCFromTitle(rank.title)}/> 
                                                    <span>{rank.title}</span>
                                                    {selectedRank !== 'normal' ?
                                                        <CountryCounter 
                                                            countryData={getPass()[rank.title]} 
                                                            numCountries={1}
                                                            withSurface={selectedRank === 'surface'}
                                                        />
                                                    :
                                                        <div className="simple-counter">{rank.rank}/199 Countries ({Math.round(rank.rank * 100 / 199 * 100) / 100}%)</div>
                                                    }
                                                </div>
                                            )
                                        }
                                    })}
                                    </div>
                                </div>
                            );
                        }
                    })}
                </div>
                <div className="rank-buttons">
                    {rankValues[selectedRank] && showNum < rankValues[selectedRank].length && <button onClick={()=>{
                        setShowNum(curr=>curr+10 <= rankValues[selectedRank].length? curr+10 : rankValues[selectedRank].length)
                    }}>Show more</button> }
                    {showNum > 10 && <button onClick={()=>{
                        setShowNum(curr=>curr-10 > 10? curr-10 : 10)
                    }}>Show less</button>}
                    {rankValues[selectedRank] && showNum < rankValues[selectedRank].length &&
                        <button onClick={()=>{
                            setShowNum(rankValues[selectedRank].length)
                        }}>Show all</button>
                    }
                </div>
            </div>
        </div>
    )
}