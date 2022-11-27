import { useState, useEffect, useContext } from "react";
import { Context } from '../lib/Context';

export default function CountryCounter({countryData, fixedCountryCount, withSurface}){

  const {detailed} = useContext(Context);

  const [countryCount, setCountryCount] = useState();
  useEffect(()=>{
    if(countryData && !fixedCountryCount){
      const count = {fom: 0, vf:0, voa:0, eta:0, vr: 0};
      Object.values(countryData).forEach(country=>{
        const addedValue = withSurface ? (detailed[country.title].surface_area ?? 0) : 1;
        count[country.visaType] += addedValue;
      })
      setCountryCount(count);
    }
  },[countryData]);

  useEffect(()=>{
    if(fixedCountryCount){
      setCountryCount(fixedCountryCount);
    }
  },[fixedCountryCount]);

  return (
      <div className="country-counter">
        {countryCount && Object.entries(countryCount).map(([type, count])=>{
          if(["fom", "vf", "voa", "eta", "vr"].includes(type)){
            const {fom, vf, voa, eta, vr} = countryCount;
            const total = fom + vf + voa + eta + vr;
            return(
              <div 
                key={`counter_${type}`} 
                className={`counter ${type}`}
                style={{width: `${count*100/total}%`}}
              >{withSurface? `${Math.round(count/1000000)}M Km2` : count}</div>
            )
          }
        })}
      </div>
    )
  }