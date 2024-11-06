import { ethers } from "./ethers.min.js";
import { contractAddress, contractAbi } from "./constants.js";

const connectButton = document.getElementById('connectButton');
const userBalance = document.getElementById('userBalance');
const ethersInput = document.getElementById('ethersInput');
const sendEthersButton = document.getElementById('sendEthersButton');

let connectedAccount;
let amountInWei;

const ethersToWei = (ethers) => {
    return ethers * 10 ** 18;
}

connectButton.addEventListener('click', async function () {
    if (typeof window.ethereum !== 'undefined') {
        const resultAccount = await window.ethereum.request({ method: "eth_requestAccounts" });
        connectedAccount = ethers.getAddress(resultAccount[0]);
        connectButton.innerHTML = "Connected with " + connectedAccount.substring(0, 4) + "..." + connectedAccount.substring(connectedAccount.length - 4);
    }
    else {
        connectButton.innerHTML = "Please install Metamask.";
    }

    if (connectedAccount) {
        try {
            const provider = new ethers.BrowserProvider(window.ethereum);
            const contract = new ethers.Contract(contractAddress, contractAbi, provider); // Provider = Lire
            let balance = await contract.getBalanceOfUser(connectedAccount);
            userBalance.innerHTML = balance.toString();
        }
        catch (e) {
            console.log(e);
        }
    }
})

ethersInput.addEventListener('input', function () {
    amountInWei = ethersToWei(ethersInput.value);
});

sendEthersButton.addEventListener('click', async function () {
    if (connectedAccount) {
        try {
            const provider = new ethers.BrowserProvider(window.ethereum);
            const signer = await provider.getSigner();
            const contract = new ethers.Contract(contractAddress, contractAbi, signer); // Signer = Ecrire
            let transaction = await contract.sendEthers(amountInWei)
            await transaction.wait();
        }
        catch (e) {
            console.log(e);
        }
    }
});