import { useState, useEffect } from 'react'
import { ethers } from "ethers"
import { Row, Col, Form, Button, Card, ListGroup, Container } from 'react-bootstrap'
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


const Market = ({ contract, resumeContract, marketContract, nftContract }) => {
    const [hasProfile, setHasProfile] = useState(false)
    const [address, setAddress] = useState('')
    const [loading, setLoading] = useState(true)
    const [imageLink, setImage] = useState('') 
    const [items, setItems] = useState([]);
    
    const loadMarketplaceItems = async() => {
        const itemCount = await marketContract.itemCount();
        let items = [];
        for (let i = 1; i <= itemCount; i++) {
            const item = await marketContract.items(i);
            if (!item.sold) {
                const uri = await nftContract.tokenURI(item.tokenId);
                const response = await fetch(uri);
                const metadata = await response.json();
                const totalPrice = await marketContract.getTotalPrice(item.itemId);
                items.push({
                    totalPrice,
                    itemId: item.itemId,
                    seller: item.seller,
                    name: metadata.name,
                    description: metadata.description,
                    image: metadata.image
                })
            }
        }
        setItems(items);
        setLoading(false);
    }
    
    const buyMarketItem = async (item) => {
        await (await marketContract.purchaseItem(item.itemId, { value: item.totalPrice})).wait();
        loadMarketplaceItems();
    }

    useEffect(() => {
        loadMarketplaceItems()
    }, [])

    const mintResume = async () => {
        await (await resumeContract.mint("https://ipfs.io/ipfs/QmThCT36VDMHWnzu34UbpNynfbB6ZfTrUfNmrYaco9BzoZ")).wait()
    }
    const mintNFT = async (image) => {
        await (await resumeContract.mint(image)).wait()
    }

    const approve = async () => {
        await (await resumeContract.setApprovalForAll("0xAE3C48645436fa35D951e5314689cEcdC10ef9F3",true))
    }


    // const tip = async (post) => {
    //     // tip post owner
    //     await (await contract.tipPostOwner(post.id, { value: ethers.utils.parseEther("0.1") })).wait()
    //     loadPosts()
    // }
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

            <div className='flex justify-center'>
                {items.length > 0 ?
                    <div className='px-5 container'>
                        <Row xs={1} md={2} lg={4} className="g-4 py-5">
                            {items.map((item, idx) => (
                                <Col key={idx} className="overflow-hidden">
                                    <Card>
                                    <Card.Img variant="top" src={item.image} />
                                    <Card.Body color="secondary">
                                        <Card.Title>{item.name}</Card.Title>
                                        <Card.Text>
                                        {item.description}
                                        </Card.Text>
                                    </Card.Body>
                                    <Card.Footer>
                                        <div className='d-grid'>
                                        <Button onClick={() => buyMarketItem(item)} variant="primary" size="lg">
                                            Buy for {ethers.utils.formatEther(item.totalPrice)} ETH
                                        </Button>
                                        </div>
                                    </Card.Footer>
                                    </Card>
                                </Col>
                            ))}                          
                        </Row>
                    </div>
                : (
                    <main>
                        <h2>No listed assets</h2>
                    </main>

                )}


            </div>



            <div >
                <input 
                    type = 'text'

                />
                <Button onClick={mintResume}>
                    Mint Resume    
                </Button> 
                <Button onClick={loadMarketplaceItems}>
                    Load
                </Button> 
            </div>
            <div >
                <Button onClick={approve}>
                    approve    
                </Button> 
            </div>



            <p>&nbsp;</p>
            <hr />
            <p className="my-auto">&nbsp;</p>


        </div >
    );
}

export default Market