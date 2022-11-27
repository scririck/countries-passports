import Select from 'react-select';
import WorldMap from '../components/WorldMap';
import Flag from '../components/Flags';
import CountryCounter from '../components/CountryCounter';
import { useState, useContext, useEffect } from "react";
import { Context } from '../lib/Context';

export default function ComboPage() {

    const {
        passport, 
        vPassport, 
        rankValues, 
        getCCFromTitle, 
        getRankFullName,
        getRank,
        getComboValues,
        dualOnlyCountries
    } = useContext(Context);

    const [selectedRank, setSelectedRank] = useState('power');
    const [lastRank, setLastRank] = useState('');
    const [comboNum, setComboNum] = useState(2);
    const [selectValues, setSelectValues] = useState([{},{}]);

    const [bestPartners, setBestPartners] = useState([]);
    const [partnerValues, setPartnerValues] = useState({});
    useEffect(()=>{
        const values = [];
        bestPartners.forEach( combo => {
            if(!values.includes(combo.rank)){
                values.push(combo.rank)
            }
        });
        values.sort((a,b)=>(a>b?-1:1));
        setPartnerValues(values.length > 100? values.slice(0,99) : values);
    },[bestPartners]);

    const [loadingPartners, setLoadingPartners] = useState(false);
    useEffect(()=>{
        if(loadingPartners){
            setTimeout(()=>{
                getBestPartners(comboNum === 2.5? 2 : 1, selectValues[0].value, comboNum === 3? selectValues[1].value : null);
            },[50])
        }
    },[loadingPartners])

    const getBestPartners = (num, key1, key2) => {

        const targetPass = selectedRank === 'visitor' ? vPassport : passport;

        let pass;
        if(dualOnly){
            const dualOnlyPass = {};
            Object.entries(targetPass).forEach( ([key, country]) => {
                if(dualOnlyCountries.includes(key) || key === key1 || key === key2){
                    dualOnlyPass[key] = country;
                }
            });
            pass = dualOnlyPass;
        }else{
            pass = targetPass;
        }

        const comboRanks = {};
        Object.keys(pass).forEach((key3) => {
          if(num === 2){
            Object.keys(pass).forEach((key2) => {
                let validSearch = true;
                validSearch &= key1 !== key2 && key1 !== key3 && key2 !== key3;
                if(dualOnly){
                    validSearch &= dualOnlyCountries.includes(key2) && dualOnlyCountries.includes(key3);
                }
                if(validSearch){
                    let comboNames = [key2, key3];
                    comboNames.sort((a,b)=>(a<b?-1:1));
                    comboNames.unshift(key1);
                    const comboName = `${comboNames[0]} + ${comboNames[1]} + ${comboNames[2]}`;
                    if(!comboRanks[comboName]){
                        const selectedCountries = [{value: comboNames[0]}, {value:comboNames[1]}, {value:comboNames[2]}];
                        const comboValues = getComboValues(pass, selectedCountries);
                        comboRanks[comboName] = getRank(comboName, comboValues, selectedRank, 3);
                    }
                }
            });
          }else{
            let validSearch = true;
            validSearch &= key1 !== key2 && key1 !== key3 && key2 !== key3;
            if(dualOnly){
                    validSearch &= dualOnlyCountries.includes(key3);
                }
            if(validSearch){
                const comboName = key2? `${key1} + ${key2} + ${key3}` : `${key1} + ${key3}`;
                if(!comboRanks[comboName]){
                    const selectedCountries = key2? [{value: key1}, {value:key2}, {value:key3}] : [{value: key1}, {value:key3}];
                    const comboValues = getComboValues(pass, selectedCountries);
                    comboRanks[comboName] = getRank(comboName, comboValues, selectedRank, key2? 3 : 2);
                }
            }
          }
        });
        const res = Object.values(comboRanks).sort((a, b) => (a.rank > b.rank? -1 : 1));
        setBestPartners(res.length > 300? res.slice(0,299) : res);
        setLoadingPartners(false);
    }

    const [showNum, setShowNum] = useState(10);
    const [dualOnly, setDualOnly] = useState(true);

    return(
        <div className="page combo-page">
            <header>
                {rankValues && Object.keys(rankValues).map( title => (
                    <section key={"section_"+title} className={`${selectedRank === title? 'active' : ''}`} onClick={()=>{
                        setSelectedRank(title);
                    }}>{getRankFullName(title)}</section>
                ))}
            </header>
            <div className="combo-container">
                <div className="combo-header">
                    <div className={`combo-tab ${comboNum === 2 ? 'active' : ''}`} onClick={()=>{
                                setComboNum(2);
                        }}>2nd Partners
                    </div>
                    <div className={`combo-tab ${comboNum === 3 ? 'active' : ''}`} onClick={()=>{
                                setComboNum(3);
                        }}>3rd Partners
                    </div>
                    <div className={`combo-tab ${comboNum === 2.5 ? 'active' : ''}`} onClick={()=>{
                                setComboNum(2.5);
                        }}>2nd & 3rd Partners
                    </div>
                </div>
                <div className="combo-extra">
                    <label>Dual Citizenship Countries Only<input type="checkbox" checked={dualOnly} onChange={(e)=>{
                        setDualOnly(e.target.checked);
                    }}/></label>
                </div>
                <div className="combo-selectors" style={{gridTemplateColumns: `repeat(${Math.floor(comboNum)}, 1fr)`}}>
                    {Array.from(Array(Math.floor(comboNum)).keys()).map(n=>(
                        <div key={`selector ${n}`} className="combo-select-container">
                            {n < Math.floor(comboNum) - 1 ?
                                <Select 
                                    className="select"
                                    value={selectValues[n]}
                                    onChange={(e)=>{
                                        const curr = [...selectValues];
                                        curr[n] = e;
                                        setSelectValues(curr);
                                    }}
                                    options={Object.keys(selectedRank === 'visitor'? vPassport : passport).map(country => ({value: country, label: country, key: country}))}
                                />
                                :
                                <button disabled={
                                    loadingPartners || 
                                    (comboNum < 3 ? 
                                        !selectValues[0].value 
                                    : 
                                        !selectValues[0].value || !selectValues[1].value || selectValues[0].value === selectValues[1].value)
                                } onClick={()=>{
                                    setLastRank(selectedRank);
                                    setBestPartners([]);
                                    setLoadingPartners(true);
                                }}>
                                    {loadingPartners ? 'Loading partners...' : `Get best ${comboNum === 2.5? "partners" : "partner"}`}
                                </button>
                            }
                        </div>
                    ))}
                </div>
                <div className="ranks">
                    {partnerValues.length > 0 && partnerValues.map( (value, i) => {
                        if(i < showNum){
                            return (
                                <div key={`rank_${i+1}`} className="rank-group">
                                    <div className={`title num${i+1}`}><div className={`num`}>#{i+1}</div> on {getRankFullName(lastRank)}</div>
                                    <div className="rank-countries">
                                    {bestPartners.map((combo, i)=>{
                                        if(combo.rank === value){
                                            return(
                                                <div key={'rank'+i} className="rank-country">
                                                    {combo.title.split(" + ").map(title => (
                                                        <Flag key={`flag_${title}`} className="small" cc={getCCFromTitle(title)}/> 
                                                    ))}
                                                    <span className="very-small">{combo.title}</span>
                                                    {lastRank !== 'normal' ?
                                                        <CountryCounter 
                                                            fixedCountryCount={combo} 
                                                            withSurface={lastRank === 'surface'}
                                                        />
                                                    :
                                                        <div className="simple-counter">{combo.rank}/199 Countries ({Math.round(combo.rank * 100 / 199 * 100) / 100}%)</div>
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
                    {partnerValues && showNum < partnerValues.length && <button onClick={()=>{
                        setShowNum(curr=>curr+10 <= partnerValues.length? curr+10 : partnerValues.length)
                    }}>Show more</button> }
                    {showNum > 10 && <button onClick={()=>{
                        setShowNum(curr=>curr-10 > 10? curr-10 : 10)
                    }}>Show less</button>}
                    {partnerValues && showNum < partnerValues.length &&
                        <button onClick={()=>{
                            setShowNum(partnerValues.length)
                        }}>Show all</button>
                    }
                </div>
            </div>
        </div>
    )
}