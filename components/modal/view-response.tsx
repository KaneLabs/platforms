import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { respondToCampaignApplication } from "@/lib/actions";
import { Answer, ApplicationStatus, FormResponse, Question } from "@prisma/client";
import { formatAnswer } from "@/components/form-response-table/utils";
import CampaignTierCard from '../campaign-tier-card';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import LoadingDots from '../icons/loading-dots';


interface ResponseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPrev: () => void;
  onNext: () => void;
  rowsData: Array<{[key: string]: any}>;
  selectedRowIndex: number;
}

const ResponseModal: React.FC<ResponseModalProps> = (
  { isOpen, onClose, onPrev, onNext, rowsData, selectedRowIndex }
) => {
  const [loading, setLoading] = useState(false);
  
  if (!isOpen) {
    return null;
  }

  const rowData = rowsData[selectedRowIndex].original;
  const formResponse: FormResponse & { answers: Array<Answer & { question: Question }> } = rowData.formResponseData ? rowData.formResponseData : null;

  const approveApplication = async () => {
    rowData.status = ApplicationStatus.ACCEPTED;
    return respondToCampaignApplication(rowData.id, true);
  }

  const declineApplication = async () => {
    rowData.status = ApplicationStatus.REJECTED;
    return respondToCampaignApplication(rowData.id, false);
  }

  const formattedUserData = (
    <div key={rowData.applicant}>
      <h2 className="text-xl">{rowData.applicant}</h2>
    </div>
  )

  const formattedFormAnswers = formResponse && (
    <div className="mt-2 flex flex-col space-y-6 rounded-lg border border-gray-500 bg-gray-100 py-6 px-8">
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
    <div className="fixed inset-0 z-50 overflow-y-auto bg-gray-200/50 backdrop-blur-xl">
      <div className="flex min-h-full items-center justify-center p-4 text-center ">
        <div className="w-full max-w-md transform overflow-hidden bg-gray-100 rounded-xl px-8 py-6 text-left align-middle shadow-xl transition-all md:border md:border-gray-200 dark:bg-gray-900 dark:md:border-gray-700">
          <div className="flex flex-col space-y-6">
            {formattedUserData}
            <CampaignTierCard
              tier={rowData.tierData}
              currency={rowData.currency}
            />
            {formattedFormAnswers}
          </div>
          <div className="mt-6 flex justify-between">
            <Button
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
              key="decline"
              disabled={rowData.status === ApplicationStatus.REJECTED}
              onClick={async () => {
                await declineApplication();
              }}
            >
              {loading ? <LoadingDots color="#808080" />: "DECLINE"}
            </Button>
            <Button
              key="approve"
              disabled={rowData.status === ApplicationStatus.ACCEPTED}
              onClick={async () => {
                await approveApplication();
              }}
            >
              {loading ? <LoadingDots color="#808080" />: "APPROVE"}
            </Button>
            <Button
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
