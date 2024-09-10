import { useState } from "react";
import axios from "axios"
import Escrow from "../abis/Escrow.json"
import config  from '../config.json';
import {ethers} from 'ethers'
import property from "../property.json"
// require('dotenv').config();

const ListProperty=({provider})=>{

    const[file,setFile]=useState(0);
    const[uri,setUri]=useState("")
    const[index,setIndex]=useState(1)
    const handleSubmit = async(e)=>{
        e.preventDefault()
        console.log(file)
        try{
            const fileData = new FormData()
            fileData.append("file",file)
            const responseData = await axios.post("https://api.pinata.cloud/pinning/pinFileToIPFS",fileData,{
                headers:{

                    Authorization:`Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySW5mb3JtYXRpb24iOnsiaWQiOiIwZjZjZjRiYi04OGEwLTQyZGUtODBhZC0wMGMzNmQyNTY1NWEiLCJlbWFpbCI6InNvdW15YWRlZXAueGxwQGdtYWlsLmNvbSIsImVtYWlsX3ZlcmlmaWVkIjp0cnVlLCJwaW5fcG9saWN5Ijp7InJlZ2lvbnMiOlt7ImRlc2lyZWRSZXBsaWNhdGlvbkNvdW50IjoxLCJpZCI6IkZSQTEifSx7ImRlc2lyZWRSZXBsaWNhdGlvbkNvdW50IjoxLCJpZCI6Ik5ZQzEifV0sInZlcnNpb24iOjF9LCJtZmFfZW5hYmxlZCI6ZmFsc2UsInN0YXR1cyI6IkFDVElWRSJ9LCJhdXRoZW50aWNhdGlvblR5cGUiOiJzY29wZWRLZXkiLCJzY29wZWRLZXlLZXkiOiJhZDIyNzY2ZGJhZmVjMjQ3N2Y3NyIsInNjb3BlZEtleVNlY3JldCI6ImIzZDU3ZDI2MmZjM2FmMGYyNzY5YjdhMzRjMjE5ZmQyYmJlZTZiNzI3Y2FhZTZlOTFiNjgxNjk0MmFjMjZjZjIiLCJleHAiOjE3NTY1NDY3MTh9.-wXE2iN0GTJJAwl-sgX_hbZa3dKwPqjMLxc9jSUcmHI`
                }
        })

            const imageUrl = "https://gateway.pinata.cloud/ipfs/"+responseData.data.IpfsHash
            console.log(index)
            console.log("image"+imageUrl)
            const metadata = {
                name: property[index].name,
                description: property[index].description,
                image: imageUrl,  
                price_for_buy: property[index].priceForBuy,
                price_for_rent:property[index].priceForRent
            };

            const metadataBlob = new Blob([JSON.stringify(metadata)], { type: "application/json" });


            const metadataFileData = new FormData();
            metadataFileData.append("file", metadataBlob, "metadata.json");


            const metadataResponse = await axios.post("https://api.pinata.cloud/pinning/pinFileToIPFS", metadataFileData, {
                headers:{

                    Authorization:`Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySW5mb3JtYXRpb24iOnsiaWQiOiIwZjZjZjRiYi04OGEwLTQyZGUtODBhZC0wMGMzNmQyNTY1NWEiLCJlbWFpbCI6InNvdW15YWRlZXAueGxwQGdtYWlsLmNvbSIsImVtYWlsX3ZlcmlmaWVkIjp0cnVlLCJwaW5fcG9saWN5Ijp7InJlZ2lvbnMiOlt7ImRlc2lyZWRSZXBsaWNhdGlvbkNvdW50IjoxLCJpZCI6IkZSQTEifSx7ImRlc2lyZWRSZXBsaWNhdGlvbkNvdW50IjoxLCJpZCI6Ik5ZQzEifV0sInZlcnNpb24iOjF9LCJtZmFfZW5hYmxlZCI6ZmFsc2UsInN0YXR1cyI6IkFDVElWRSJ9LCJhdXRoZW50aWNhdGlvblR5cGUiOiJzY29wZWRLZXkiLCJzY29wZWRLZXlLZXkiOiJhZDIyNzY2ZGJhZmVjMjQ3N2Y3NyIsInNjb3BlZEtleVNlY3JldCI6ImIzZDU3ZDI2MmZjM2FmMGYyNzY5YjdhMzRjMjE5ZmQyYmJlZTZiNzI3Y2FhZTZlOTFiNjgxNjk0MmFjMjZjZjIiLCJleHAiOjE3NTY1NDY3MTh9.-wXE2iN0GTJJAwl-sgX_hbZa3dKwPqjMLxc9jSUcmHI`
                },
            });


            const metadataHash = metadataResponse.data.IpfsHash;
            const metadataUrl = `https://gateway.pinata.cloud/ipfs/${metadataHash}`;

            console.log("Metadata uploaded to IPFS: ", metadataUrl);
            setUri(metadataUrl)
            console.log(uri)

        }catch(err){
            console.log(err)
        }
    }
    const handleListProperty = async(e) =>{
        e.preventDefault()
        console.log(" cli")
        console.log(index)
        const network = await provider.getNetwork()
        const signer = await provider.getSigner();
        const escrow = new ethers.Contract(config[network.chainId].escrow.address, Escrow, signer)
        console.log(index)
        try{
            console.log("start tx")
            const tx = await escrow.connect(signer).listProperty(ethers.parseEther(property[index].priceForRent),ethers.parseEther(property[index].priceForBuy),ethers.parseEther(property[index].escrowAmt),uri)
            const res= tx.wait()
            alert("Transaction Status:", res.status === 1 ? "Success" : "Failed")
        }catch(err)
        {
            console.log(err)
        }

    }

    return(

        <div>
        <h2>List property</h2>
        <form>
            <input type="file" onChange={(e)=>setFile(e.target.files[0])}/>
            <button type="submit" onClick={handleSubmit}>Upload file</button>
            <input type="number" onChange={(e)=>setIndex(e.target.value)}/>
            <button type="submit" onClick={handleListProperty}>List property</button>
        </form>
        </div>
    );

}

export default ListProperty