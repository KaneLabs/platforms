import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { respondToCampaignApplication } from "@/lib/actions";
import { Answer, ApplicationStatus, FormResponse, Question } from "@prisma/client";
import { formatAnswer } from "@/components/form-response-table/utils";
import CampaignTierCard from '../campaign-tier-card';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';
import LoadingDots from '../icons/loading-dots';
import useEthereum from '@/hooks/useEthereum';


interface ResponseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRefresh: () => void;
  onPrev: () => void;
  onNext: () => void;
  rowsData: Array<{[key: string]: any}>;
  selectedRowIndex: number;
}

const ResponseModal: React.FC<ResponseModalProps> = (
  { isOpen, onClose, onRefresh, onPrev, onNext, rowsData, selectedRowIndex }
) => {
  const [loading, setLoading] = useState(false);
  const [approveLoading, setApproveLoading] = useState(false);
  const [declineLoading, setDeclineLoading] = useState(false);
  const { rejectContribution } = useEthereum();
  
  if (!isOpen) {
    return null;
  }

  const rowData = rowsData[selectedRowIndex].original;
  const formResponse: FormResponse & { answers: Array<Answer & { question: Question }> } = rowData.formResponseData ? rowData.formResponseData : null;

  const approveApplication = async () => {
    setApproveLoading(true);
    const isSuccess = await respondToCampaignApplication(rowData.id, true);
    if (isSuccess) {
      rowData.status = ApplicationStatus.ACCEPTED;
    }
    setApproveLoading(false);
  }

  const declineApplication = async () => {
    setDeclineLoading(true);
    const isSuccess = await rejectContribution(rowData.campaignData, rowData.applicationData, rowData.contributionData.walletEthAddress, rowData.justRejected);
    if (isSuccess) {
      rowData.status = ApplicationStatus.REJECTED;
      rowData.justRejected = true;
    }
    setDeclineLoading(false);
  }

  const formattedUserData = (
    <div key={rowData.applicant}>
      <h2 className="text-xl">{rowData.applicant}</h2>
    </div>
  )

  const formattedFormAnswers = formResponse && (
    <div className="mt-2 flex flex-col space-y-6 rounded-lg border border-gray-300 bg-gray-100 py-6 px-8">
      {formResponse.answers.map(
        (value) => {
          const question = value.question;

          return (
            <div key={value.id}>
              <h2 className="text-xl">{question.text}</h2>
              <h2 className="text-xl">{question.description}</h2>
              <p className="text-sm">
                {formatAnswer(question!, value)}
              </p>
            </div>
          );
        },
      )}
    </div>
  );

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-gray-100/50 backdrop-blur-xl flex items-center justify-center">
      <div className="absolute top-0 left-0 p-8 w-full flex justify-between items-start">
        <div>
          <h1 className="font-serif text-3xl text-gray-800 dark:text-white">
            Application Details
          </h1>
          <h4 className="truncate rounded-md py-1 font-medium text-gray-600 transition-colors dark:bg-gray-800 dark:text-gray-400">
            View each application and approve/decline.
          </h4>
        </div>
        <button
          onClick={onClose}
          className="rounded-md p-1 transition-opacity hover:opacity-70 focus:outline-none"
        >
          <X className="h-6 w-6" />
        </button>
      </div>
      <div className="relative w-full max-w-lg p-4">
        <div className="bg-gray-100 rounded-xl pl-8 pr-6 py-6 text-left align-middle shadow-xl transition-all md:border md:border-gray-200 dark:bg-gray-900 dark:md:border-gray-700">
          <div className="flex flex-col pb-2">
            {formattedUserData}
          </div>
          <div className="flex flex-col space-y-2 max-h-96 pr-2 overflow-y-auto">
            <CampaignTierCard
              tier={rowData.tierData}
              currency={rowData.currency}
            />
            {formattedFormAnswers}
          </div>
          <div className="mt-6 flex justify-between pr-2">
            <Button
              variant="ghost"
              key="prev"
              disabled={selectedRowIndex <= 0}
              onClick={(e) => {
                onPrev();
              }} 
            >
              <ChevronLeft
                className="cursor-pointer" 
                width={18} 
              />
            </Button>
            <Button
              variant="destructive"
              key="decline"
              disabled={rowData.status === ApplicationStatus.REJECTED}
              onClick={async () => {
                await declineApplication();
              }}
            >
              {declineLoading ? <LoadingDots color="#FFF" />: "Decline"}
            </Button>
            <Button
              variant="green"
              key="approve"
              disabled={rowData.status === ApplicationStatus.ACCEPTED}
              onClick={async () => {
                await approveApplication();
              }}
            >
              {approveLoading ? <LoadingDots color="#FFF" />: "Approve"}
            </Button>
            <Button
              variant="ghost"
              key="next"
              disabled={selectedRowIndex >= rowsData.length - 1}
              onClick={(e) => {
                onNext();
              }} 
            >
              <ChevronRight
                className="cursor-pointer" 
                width={18} 
              />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ResponseModal;
