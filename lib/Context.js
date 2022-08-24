import { useState, useEffect, createContext } from "react";
import passportData from '../lib/passport-data.json';
import detailed from '../lib/detailed-data.json';

export const Context = createContext();

export const ContextProvider = ({children}) => {

    //Fixed Data
    const visaPox = {
        "fom": ["freedom of movement"],
        "vr": [
          "eVisa (fast track)",
          "eVisa",
          "pre-visa on arrival",
          "COVID-19 ban",
          "visa required",
          "not admitted",
        ],
        "vf": [
          "visa-free",
          "visa-free (EASE)",
          "visa-free/360 days",
          "visa-free/240 days",
          "visa-free/180 days",
          "visa-free/120 days",
          "visa-free/90 days",
          "free visa on arrival/90 days",
          "visa-free (EASE)/90 days",
          "visa-free/60 days",
          "visa-free/42 days",
          "visa-free/45 days",
          "visa-free/30 days",
          "visa-free (EASE)/30 days",
          "visa on arrival / eVisa/30 days",
          "visa-free/31 days",
          "visa-free/28 days",
          "visa-free/21 days",
          "visa-free/15 days",
          "visa-free/14 days",
          "visa-free/7 days",
          "eVisa"
        ],
        "voa": [
          "visa-free (EASE)",
          "visa on arrival (EASE)",
          "visa on arrival / eVisa",
          "visa on arrival",
          "eVisa/120 days",
          "eTourist card/90 days",
          "tourist registration/90 days",
          "visa on arrival / eVisa/90 days",
          "visa on arrival/90 days",
          "eVisa/90 days",
          "tourist card/90 days",
          "free visa on arrival/90 days",
          "visa on arrival (by email)/90 days",
          "visa on arrival/60 days",
          "visa on arrival / eVisa/60 days",
          "visa on arrival/45 days",
          "visa on arrival / eVisa/45 days",
          "visa on arrival/42 days",
          "visa on arrival/31 days",
          "free visa on arrival/30 days",
          "tourist card/30 days",
          "visa on arrival / eVisa/30 days",
          "eVisa/30 days",
          "visa on arrival/30 days",
          "visa on arrival/28 days",
          "visa on arrival / eVisa/21 days",
          "visa on arrival / eVisa/15 days",
          "visa on arrival/15 days",
          "eVisa/14 days",
          "visa on arrival / eVisa/14 days",
          "visa on arrival/14 days",
          "visa on arrival / eVisa/10 days",
          "visa on arrival/7 days",
          "eVisa",
          "pre-visa on arrival",
        ],
        "eta": [
          "eTA/180 days",
          "EVW/180 days",
          "pre-enrollment/90 days",
          "eTA/90 days",
          "eVisitors/90 days",
          "eVisitors/60 days",
          "eTA/60 days",
          "eTA/30 days",
          "eTA",
        ]
    }
    const fomu = {
        "SAR": ["China", "Macao", "Hong Kong"],
        "Union State": ["Russian Federation", "Belarus"],
        "COFA": ["United States of America", "Micronesia", "Marshall Islands", "Palau"],
        "CTA": ["United Kingdom", "Ireland"],
        "GCC": ["Saudi Arabia", "United Arab Emirates", "Qatar", "Oman", "Kuwait", "Bahrain"],
        "TTTA": ["Australia", "New Zealand"],
        "Mercosur": ["Argentina", "Brazil", "Paraguay", "Uruguay", "Bolivia", "Chile", "Colombia", "Ecuador", "Peru"],
        "EU": ["Italy", "Austria", "Belgium", "Bulgaria", "Croatia", "Cyprus", "Czech Republic", "Denmark", "Estonia", "Finland", "France", "Germany", "Greece", "Hungary", "Iceland", "Ireland", "Latvia", "Liechtenstein", "Lithuania", "Luxembourg", "Malta", "Netherlands", "Norway", "Poland", "Portugal", "Romania", "Slovakia", "Slovenia", "Spain", "Sweden", "Switzerland"],
        "ECOWAS": ["Cape Verde", "Gambia", "Guinea", "Guinea-Bissau", "Liberia", "Mali", "Senegal", "Sierra Leone", "Benin", "Burkina Faso", "Ghana", "Cote d'Ivoire (Ivory Coast)", "Niger", "Nigeria", "Togo" ]
    }

    //Global States
    const [passport, setPassport] = useState({});
    const [vPassport, setVPassport] = useState({});
    const [passportRanks, setPassportRanks] = useState({});

    const getFomuFromTitle = (title) => {
        let found = [];
        Object.entries(fomu).forEach(([group, countries]) => {
            if(countries.includes(title)){
            found.push(group);
            }
        });
        return found.length > 0? found : null;
    }

    const getRankFullName = (title) => {
        switch(title){
            case "normal":
                return "Countries Reach";
            case "power":
                return "Passport Power";
            case "surface":
                return "Surface Reach";
            case "visitor":
                return "Countries Allowed";
            case "overall":
                return "Overall";
        }
    }

    //Build Passport
    useEffect(()=>{
        if(passportData){
            const tempP = {};
            Object.entries(passportData).forEach(([title, countries])=>{
            const found1 = getFomuFromTitle(title);
            tempP[title] = {};
            Object.values(countries).forEach(country=>{
                let isFomu;
                if(found1){
                const found2 = getFomuFromTitle(country.title);
                if(found2){
                    found2.forEach(f=>{
                    if(found1.includes(f)){
                        isFomu = found1;
                    }
                    });
                }
                }
                tempP[title][country.title] = {...country, visaType: isFomu? 'fom' : country.visaType, visa: isFomu? `freedom of movement (${isFomu.toString().replaceAll(',',', ')})` : country.visa};
            });
            });
            setPassport(tempP);

        }
    },[passportData]);

    const getRank = (title, countries, type, num) => {
        const withSurface = type === 'surface';
        const pond = type === 'power';
        const rank = {title, fom: num, vf:0, voa:0, eta:0, vr: 0};
        Object.values(countries).forEach(country=>{
            const addedValue = withSurface ? (detailed[country.title].surface_area ?? 0) : 1;
            rank[country.visaType] += addedValue;
        });
        if(type === 'visitor'){
            rank.rank = 199 - rank.vr;
        }else{
            const totFom = (rank.fom * (pond? 4 : 1));
            const totVf = (rank.vf * (pond? 3 : 1));
            const totVoa = (rank.voa * (pond? 2 : 1));
            const totEta = (rank.eta);
            const totCountries = (199 - rank.vr) * 5;
            rank.rank = totFom + totVf + totVoa + totEta + (pond ? totCountries : 1);
        }
        return rank;
    }

    const getPassportRank = (data, type) => {
        
        let rank = [];
        Object.entries(data).forEach(([title, countries], i)=>{
            rank[i] = getRank(title, countries, type, 1);
        });
        
        rank.sort((a,b)=>(a.rank > b.rank? -1 : 1))
        
        return rank;
    }

    const getCCFromTitle = (title) => {
        const countries = Object.values(passport)[0];
        return countries[title] ? countries[title].cc : "af";
    }

    useEffect(()=>{
        if(Object.values(passport).length > 0){
            //Build VPassport
            const tempV = {};
            Object.entries(passport).forEach(([title, countries])=>{
                Object.values(countries).forEach(country=>{
                    if(!tempV[country.title]){
                    tempV[country.title] = {};
                    }
                    tempV[country.title][title] = {...country, title, cc:getCCFromTitle(title)};
                });
            });
            setVPassport(tempV);

            //Build Ranks
            const power = getPassportRank(passport, 'power');
            const normal = getPassportRank(passport, 'normal');
            const surface = getPassportRank(passport, 'surface');
            const visitor = getPassportRank(tempV, 'visitor');
            const overall = {};
            power.forEach((c, i)=>{
                if(!overall[c.title]){
                    overall[c.title] = {title: c.title, rank: 0};
                }
                overall[c.title].rank += (power.length - i);
            });
            normal.forEach((c, i)=>{
                overall[c.title].rank += (normal.length - i);
            });
            surface.forEach((c, i)=>{
                overall[c.title].rank += (surface.length - i);
            });
            visitor.forEach((c, i)=>{
                overall[c.title].rank += (visitor.length - i);
            });
            setPassportRanks({
                power,
                normal,
                surface,
                visitor,
                overall: Object.values(overall),
            });
        }
    },[passport]);

    const [rankValues, setRankValues] = useState({});
    useEffect(()=>{
        const values = {};
        Object.entries(passportRanks).forEach( ([key, rank]) => {
        values[key] = [];
        rank.forEach(row => {
            if(!values[key].includes(row.rank)){
            values[key].push(row.rank);
            }
        })
        });
        setRankValues(values);
    },[passportRanks]);

    return (
        <Context.Provider value={{
            visaPox, 
            passport, 
            detailed, 
            vPassport, 
            passportRanks, 
            rankValues, 
            getCCFromTitle,
            getRankFullName,
            getRank,
            }}>
            {children}
        </Context.Provider>
    )
}