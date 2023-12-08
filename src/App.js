import { useState , useEffect,React } from 'react';
import { ethers } from 'ethers';
import BingoBoard from './BingoBoard';
import NumberCalled from './NumberCalled';
import './App.css'; // Import the CSS file
import Button from 'react-bootstrap/Button';

const xrplcontractAddress = '0xd35c2913f1af618f8efE8081E3222afA0CeE0661';
const contractAddress = '0xE8F139D94b23a8571a987FE075104856983Aad9D'; // Replace with your actual contract address
const contractABI = [
  {
    "inputs": [],
    "stateMutability": "nonpayable",
    "type": "constructor"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "gameId",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "address",
        "name": "winner",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "cardIndex",
        "type": "uint256"
      }
    ],
    "name": "BingoDetected",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "gameId",
        "type": "uint256"
      }
    ],
    "name": "GameStarted",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "gameId",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "number",
        "type": "uint256"
      }
    ],
    "name": "NumberCalled",
    "type": "event"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "gameId",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "address",
        "name": "winner",
        "type": "address"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "winnings",
        "type": "uint256"
      }
    ],
    "name": "PrizePayout",
    "type": "event"
  },
  {
    "inputs": [],
    "name": "BOARD_PRICE",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "BOARD_SIZE",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "MAX_NUMBER",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "name": "bingoCards",
    "outputs": [
      {
        "internalType": "bool",
        "name": "isBingo",
        "type": "bool"
      },
      {
        "internalType": "address",
        "name": "playeraddress",
        "type": "address"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "callRandomNumber",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "name": "calledNumbers",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "checkForBingo",
    "outputs": [
      {
        "internalType": "bool[]",
        "name": "",
        "type": "bool[]"
      }
    ],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "currentGameId",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "cardIndex",
        "type": "uint256"
      }
    ],
    "name": "getBingoCard",
    "outputs": [
      {
        "internalType": "uint256[5][5]",
        "name": "",
        "type": "uint256[5][5]"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getBingoCardStatus",
    "outputs": [
      {
        "internalType": "uint256[5][5][]",
        "name": "",
        "type": "uint256[5][5][]"
      },
      {
        "internalType": "bool[]",
        "name": "",
        "type": "bool[]"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "getCalledNumbers",
    "outputs": [
      {
        "internalType": "uint256[]",
        "name": "",
        "type": "uint256[]"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "max",
        "type": "uint256"
      }
    ],
    "name": "getRandomNumberUsingPrevRandao",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "initializeBingoCard",
    "outputs": [],
    "stateMutability": "payable",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "owner",
    "outputs": [
      {
        "internalType": "address",
        "name": "",
        "type": "address"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "name": "records",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "gameId",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "blockTime",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "prizePool",
        "type": "uint256"
      },
      {
        "internalType": "address",
        "name": "winningAddress",
        "type": "address"
      },
      {
        "components": [
          {
            "internalType": "uint256[5][5]",
            "name": "card",
            "type": "uint256[5][5]"
          },
          {
            "internalType": "bool",
            "name": "isBingo",
            "type": "bool"
          },
          {
            "internalType": "address",
            "name": "playeraddress",
            "type": "address"
          }
        ],
        "internalType": "struct RandomNumberGenerator.BingoCard",
        "name": "bingoCard",
        "type": "tuple"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "startGame",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  }
]; // Replace with your actual contract ABI



function App() {
  const [provider, setProvider] = useState(null);
  const [contract, setContract] = useState(null);
  const [Card,setCard] = useState();
  const [numberData, setnumberData] = useState('1');
  const demonumber = 0;
  let result;
  const eventName = 'NumberCalled';
 
  
  const connectToBlockchain = async () => {
    const provider = new ethers.BrowserProvider(window.ethereum);
    const signer = await provider.getSigner();
    const contract = new ethers.Contract(xrplcontractAddress, contractABI, signer);
    
    setProvider(provider);
    setContract(contract);

    contract.on(eventName, (...eventData) => { try {
      console.log('Event Data:', eventData);
      setnumberData(eventData[1].toString());
      
      

    } catch (error) {
      console.error('Error updating state:', error);
    }
    
  });
  contract.on('GameStarted', (...eventData) => { try {
    console.log('Event Data:', eventData);
    alert('GameSTarted!')
    
    

  } catch (error) {
    console.error('Error updating state:', error);
  }


  });
  contract.on('BingoDetected', (...eventData) => { try {
    console.log('Event Data:', eventData);
    alert('Bingo!')
    
    

  } catch (error) {
    console.error('Error updating state:', error);
  }


  });
  contract.on('PrizePayout', (...eventData) => { try {
    console.log('Event Data:', eventData);
    alert('Prize Paid')
    
    

  } catch (error) {
    console.error('Error updating state:', error);
  }


  });
  };

  useEffect(() => {
    connectToBlockchain();
  }, []);

  async function registerPlayer() {
    try {
      const functionName = 'initializeBingoCard';
      const options = { gasLimit: 10000000 ,value:ethers.parseEther("2")};
      const card = await contract.initializeBingoCard(options);
      await card.wait();
      setCard(card);
      
      alert('Player registered successfully!');
    } catch (error) {
      console.error('Error registering player:', error);
    }
  }

  async function viewBingoCard() {
    try {
      const card = await contract.getBingoCard(2);
      alert(`Your Bingo Card: ${card.join(', ')}`);
    } catch (error) {
      console.error('Error viewing bingo card:', error);
    }
  }
  async function StartbingoGame() {
    try {
      await contract.startGame();
      
    } catch (error) {
      console.error('You can not start game', error);
    }
  }
  async function callNumber() {
    try {
      const number = await contract.callRandomNumber();
      
    } catch (error) {
      console.error('Error viewing bingo card:', error);
    }
  }

  return (
    <div className="main-container">
      <h1 style={{color:'orange'}}> Bingo Quest</h1>
      
      <h2 style={{color:'orange'}}> Number Called: {numberData} </h2>

      <h3 className='font-type'style={{color:'orange'}}>Total Prize: </h3>
      <BingoBoard></BingoBoard>
      <Button onClick={callNumber}style={{margin: '5px',padding:'20px'}}variant="outline-warning">Call Number</Button>
      <Button onClick={StartbingoGame} style={{margin: '5px',padding:'20px'}}variant="outline-warning">StartGame</Button>
      <Button onClick={connectToBlockchain} style={{margin: '5px',padding:'20px'}}variant="outline-warning">Connect to Blockchain</Button>
      <Button onClick={registerPlayer}style={{margin: '5px',padding:'20px'}}variant="outline-warning">Purchase Card</Button>
      <Button onClick={viewBingoCard}style={{margin: '5px',padding:'20px'}}variant="outline-warning">View Bingo Card</Button>
    </div>
  );
}

export default App;
