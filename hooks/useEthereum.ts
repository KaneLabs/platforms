import { ethers } from "ethers";
import CampaignContract from '@/protocol/campaigns/out/Campaign.sol/Campaign.json';
import { toast } from "sonner";
import { Campaign } from "@prisma/client";
import { launchCampaign } from "@/lib/actions";
import { withCampaignAuth } from "@/lib/auth";
import { useEffect, useState } from "react";

interface LaunchCampaignData {
  id: string;
  sponsorEthAddress: string;
  deployedAddress: string;
  deployed: boolean;
}

interface Params {
  subdomain: string;
}

export default function useEthereum() {
  const [signer, setSigner] = useState<ethers.Signer | null>(null);

  useEffect(() => {
    const handleAccountsChanged = async (accounts: string[]) => {
      if (accounts.length === 0) {
        console.log('Please connect to MetaMask.');
      } else {
        await connectToWallet();
      }
    };

    if (window.ethereum) {
      window.ethereum.on('accountsChanged', handleAccountsChanged);
    }

    return () => {
      if (window.ethereum) {
        window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
      }
    };
  }, []);

  const connectToWallet = async () => {
    if (!window.ethereum) {
      throw new Error("Please install MetaMask or another wallet.");
    }

    const provider = new ethers.BrowserProvider(window.ethereum);
    await provider.send("eth_requestAccounts", []);
    const newSigner = await provider.getSigner();
    setSigner(newSigner);
    return newSigner;
  };

  const launch = async (campaign: Campaign, params: Params): Promise<void> => {
    try {
      const currentSigner = signer || await connectToWallet();

      const campaignABI = CampaignContract.abi;
      const campaignBytecode = CampaignContract.bytecode;

      const creatorAddress = await currentSigner.getAddress();
      const thresholdWei = campaign.thresholdWei;
      const name = campaign.name;

      const campaignFactory = new ethers.ContractFactory(campaignABI, campaignBytecode, currentSigner);
      const campaignInstance = await campaignFactory.deploy(creatorAddress, thresholdWei, name);
      await campaignInstance.waitForDeployment();

      const deployedAddress = await campaignInstance.getAddress();

      const data: LaunchCampaignData = {
        id: campaign.id,
        sponsorEthAddress: creatorAddress,
        deployedAddress: deployedAddress,
        deployed: true,
      };

      toast.success(`Campaign launched!`);

      await launchCampaign(data, { params: { subdomain: params.subdomain } }, null);
    } catch (error: any) {
      console.error(error);
      toast.error(error.message);
    }
  };

  const contribute = async (amount: string, campaign: Campaign): Promise<void> => {
    try {
      // await connectToWallet();
      const currentSigner = signer || await connectToWallet();

      if (!campaign.deployed) {
        throw new Error("Campaign isn't deployed yet");
      }

      const campaignABI = CampaignContract.abi;
      const campaignInstance = new ethers.Contract(campaign.deployedAddress!, campaignABI, currentSigner);
      const transactionResponse = await campaignInstance.contribute({ value: ethers.parseEther(amount) });
      toast('Sending contribution...')
      // Wait for the transaction to be mined
      await transactionResponse.wait();

      toast.success(`Contribution successful. Thanks!`);
    } catch (error: any) {
      console.error(error);
      toast.error(error.message);
    }
  };

  const withdraw = async (amount: string, campaign: Campaign): Promise<void> => {
    try {
      await connectToWallet();

      if (!campaign.deployed) {
        throw new Error("Campaign isn't deployed yet");
      }

      const campaignABI = CampaignContract.abi;
      const campaignInstance = new ethers.Contract(campaign.deployedAddress!, campaignABI, signer);
      await campaignInstance.withdraw(ethers.parseEther(amount));

      toast.success(`Withdrew ${amount} ETH`);
    } catch (error: any) {
      console.error(error);
      toast.error(error.message);
    }
  };

  const getContributionTotal = async (contractAddr: string) => {
    const currentSigner = signer || await connectToWallet();

    const campaignABI = CampaignContract.abi;
    const campaignInstance = new ethers.Contract(contractAddr, campaignABI, currentSigner);
    const total = await campaignInstance.totalContributions();
    return total;
  }

  const getContractBalance = async (contractAddr: string) => {
    try {
      if (!ethers.isAddress(contractAddr)) {
        throw new Error("Invalid contract address");
      }

      const provider = new ethers.BrowserProvider(window.ethereum);
      const balance = await provider.getBalance(contractAddr);
      return balance;
    } catch (error: any) {
      console.error(error);
      toast.error(error.message);
      throw error;
    }
  }

  return {
    connectToWallet,
    launch,
    contribute,
    withdraw,
    getContributionTotal,
    getContractBalance,
  };
};