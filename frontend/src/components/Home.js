import { useState,useEffect, useDebugValue } from "react"
import { ethers } from "ethers"
import close from "./close.svg"

const Home = ({ home, provider, account, escrow, togglePop })=>{
    const [hasInspected, setHasInspected] = useState(false)
    const [inspector, setInspector] = useState(null)
    const [seller, setSeller] = useState(null)
    const [tenant,setTenant] = useState("0x")
    const [isOnRent,setOnRent]=useState(false)
    const[duration,setDuration]=useState(0)
    const[rent,setRent]=useState("")
    console.log(account)
    const fetchDetails = async () => {
        // -- Seller

        const seller = await escrow.getSeller(home.id)
        setSeller(seller)
        console.log(seller)
        // -- Inspector
        const inspector = await escrow.inspector()
        setInspector(inspector)
        console.log(inspector)

        const hasInspected = await escrow.getInspectionStatus(home.id)
        setHasInspected(hasInspected)

        const tenant = await escrow.getTenant(home.id)
        if(tenant!=="0x0000000000000000000000000000000000000000")
        {
            setTenant(tenant)
            setOnRent(true)
        }
        console.log(home.id)
    }
    fetchDetails()

    const buyHandler = async () => {
        const signer = await provider.getSigner()
        let transaction = await escrow.connect(signer).processTransaction(home.id,false,0,{ value: ethers.parseEther(home.price_for_buy)})
        await transaction.wait()
    }
    const rentHandler = async()=>{
        const signer = await provider.getSigner()
        let transaction = await escrow.connect(signer).processTransaction(home.id,true,1,{ value: ethers.parseEther(home.price_for_rent)})
        await transaction.wait()
        console.log("transffering NFT")
    }

    const inspectHandler = async () => {
        
        // Inspector updates status
        if(!(await escrow.getInspectionStatus(home.id)))
        {
            try{
                const inspector = await escrow.inspector();
                console.log(inspector)  // Get inspector address from contract
                const signer = await provider.getSigner();
                const signerAddress = await signer.getAddress();
                console.log(inspector,signerAddress) // Get the current signer address
                
                if (signerAddress.toLowerCase() !== inspector.toLowerCase()) {
                    console.log("Error: Only the inspector can approve the inspection");
                } else {
                    // Proceed with the transaction
                    try {
                        const transaction = await escrow.connect(signer).approveInspection(home.id);
                        await transaction.wait();
                        console.log("Inspection approved!");
                    } catch (error) {
                        console.log("Revert reason:", error?.error?.message || error.message);
                    }
                }
            }catch(error){
    
                if (error.error && error.error.message) {
                    console.log("Revert reason:", error.error.message); // Log the revert reason
                } else {
                    console.log("Error:", error); // Log the whole error for debugging
                }
    
            }
        }
        else{
            console.log("already approved")
            alert("already approved")
        }


        setHasInspected(true)
    }
    console.log(home)
    useEffect(() => {
        console.log(home)
        fetchDetails()
    }, [])
    return(
        <>
        <div className="home">
            <div className='home__details'>
                <div className="home__image">
                    <img src={home.image} alt="Home" />
                </div>
                <div className="home__overview">
                    <h1>{home.name}</h1>
                    <p>Seller: {seller}</p>

                    <h3>Buying Price: {home.price_for_buy} ETH</h3>
                    <h3>Rent: {home.price_for_rent} ETH</h3>

                        <div>
                            {(account === inspector) ? (
                                <button className='home__buy' onClick={inspectHandler} disabled={hasInspected}>
                                    Approve Inspection
                                </button>
                            ) : (
                                <>
                                    {isOnRent ? (
                                        <>
                                            <h3>This property is on rent</h3>
                                            <p>Tenant Address: {tenant}</p>
                                        </>
                                    ) : (
                                        <>
                                            <button className='home__buy' onClick={buyHandler} >
                                                Buy
                                            </button>
                                            <button className='home__buy' onClick={rentHandler} >
                                                Rent
                                            </button>
                                            <br/>
                                            <input type="number" placeholder="in days" onChange={(e)=>setDuration(e.target.value)}/>
                                            <input type="number" placeholder="rent amount" onChange={(e)=>setRent(e.target.value)}/>
                                        </>
                                    )}
                                </>
                            )}
                            <br/>
                            <button className='home__contact'>
                                Contact agent
                            </button>
                        </div>
                    

                    <hr />

                    <h2>Overview</h2>

                    <p>
                        {home.description}
                    </p>

                    <hr />
{/* 
                    <ul>
                        {home.map((attribute, index) => (
                            <li key={index}><strong>{attribute.trait_type}</strong> : {attribute.value}</li>
                        ))}
                    </ul> */}
                </div>


                <button onClick={togglePop} className="home__close">
                    <img src={close} alt="Close" />
                </button>
            </div>
        </div >
        
        </>
    )
}
export default Home