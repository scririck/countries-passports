import '../styles/App.scss';
import '../styles/WorldMap.scss';
import 'flag-icon-css/sass/flag-icons.scss';
import { useRouter } from "next/router";
import { ContextProvider } from '../lib/Context';

function MyApp({ Component, pageProps }) {

  const router = useRouter();

  const MenuVoice = ({route, title}) => (
    <div className={`mh-voice ${router.route === `/${route}` ? 'active' : ''}`} onClick={()=>{
      router.push(`/${route}`) 
    }}>{title}
  </div>
  )

  return (
    <ContextProvider>
      <div className="mega-header">
        <MenuVoice route="" title="Home" />
        <MenuVoice route="ranks" title="Ranks" />
        <MenuVoice route="combo" title="Partners" />
      </div>
      <div className="mh-separator"></div>
      <Component {...pageProps} />
    </ContextProvider>
  )
}

export default MyApp
