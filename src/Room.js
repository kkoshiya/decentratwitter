import { useState, useEffect } from 'react'
import { ethers } from "ethers"
import { Row, Form, Button, Card, ListGroup, Container } from 'react-bootstrap'
import { create as ipfsHttpClient } from 'ipfs-http-client'
import { Buffer } from 'buffer'

const ipfsClient = require('ipfs-http-client');

const projectId = '2ErURtKagCMdhuyXpeKH3HhuRhb';   // <---------- your Infura Project ID

const projectSecret = '0270ba21357357b3a2ea8a02302cd117';  // <---------- your Infura Secret
// (for security concerns, consider saving these values in .env files)

const auth = 'Basic ' + Buffer.from(projectId + ':' + projectSecret).toString('base64');

const client = ipfsClient.create({
    host: 'infura-ipfs.io',
    port: 5001,
    protocol: 'https',
    headers: {
        authorization: auth,
    },
});


const Room = ({ contract, resumeContract, marketContract, nftContract }) => {

    const [hasProfile, setHasProfile] = useState(false)
    const [address, setAddress] = useState('')
    const [loading, setLoading] = useState(true)
    
    const [image, setImage] = useState(''); 
    const [price, setPrice] = useState(null);
    const [name, setName] = useState('');
    const [description, setDescription] = useState('')

    const uploadToIPFS = async (event) => {
        event.preventDefault()
        const file = event.target.files[0]
        if (typeof file !== 'undefined') {
            try {
                const result = await client.add(file)
                console.log(result)
                setImage(`https://infura-ipfs.io/ipfs/${result.path}`)
            } catch (error){
                console.log("ipfs image upload error: ", error)
            }
        }
    }

    const createNFT = async () => {
        if (!image || !price || !name || !description) return
        try { 
            const result = await client.add(JSON.stringify({image, price, name, description}))
            mintThenList(result)
        } catch(error) {
            console.log("ipfs uri upload error: ", error)
        }
    }

    const mintThenList = async (result) => {
        const uri = `https://infura-ipfs.io/ipfs/${result.path}`
        // mint nft 
        await(await nftContract.mint(uri)).wait()
        // get tokenId of new nft 
        const id = await nftContract.tokenCount()


        // approve marketplace to spend nft
        await(await nftContract.setApprovalForAll(marketContract.address, true)).wait()
        // add nft to marketplace
        const listingPrice = ethers.utils.parseEther(price.toString())
        await(await marketContract.makeItem(nftContract.address, id, listingPrice)).wait()
    }





    useEffect(() => {
        setLoading(false)
    })

    const mintResume = async () => {
        await (await resumeContract.mint("https://ipfs.io/ipfs/QmThCT36VDMHWnzu34UbpNynfbB6ZfTrUfNmrYaco9BzoZ")).wait()
    }
    const mintNFT = async (image) => {
        await (await resumeContract.mint(image)).wait()
    }

    const approve = async () => {
        await (await resumeContract.setApprovalForAll("0xAE3C48645436fa35D951e5314689cEcdC10ef9F3",true))
    }

    if (loading) return (
        <div className='text-center'>
            <main style={{ padding: "1rem 0" }}>
                <h2>Loading...</h2>
                <h2>Wait a few seconds and refresh if you want</h2>
            </main>
        </div>
    )
    return (
        <div className="container-fluid mt-5">
            <div className="row">
                <main role="main" className="col-lg-12 mx-auto" style={{ maxWidth: '1000px' }}>
                <div className="content mx-auto">
                    <Row className="g-4">
                    <Form.Control
                        type="file"
                        required
                        name="file"
                        onChange={uploadToIPFS}
                    />
                    <Form.Control onChange={(e) => setName(e.target.value)} size="lg" required type="text" placeholder="Name" />
                    <Form.Control onChange={(e) => setDescription(e.target.value)} size="lg" required as="textarea" placeholder="Description" />
                    <Form.Control onChange={(e) => setPrice(e.target.value)} size="lg" required type="number" placeholder="Price in ETH" />
                    <div className="d-grid px-0">
                        <Button onClick={createNFT} variant="primary" size="lg">
                            Create & List NFT!
                        </Button>
                    </div>
                    </Row>
                </div>
                </main>
            </div>

            <div>
                <br />
                
            </div>



            <div >
                <input 
                    type = 'text'

                />
                <Button onClick={mintResume}>
                    Mint Resume    
                </Button> 
            </div>
            <div >
                {/* <Button onClick={approve}>
                    approve    
                </Button>  */}
            </div>



            <p>&nbsp;</p>
            <hr />
            <p className="my-auto">&nbsp;</p>


        </div >
    );
}

export default Room