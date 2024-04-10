import { LogDescription, ethers } from "ethers";
import CampaignContract from '@/protocol/campaigns/out/Campaign.sol/Campaign.json';
import ERC20ABI from '@/protocol/campaigns/abi/ERC20.json';
import CampaignV1ContractABI from '@/protocol/campaigns/abi/CampaignV1.json';
import CampaignFactoryV1ContractABI from '@/protocol/campaigns/abi/CampaignFactoryV1.json';
import { toast } from "sonner";
import { Campaign, CampaignTier, FormResponse } from "@prisma/client";
import { createCampaignApplication, launchCampaign } from "@/lib/actions";
import { withCampaignAuth } from "@/lib/auth";
import { useEffect, useState } from "react";
import { getCurrencyTokenAddress, getCurrencyTokenDecimals } from "@/lib/utils";

const CampaignFactoryV1ContractAddress = "0x042edeb5302527a8726d04ce50b9d741b8ef27d4";

interface LaunchCampaignData {
  id: string;
  sponsorEthAddress: string;
  deployedAddress: string;
  deployed: boolean;
}

interface LaunchParams {
  subdomain: string;
}

interface Log {
  topics: string[];
  data: string;
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

  const launch = async (campaign: Campaign, params: LaunchParams): Promise<void> => {
    try {
      const currentSigner = signer || await connectToWallet();

      const campaignABI = JSON.stringify(CampaignFactoryV1ContractABI);

      const creatorAddress = await currentSigner.getAddress();

      if (!campaign.currency || !campaign.threshold || !campaign.deadline) {
        console.log(campaign.currency, campaign.threshold, campaign.deadline);
        throw new Error("Campaign is missing required settings");
      }

      const tokenAddress = getCurrencyTokenAddress(campaign.currency);
      const tokenDecimals = getCurrencyTokenDecimals(campaign.currency);
      const threshold = ethers.parseUnits(campaign.threshold.toString(), tokenDecimals);
      const deadline = Math.floor(new Date(campaign.deadline).getTime() / 1000)

      const loadingToastId = toast('Launching campaign...', { duration: 60000 });

      const campaignFactory = new ethers.Contract(CampaignFactoryV1ContractAddress, campaignABI, currentSigner);
      const transaction = await campaignFactory.createCampaign(
        creatorAddress,
        tokenAddress,
        threshold,
        deadline
      );
      const receipt = await transaction.wait();

      const events = receipt.logs.map((log: Log) => campaignFactory.interface.parseLog(log));
      const campaignCreatedEvent = events.find((log: LogDescription) => log && log.name === "CampaignCreated");
      const { campaignAddress } = campaignCreatedEvent.args;

      const data: LaunchCampaignData = {
        id: campaign.id,
        sponsorEthAddress: creatorAddress,
        deployedAddress: campaignAddress,
        deployed: true,
      };
      
      await launchCampaign(data, { params: { subdomain: params.subdomain } }, null);

      toast.dismiss(loadingToastId);
      toast.success(`Campaign launched!`);
    } catch (error: any) {
      console.error(error);
      toast.error(error.message);
    }
  };

  const contribute = async (amount: number, campaign: Campaign, campaignTier: CampaignTier, formResponse?: FormResponse): Promise<void> => {
    try {
      const currentSigner = signer || await connectToWallet();

      if (!campaign.deployed) {
        throw new Error("Campaign isn't deployed yet");
      }

      const tokenAddress = getCurrencyTokenAddress(campaign.currency);
      const tokenDecimals = getCurrencyTokenDecimals(campaign.currency);
      const contributeAmount = ethers.parseUnits(amount.toString(), tokenDecimals);

      const tokenInstance = new ethers.Contract(tokenAddress, ERC20ABI, currentSigner);
      const currentSignerAddress = await currentSigner.getAddress();
      const allowance = await tokenInstance.allowance(currentSignerAddress, campaign.deployedAddress);
      
      if (allowance < contributeAmount) {
        const loadingToastId = toast('Approving token for contribution...', { duration: 60000 });
        
        const approveTx = await tokenInstance.approve(campaign.deployedAddress, contributeAmount);
        await approveTx.wait();
        
        toast.dismiss(loadingToastId);
        toast('Token approved');
      }

      const campaignABI = JSON.stringify(CampaignV1ContractABI);
      const campaignInstance = new ethers.Contract(campaign.deployedAddress!, campaignABI, currentSigner);

      const loadingToastId = toast('Sending contribution...', { duration: 60000 });

      const transaction = await campaignInstance.submitContribution(contributeAmount);
      const receipt = await transaction.wait();

      const events = receipt.logs.map((log: Log) => campaignInstance.interface.parseLog(log));
      const contributionSubmittedEvent = events.find((log: LogDescription) => log && log.name === "ContributionSubmitted");
      const { actualSubmittedContribution } = contributionSubmittedEvent.args;
      const actualSubmittedContributionAmount = parseFloat(ethers.formatUnits(actualSubmittedContribution, tokenDecimals));

      await createCampaignApplication(campaign.id, campaignTier.id, actualSubmittedContributionAmount, formResponse?.id, transaction.hash);
      
      toast.dismiss(loadingToastId);
      toast.success(`Contribution sent!`);
    } catch (error: any) {
      console.error(error);
      toast.error(error.message);
      throw error;
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