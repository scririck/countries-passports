import '../styles/App.scss';
import '../styles/WorldMap.scss';
import 'flag-icon-css/sass/flag-icons.scss';
import { useRouter } from "next/router";
import { ContextProvider } from '../lib/Context';

function MyApp({ Component, pageProps }) {

  const router = useRouter();

  return (
    <ContextProvider>
      <div className="mega-header">
        <div className={`mh-voice ${router.route.includes('ranks')? '' : 'active'}`} onClick={()=>{
          router.push('/') 
        }}>Home</div>
        <div className={`mh-voice ${router.route.includes('ranks')? 'active' : ''}`} onClick={()=>{
          router.push('/ranks')
        }}>Ranks</div>
      </div>
      <div className="mh-separator"></div>
      <Component {...pageProps} />
    </ContextProvider>
  )
}

export default MyApp
