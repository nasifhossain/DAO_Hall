import { BrowserProvider, Contract } from "ethers";
import { CONTRACT_ABI, CONTRACT_ADDRESS } from "./contractABI";

export const getContract = async () => {
  if (!window.ethereum) throw new Error("🦊 MetaMask not installed");
    console.log(`🔗 Connecting to contract at ${CONTRACT_ADDRESS}`);
    
  const provider = new BrowserProvider(window.ethereum); // ✅ ethers v6
  const signer = await provider.getSigner();             // ✅ ethers v6
  const contract = new Contract(CONTRACT_ADDRESS, CONTRACT_ABI, signer); // ✅ ethers v6

  return contract;
};
