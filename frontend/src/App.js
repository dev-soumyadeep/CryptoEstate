import logo from './logo.svg';
import { ethers,BrowserProvider } from 'ethers';
import './App.css';
import { useEffect, useState } from 'react';
import {BrowserRouter,Routes,Route} from 'react-router-dom'
import Navigation from './components/Navigation';
import Search from './components/Search';
import Home from './components/Home';
import ListProperty from './components/Listproperty';
import config  from './config.json';
import Escrow from "./abis/Escrow.json"
import RealEstate from "./abis/PropertyToken.json"

export default function App() {
  const [account, setAccount] = useState(null)
  const [provider, setProvider] = useState(null)
  const [toggle, setToggle] = useState(false);
  const [escrow, setEscrow] = useState(null)
  const [homes, setHomes] = useState([])
  const [home, setHome] = useState({})
  window.ethereum.on('accountsChanged', async () => {
    const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
    const account = ethers.getAddress(accounts[0])
    setAccount(account);
  })

  const loadBlockchainData = async () => {
    const provider = new ethers.BrowserProvider(window.ethereum)
    setProvider(provider)
    // console.log(provider)
    const network = await provider.getNetwork()
    console.log(network)
    const realEstate = new ethers.Contract(config[network.chainId].realEstate.address, RealEstate, provider)
    console.log(realEstate)
    const totalSupply = await realEstate.totalSupply()
    // console.log(totalSupply)
    const homes = []

    for (var i = 1; i <= totalSupply; i++) {
      try{
        const uri = await realEstate.tokenURI(i)
        const response = await fetch(uri)
        const metadata = await response.json()
        metadata.id=i
        homes.push(metadata)
        // home.attributes[0].value
        // console.log(metadata[0].attributes)
      }catch(err){
        console.log(err)
      }

    }

    setHomes(homes)
    console.log(homes)

    const escrow = new ethers.Contract(config[network.chainId].escrow.address, Escrow, provider)
    setEscrow(escrow)

    window.ethereum.on('accountsChanged', async () => {
      const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
      const account = ethers.getAddress(accounts[0])
      setAccount(account);
    })
  }
  useEffect(() => {
    loadBlockchainData()
  }, [])

  const togglePop = (home) => {
    setHome(home)
    toggle ? setToggle(false) : setToggle(true);
  }

  return (
    <div className="App">
      {/* <BrowserRouter>
      <Routes>
        <Route path='/lp' element={<ListProperty provider={provider}/>}/>
      </Routes>
      </BrowserRouter> */}
       <Navigation account={account} setAccount={setAccount} />
       <Search />
       
      <div className='cards__section'>

<h3>Homes For You</h3>

<hr />

  <div className='cards'>
    {homes.map((home, index) => (
      <div className='card' key={index} onClick={() => togglePop(home)}>
        <div className='card__image'>
          <img src={home.image} alt="Home" />
        </div>
        <div className='card__info'>
          <h4 className='card__name'>{home.name}</h4>
          <h4 className='card__price'>Buying:  {home.price_for_buy} ETH</h4>
          <h4 className='card__price'>Rent:  {home.price_for_rent} ETH</h4>
          <p>{home.description}</p>
        </div>
      </div>
    ))}
  </div>
  {toggle && (
          <Home home={home} provider={provider} account={account} escrow={escrow} togglePop={togglePop} />
  )}

</div>
    </div>
  );
}


