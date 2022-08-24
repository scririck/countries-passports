import Select from 'react-select'
import { useState, useEffect, useRef, useContext } from "react";
import { Context } from '../lib/Context';
import WorldMap from '../components/WorldMap';
import Flag from '../components/Flags';
import CountryCounter from '../components/CountryCounter';

export default function Home() {

  const {
    visaPox, 
    passport, 
    detailed, 
    vPassport, 
    passportRanks, 
    rankValues, 
    getCCFromTitle,
    getRankFullName,
    getRank
  } = useContext(Context);

  // useEffect(()=>{
  //   const comboRanks = {};
  //   const key1 = "Italy";
  //   const key2 = "Cape Verde";
  //   Object.keys(passport).forEach((key3) => {
  //     if(key1 !== key2 && key1 !== key3 && key2 !== key3){
  //       const comboName = `${key1} + ${key2} + ${key3}`;
  //       if(!comboRanks[comboName]){
  //           console.log(comboName)
  //           const comboValues = getComboValues(getPass(), [{value: key1}, {value:key2}, {value:key3}]);
  //           comboRanks[comboName] = getRank(comboName, comboValues, 'overall', 3);
  //       }
  //     }
  //   });
  //   const res = Object.values(comboRanks).sort((a, b) => (a.rank > b.rank? -1 : 1));
  //   console.log(res);
  // },[passport])

  const [visitorMode, setVisitorMode] = useState(false);
  useEffect(()=>{
    if(visitorMode && selectedCountries && selectedCountries.length > 1){
      setSelectedCountries([selectedCountries[0]]);
    }
  },[visitorMode])

  const [selectedCountries, setSelectedCountries] = useState([]);
  useEffect(()=>{
    checkResize();
  },[selectedCountries]);

  const getPass = () => {
    return visitorMode? vPassport : passport;
  }

  const VisaFilter = ({type, active, setActive}) => {
    return (
      <div className={`filter ${type} ${active? "active" : ""}`} onClick={()=>{
        setActive(curr=>({...curr, [type]:!curr[type]}));
      }}></div>
    )
  }

  const [visaFilters, setVisaFilters] = useState({
    fom: true,
    vf: true,
    voa: true,
    eta: true,
    vr: true,
  });
  const [searchValue, setSearchValue] = useState('');

  const header = useRef();
  const tools = useRef();
  const map = useRef();

  const [countriesHeight, setCountriesHeight] = useState(0);

  const checkResize = () =>{
    let totalHeight = 0;
    if(header && header.current && tools && tools.current && map && map.current){
      totalHeight = window.innerHeight - 10;
      totalHeight -= header.current.getBoundingClientRect().height;
      totalHeight -= tools.current.getBoundingClientRect().height;
      if(window.innerWidth < 1200){
        totalHeight -= map.current.getBoundingClientRect().height + 28;
      }
    }
    setCountriesHeight(totalHeight);
  }

  const [isCtrlDown, setIsCtrlDown] = useState(false);
  useEffect(()=>{
    window.addEventListener("resize", ()=>{
      checkResize();
    });
    window.addEventListener("keydown", (e)=>{
      if(e.key === "Control"){
        setIsCtrlDown(true);
      }
    });
    window.addEventListener("keyup", (e)=>{
      if(e.key === "Control"){
        setIsCtrlDown(false);
      }
    });
    checkResize();
  },[]);

  const getComboValues = (passports, selectedCountries) => {
    if(selectedCountries.length === 1){
      return passports[selectedCountries[0].value];
    }
    const comboValues = {};
    selectedCountries.forEach(({value})=>{
      const countries = passports[value];
      Object.values(countries).forEach(country=>{
        const {title} = country;
        if(!selectedCountries.map(option=>(option.value)).includes(title)){ //if it's not one of the selected countries
          if(!comboValues[title]){
            comboValues[title] = country;
          }else{
            comboValues[title] = getBetterCountry(comboValues[title], country);
          }
        }
      })
    })
    return comboValues;
  }

  const getBetterCountry = (c1, c2) => {
    const visaTypes = ["fom", "vf", "voa", "eta", "vr"];
    if(c1.visaType !== c2.visaType){
      const i1 = visaTypes.indexOf(c1.visaType);
      const i2 = visaTypes.indexOf(c2.visaType);
      return i1 < i2 ? c1 : c2;
    }
    if(c1.visa !== c2.visa){
      const type = c1.visaType;
      const i1 = visaPox[type].indexOf(c1.visa);
      const i2 = visaPox[type].indexOf(c2.visa);
      return i1 < i2 ? c1 : c2;
    }
    return c1;
  }

  const [currentData, setCurrentData] = useState({})
  useEffect(()=>{
    if(selectedCountries){
      setCurrentData(getComboValues(getPass(), selectedCountries));
    }
  },[visitorMode, selectedCountries])
  useEffect(()=>{
    console.log(currentData)
  },[currentData])

  const selectCountryFromMap = (title) => {
    let countryAlready = false;
    selectedCountries.forEach(country=>{
      if(country.value === title){
        countryAlready = true;
      }
    })
    if(!countryAlready){
      const newCountry = {value: title, label: title, key: title};
      setSelectedCountries(curr => (isCtrlDown? [...curr, newCountry] : [newCountry]));
    }else{
      const curr = [...selectedCountries];
      for(let i=0; i<selectedCountries.length; i++){
        const selectedCountry = selectedCountries[i];
        if(selectedCountry.value === title){
          curr.splice(i, 1);
          break;
        }
      }
      setSelectedCountries(curr);
    }
  }

  const getRankOf = (options) => {
    const key = Object.keys(rankValues)[refRank];
    const rank = passportRanks[key];
    // const values = rankValues[key];
    if(options.length === 1){
      for(let i=0; i<rank.length; i++){
        if(rank[i].title === options[0].value){
          return i + 1;
        }
      }
    }else{
      const customRank = getRank("Custom", currentData, key, options.length);
      for(let i=0; i<rank.length; i++){
        if(rank[i].rank < customRank.rank){
          return `${i + 1} + ${Math.round((customRank.rank-rank[i].rank)*100/rank[i].rank*100)/100}%`;
        }
      }
    }
  }

  const getFillFromVisaType = (visaType) => {
    const s = "55%";
    const l = "50%";
    switch(visaType){
        case "fom":
          return `hsl(200, ${s}, ${l})`;
        case "vf":
            return `hsl(150, ${s}, ${l})`;
        case "voa":
          return `hsl(100, ${s}, ${l})`;
        case "eta":
          return `hsl(50, ${s}, ${l})`;
        case "vr":
          return `hsl(0, ${s}, ${l})`;
    }
}

  const mapFromData = (data) => {
    const map = {};
    Object.values(data).forEach(c=>{
      map[c.title] = {
        title: c.title,
        fill: getFillFromVisaType(c.visaType),
      }
    });
    selectedCountries.forEach(c=>{
      map[c.value] = {
        title: c.value,
        fill: "#222222",
        highlightOnOver: false,
      }
    })
    return map;
  }
  

  const [refRank, setRefRank] = useState(0);

  return (
    <div className="page home-page">
      <header ref={header}>
        <div className="country-title" style={{flexDirection: selectedCountries.length > 1 ? "column" : "row"}}>
              {selectedCountries && selectedCountries.length > 0 ? <>
                <div className="flags">
                {selectedCountries.map(c => (<Flag key={`flag-${c.value}`} cc={getCCFromTitle(c.value)}/>))}
                {selectedCountries.length === 1? 
                  selectedCountries[0].value : 
                  `COMBO (${selectedCountries.map(c=>(getCCFromTitle(c.value).toUpperCase())).toString().replaceAll(',',' + ')})`
                }
                </div>
                <div className="title2">
                  {selectedCountries.length === 1 && ' | '}   
                  <span className="pointer" onClick={()=>{
                    setRefRank(curr => curr === Object.keys(rankValues).length - 1 ? 0 : curr + 1);
                  }}>{`${getRankFullName(Object.keys(rankValues)[refRank])} #${getRankOf(selectedCountries)}`}</span>
                </div>
              </> : "Select a country"}
          </div>
        <div className="select-container">
          <Select 
            className="select"
            value={selectedCountries}
            onChange={(e)=>{setSelectedCountries(e)}}
            options={Object.keys(getPass()).map(country => ({value: country, label: country, key: country}))}
            isMulti={!visitorMode}
          />
          <label>Visitor Mode<input type="checkbox" checked={visitorMode} onChange={(e)=>{setVisitorMode(e.target.checked)}}></input></label>
        </div>
      </header>
      <main>
          <section className="map" style={{width: "70%"}} ref={map}>
            <WorldMap 
              countryData={mapFromData(currentData)} 
              onCountryClick={(title)=>{selectCountryFromMap(title)}}
            />
            {selectedCountries && selectedCountries.length > 0 && <CountryCounter numCountries={selectedCountries.length} countryData={currentData}/>}
          </section>
        {selectedCountries && selectedCountries.length > 0 && selectedCountries[0].value && <>
          <section style={{width: "30%"}}>
            <div className="table-container">
              <div className="tools" ref={tools}>
                <div className="search-bar-container">
                  <input 
                    className="search-bar"
                    type="text" 
                    placeholder="Find a country"
                    value={searchValue}
                    onChange={(e)=>{setSearchValue(e.target.value)}}
                  />
                </div>
                <div className="visa-filters">
                  {Object.keys(visaPox).map(visaType => (
                    <VisaFilter 
                      key={visaType} 
                      type={visaType} 
                      active={visaFilters[visaType]}
                      setActive={setVisaFilters}
                    />
                  ))}
                </div>
              </div>
              <div className="countries" style={{height: countriesHeight}}>
                {Object.values(currentData).map(country => {
                  if(visaFilters[country.visaType] && country.title.toLowerCase().includes(searchValue.toLowerCase())){
                    return (
                      <div className="country" key={country.title}>
                        <div className="title" onClick={()=>{
                          selectCountryFromMap(country.title);
                        }}><Flag key={`flag-icon-${country.cc}`} cc={country.cc}/>{country.title}</div>
                        <div className={`visa ${country.visaType}`}>{country.visa}</div>
                      </div>
                    )
                  }
                  }
                )}
              </div>
            </div>
          </section>
        </>}
      </main>
      </div>
  );
}
