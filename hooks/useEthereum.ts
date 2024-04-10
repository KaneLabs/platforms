import { LogDescription, ethers } from "ethers";
import CampaignContract from '@/protocol/campaigns/out/Campaign.sol/Campaign.json';
import ERC20ABI from '@/protocol/campaigns/abi/ERC20.json';
import CampaignERC20V1ContractABI from '@/protocol/campaigns/abi/CampaignERC20V1.json';
import CampaignETHV1ContractABI from '@/protocol/campaigns/abi/CampaignETHV1.json';
import CampaignFactoryV1ContractABI from '@/protocol/campaigns/abi/CampaignFactoryV1.json';
import { toast } from "sonner";
import { Campaign, CampaignApplication, CampaignContribution, CampaignTier, CurrencyType, FormResponse } from "@prisma/client";
import { createCampaignApplication, launchCampaign, withdrawCampaignApplication } from "@/lib/actions";
import { withCampaignAuth } from "@/lib/auth";
import { useEffect, useState } from "react";
import { getCurrencyTokenAddress, getCurrencyTokenDecimals } from "@/lib/utils";

const CampaignFactoryV1ContractAddress = "0x2488b39a46e1ef74093b0b9b7a561a432ed97e29";

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

      toast('Launching campaign...', { duration: 60000 });

      const campaignFactory = new ethers.Contract(CampaignFactoryV1ContractAddress, campaignABI, currentSigner);
      
      let campaignAddress = "";

      if (campaign.currency === CurrencyType.ETH) {
        const transaction = await campaignFactory.createCampaignETH(
          creatorAddress,
          threshold,
          deadline
        );

        toast.dismiss();
        toast('Confirming transaction...', { duration: 60000 });

        const receipt = await transaction.wait();
        const events = receipt.logs.map((log: Log) => campaignFactory.interface.parseLog(log));
        const campaignCreatedEvent = events.find((log: LogDescription) => log && log.name === "CampaignETHCreated");
        campaignAddress = campaignCreatedEvent.args.campaignAddress;
      } else {
        const transaction = await campaignFactory.createCampaignERC20(
          creatorAddress,
          tokenAddress,
          threshold,
          deadline
        );

        toast.dismiss();
        toast('Confirming transaction...', { duration: 60000 });

        const receipt = await transaction.wait();
        const events = receipt.logs.map((log: Log) => campaignFactory.interface.parseLog(log));
        const campaignCreatedEvent = events.find((log: LogDescription) => log && log.name === "CampaignERC20Created");
        campaignAddress = campaignCreatedEvent.args.campaignAddress;
      }

      const data: LaunchCampaignData = {
        id: campaign.id,
        sponsorEthAddress: creatorAddress,
        deployedAddress: campaignAddress,
        deployed: true,
      };
      
      await launchCampaign(data, { params: { subdomain: params.subdomain } }, null);

      toast.dismiss();
      toast.success(`Campaign launched!`);
    } catch (error: any) {
      console.error(error);
      toast.error(error.message);
    }
  };

  const contribute = async (amount: number, campaign: Campaign, campaignTier: CampaignTier, formResponse?: FormResponse): Promise<void> => {
    try {
      const currentSigner = signer || await connectToWallet();
      const currentSignerAddress = await currentSigner.getAddress();

      if (!campaign.deployed) {
        throw new Error("Campaign isn't deployed yet");
      }

      const tokenAddress = getCurrencyTokenAddress(campaign.currency);
      const tokenDecimals = getCurrencyTokenDecimals(campaign.currency);
      const contributeAmount = ethers.parseUnits(amount.toString(), tokenDecimals);

      let events = [];
      let transactionHash = "";

      if (campaign.currency === CurrencyType.ETH) {
        toast('Sending contribution...', { duration: 60000 });

        const campaignABI = JSON.stringify(CampaignETHV1ContractABI);
        const campaignInstance = new ethers.Contract(campaign.deployedAddress!, campaignABI, currentSigner);
        const transaction = await campaignInstance.submitContribution({
            value: contributeAmount
        });

        toast.dismiss();
        toast('Confirming transaction...', { duration: 60000 });
        
        const receipt = await transaction.wait();

        events = receipt.logs.map((log: Log) => campaignInstance.interface.parseLog(log));
        transactionHash = transaction.hash;
      } else {
        const tokenInstance = new ethers.Contract(tokenAddress, ERC20ABI, currentSigner);
        const allowance = await tokenInstance.allowance(currentSignerAddress, campaign.deployedAddress);

        if (allowance < contributeAmount) {
          toast('Approving token for contribution...', { duration: 60000 });
          
          const approveTx = await tokenInstance.approve(campaign.deployedAddress, contributeAmount);
          
          toast.dismiss();
          toast('Confirming transaction...', { duration: 60000 });

          await approveTx.wait();
        }

        toast.dismiss();
        toast('Sending contribution...', { duration: 60000 });

        const campaignABI = JSON.stringify(CampaignERC20V1ContractABI);
        const campaignInstance = new ethers.Contract(campaign.deployedAddress!, campaignABI, currentSigner);
        const transaction = await campaignInstance.submitContribution(contributeAmount);
        
        toast.dismiss()
        toast('Confirming transaction...', { duration: 60000 });

        const receipt = await transaction.wait();

        events = receipt.logs.map((log: Log) => campaignInstance.interface.parseLog(log));
        transactionHash = transaction.hash;
      }
      
      const contributionSubmittedEvent = events.find((log: LogDescription) => log && log.name === "ContributionSubmitted");
      const { actualSubmittedContribution } = contributionSubmittedEvent.args;
      const actualSubmittedContributionAmount = parseFloat(ethers.formatUnits(actualSubmittedContribution, tokenDecimals));

      await createCampaignApplication(campaign.id, campaignTier.id, actualSubmittedContributionAmount, formResponse?.id, transactionHash);
      
      toast.dismiss();
      toast.success(`Contribution sent!`);
    } catch (error: any) {
      console.error(error);
      toast.error(error.message);
      throw error;
    }
  };

  const withdrawContribution = async (campaign: Campaign, application: CampaignApplication, contribution: CampaignContribution): Promise<void> => {
    try {
      const currentSigner = signer || await connectToWallet();

      if (!campaign.deployed) {
        throw new Error("Campaign isn't deployed yet");
      }

      const tokenDecimals = getCurrencyTokenDecimals(campaign.currency);
      const contributeAmount = ethers.parseUnits(contribution.amount.toString(), tokenDecimals);

      toast('Withdrawing contribution...', { duration: 60000 });

      let campaignABI = "";

      if (campaign.currency === CurrencyType.ETH) {
        campaignABI = JSON.stringify(CampaignETHV1ContractABI);
      } else {
        campaignABI = JSON.stringify(CampaignERC20V1ContractABI);
      }

      const campaignInstance = new ethers.Contract(campaign.deployedAddress!, campaignABI, currentSigner);
      const transaction = await campaignInstance.withdrawContribution(contributeAmount);

      toast.dismiss();
      toast('Confirming transaction...', { duration: 60000 });
        
      const receipt = await transaction.wait();
      
      await withdrawCampaignApplication(application.id, transaction.hash);
      
      toast.dismiss();
      toast.success(`Contribution withdrawn!`);
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
    withdrawContribution,
    withdraw,
    getContributionTotal,
    getContractBalance,
  };
};