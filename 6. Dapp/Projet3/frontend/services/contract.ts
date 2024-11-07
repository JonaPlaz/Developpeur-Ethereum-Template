import { ethers } from "ethers";

declare global {
  interface Window {
    ethereum: any;
  }
}

const contractAddress = process.env.CONTRACT_ADDRESS!;
const contractAbi = JSON.parse(process.env.CONTRACT_ABI!);

export const getContract = () => {
  const provider = new ethers.BrowserProvider(window.ethereum);
  const contract = new ethers.Contract(contractAddress, contractAbi, provider);
  return contract;
};
