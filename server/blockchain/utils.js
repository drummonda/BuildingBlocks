const CryptoJS = require("crypto-js");


/*
  BLOCKCHAIN CONSTANTS
*/

const lookupTable = {
  '0': '0000', '1': '0001', '2': '0010', '3': '0011', '4': '0100',
  '5': '0101', '6': '0110', '7': '0111', '8': '1000', '9': '1001',
  'a': '1010', 'b': '1011', 'c': '1100', 'd': '1101',
  'e': '1110', 'f': '1111'
};

const BLOCK_GENERATION_INTERVAL = 10;
const DIFFICULTY_ADJUSTMENT_INTERVAL = 10;
const TIME_EXPECTED = BLOCK_GENERATION_INTERVAL * DIFFICULTY_ADJUSTMENT_INTERVAL;

/*
  BLOCKCHAIN UTILITY METHODS
*/

const calculateHash = (index, previousHash, timestamp, data) => {
    return CryptoJS.SHA256(index + previousHash + timestamp + data).toString();
};

const calculateHashForBlock = (block) => {
    return calculateHash(block.index, block.previousHash, block.timestamp, block.data);
};

const hexToBinary = s => {
  let ret = '';
  for(let i = 0; i < s.length; i++) {
    if(lookupTable[s[i]]) {
      ret += lookupTable[s[i]];
    } else {
      return null;
    }
  }
  return ret;
}

const getCurrentTimestamp = () => Math.round(new Date().getTime() / 1000);

const isValidTimestamp = (newBlock, previousBlock) => {
  return (previousBlock.timestamp - 60 < newBlock.timestamp)
         && newBlock.timestamp - 60 < getCurrentTimestamp();
}

// BLOCKCHAIN UTILITY METHODS
const hashMatchesDifficulty = (hash, difficulty) => {
    const hashInBinary = hexToBinary(hash);
    const requiredPrefix = ('0'.repeat(difficulty));
    return hashInBinary.startsWith(requiredPrefix);
}

const hashMatchesBlockContent = block => {
  const blockHash = calculateHashForBlock(block);
  return blockHash === block.hash;
}

const getAccumulatedDifficulty = blockchain => {
  return blockchain
            .map(block => block.difficulty)
            .map(difficulty => Math.pow(2, difficulty))
            .reduce((a, b) => a + b);
}

const hasValidHash = block => {
  if(!hashMatchesBlockContent(block)) {
    console.log('invalid hash, got:' + block.hash);
    return false;
  }

  if(!hashMatchesDifficulty(block.hash, block.difficulty)) {
    console.log('block difficulty not satisfied');
    return false;
  }

  return true;
}

const getAdjustedDifficulty = (latestBlock, blockchain) => {
  const prevAdjustmentBlock = blockchain[blockchain.length - DIFFICULTY_ADJUSTMENT_INTERVAL];
  const timeTaken = latestBlock.timestamp - prevAdjustmentBlock.timestamp;
  if(timeTaken < TIME_EXPECTED / 2) {
    return prevAdjustmentBlock.difficulty + 1;
  } else if(timeTaken > TIME_EXPECTED * 2) {
    return prevAdjustmentBlock.difficulty;
  } else {
    return prevAdjustmentBlock.difficulty;
  }

}

module.exports = {
    calculateHash,
    calculateHashForBlock,
    hexToBinary,
    isValidTimestamp,
    hasValidHash,
    hashMatchesDifficulty,
    getAccumulatedDifficulty,
    getAdjustedDifficulty,
    DIFFICULTY_ADJUSTMENT_INTERVAL
}

const findBlock = (index, previousHash, timestamp, data, difficulty) => {
  let nonce = 0;
  let searching = true;
  while(searching) {
    const hash = calculateHash(index, previousHash, timestamp, data, difficulty, nonce);
    if(hashMatchesDifficulty(hash, difficulty)) {
      return new Block(index, previousHash, timestamp, data, hash, difficulty, nonce);
    }
    nonce++;
  }
}
