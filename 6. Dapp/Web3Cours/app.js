const { Web3 } = require('web3');
const rpcUrl = 'https://holesky.infura.io/v3/3fbde67a34c34a649b291b0cdd06a2b0'
const web3 = new Web3(rpcUrl);

async function getBalance() {
    try {
        const wei = await web3.eth.getBalance("0x4A866ea1B7f7085024D1F93DAEDbE8BD534A1Fb3");
        const balance = web3.utils.fromWei(wei, 'ether'); // convertir la valeur en ether
        console.log(balance);
    } catch (error) {
        console.error('Erreur lors de la récupération du solde :', error);
    }
}

getBalance();