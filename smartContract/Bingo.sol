pragma solidity ^0.8.0;

contract Bingo {
    address public owner;
    uint256 public constant BOARD_SIZE = 5;
    uint256 public constant MAX_NUMBER = 75;
    uint256 public prizePool;
    uint256 public constant BOARD_PRICE = .1 ether; // Adjust the price as needed
    event GameStarted(uint256 gameId);
    event NumberCalled(uint256 gameId, uint256 number);
    event BingoDetected(uint256 gameId, address winner, uint256 cardIndex);
    event PrizePayout(uint256 gameId, address winner, uint256 winnings);


    struct BingoCard {
        uint256[BOARD_SIZE][BOARD_SIZE] card;
        bool isBingo;
        address playeraddress;
    }

    BingoCard[] public bingoCards;
    uint256[] public calledNumbers;
    uint256 public currentGameId;


    struct GameRecord {
        uint256 gameId;
        uint256 blockTime;
        uint256 prizePool;
        address winningAddress;
        BingoCard bingoCard;
    }

    GameRecord[] public records;

    modifier onlyOwner() {
        require(msg.sender == owner, "Not the contract owner");
        _;
    }

    constructor() {
        owner = msg.sender;
        currentGameId = 0;
    }

    function getRandomNumberUsingPrevRandao(uint256 max) public view returns (uint256) {
        return uint256(keccak256(abi.encodePacked(block.prevrandao, block.timestamp))) % max;
    }

    function getRandomNumber(uint256 min, uint256 max) internal view returns (uint256) {
        uint256 blockHashRand = uint256(blockhash(block.number - 1));
        uint256 timestampRand = uint256(keccak256(abi.encodePacked(block.prevrandao)));
        uint256 numbertwo = getRandomNumberUsingPrevRandao(75);

        return numbertwo % 75;
    }

  function startGame() external onlyOwner{
        uint256 newGameId = records.length;
        records.push(GameRecord({
            gameId: newGameId,
            blockTime: block.timestamp,
            prizePool: 0,
            winningAddress: address(0),
            bingoCard: BingoCard({
            card: initializeEmptyCard(),
            isBingo: false,
            playeraddress: address(0)
        })        }));
        currentGameId = newGameId;

        emit GameStarted(currentGameId);

    }
    function initializeEmptyCard() internal pure returns (uint256[BOARD_SIZE][BOARD_SIZE] memory) {
    uint256[BOARD_SIZE][BOARD_SIZE] memory emptyCard;
    for (uint256 i = 0; i < BOARD_SIZE; i++) {
        for (uint256 j = 0; j < BOARD_SIZE; j++) {
            emptyCard[i][j] = 0; // Initialize with zeros or any other default value
        }
    }
    return emptyCard;
}

function initializeBingoCard() external payable {
    require(msg.value >= BOARD_PRICE, "Insufficient payment for a bingo card");
    BingoCard memory newCard = BingoCard({
        card: generateRandomCard(),
        isBingo: false,
        playeraddress: msg.sender
    });
    bingoCards.push(newCard);
    
    // Optionally, you can perform additional actions such as updating the prize pool
}


function generateRandomCard() internal view returns (uint256[BOARD_SIZE][BOARD_SIZE] memory) {
    uint256[BOARD_SIZE][BOARD_SIZE] memory randomCard;
    for (uint256 col = 0; col < BOARD_SIZE; col++) {
        for (uint256 row = 0; row < BOARD_SIZE; row++) {
            randomCard[row][col] = getRandomNumber(1, MAX_NUMBER);
        }
    }
    return randomCard;
}
    function getBingoCard(uint256 cardIndex) public view returns (uint256[BOARD_SIZE][BOARD_SIZE] memory) {
        require(cardIndex < bingoCards.length, "Invalid card index");
        return bingoCards[cardIndex].card;
    }

    function getBingoCardStatus() external view returns (uint256[BOARD_SIZE][BOARD_SIZE][] memory, bool[] memory) {
        uint256[BOARD_SIZE][BOARD_SIZE][] memory cardArray = new uint256[BOARD_SIZE][BOARD_SIZE][](bingoCards.length);
        bool[] memory bingoStatus = new bool[](bingoCards.length);

        for (uint256 i = 0; i < bingoCards.length; i++) {
            cardArray[i] = bingoCards[i].card;
            bingoStatus[i] = bingoCards[i].isBingo;
        }

        return (cardArray, bingoStatus);
    }

    function callRandomNumber() external {
        uint256 calledNumber = getRandomNumber(1, MAX_NUMBER);
        calledNumbers.push(calledNumber);
        checkForBingo();
        emit NumberCalled(currentGameId, calledNumber);

    }

    function checkForBingo() public returns (bool[] memory) {
        bool[] memory bingoStatus = new bool[](bingoCards.length);

        for (uint256 i = 0; i < bingoCards.length; i++) {
            BingoCard storage card = bingoCards[i];
            if (!card.isBingo) {
                for (uint8 col = 0; col < BOARD_SIZE; col++) {
                    if (isBingoColumn(card, col) || isBingoRow(card, col) || checkForDiagonalBingo(card)) {
                        bingoStatus[i] = true;
                        payoutPrizePool(msg.sender, i);
                        emit BingoDetected(currentGameId, msg.sender, i);

                        break; // Exit the loop once a bingo is detected for this card
                    }
                }
            }
        }

        return bingoStatus;
    }

    function isBingoColumn(BingoCard storage card, uint8 col) internal view returns (bool) {
        for (uint8 row = 0; row < BOARD_SIZE; row++) {
            if (card.card[row][col] % 2 != 0) {
                return false;
            }
        }
        return true;
    }

    function isBingoRow(BingoCard storage card, uint8 row) internal view returns (bool) {
        for (uint8 col = 0; col < BOARD_SIZE; col++) {
            if (card.card[row][col] % 2 != 0) {
                return false;
            }
        }
        return true;
    }
    function checkForDiagonalBingo(BingoCard storage card) internal view returns (bool) {
        bool leftToRight = true;
        bool rightToLeft = true;

        for (uint8 i = 0; i < BOARD_SIZE; i++) {
            if (card.card[i][i] % 2 != 0) {
                leftToRight = false;
            }
            if (card.card[i][BOARD_SIZE - 1 - i] % 2 != 0) {
                rightToLeft = false;
            }
        }

        return leftToRight || rightToLeft;
    }
    function getCalledNumbers() external view returns (uint256[] memory) {
        return calledNumbers;
    }
     function payoutPrizePool(address winner, uint256 cardIndex) internal {
        uint256 prizePool = records[currentGameId].prizePool;

        // Distribute the prize, subtracting hosting fee
        uint256 winnings = (prizePool * 90) / 100; // 80% goes to the winner
        uint256 hostingFee = (prizePool * 10) / 100; // 20% is kept for hosting

        // Update the prize pool for the next game
        records[currentGameId].prizePool = 0;

        // Update the winner details in the record
        records[currentGameId].winningAddress = winner;

        // Pay out the winner
        payable(winner).transfer(winnings);

        // Pay the hosting fee to the contract owner
        payable(owner).transfer(hostingFee);

        emit PrizePayout(currentGameId, winner, winnings);

        // Mark the card as a winner
        bingoCards[cardIndex].isBingo = true;
    }
}
