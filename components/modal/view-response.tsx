import React from 'react';
import { Button } from "@/components/ui/button";
import { respondToCampaignApplication } from "@/lib/actions";
import { Answer, FormResponse, Question } from "@prisma/client";
import { formatAnswer } from "@/components/form-response-table/utils";
import CampaignTierCard from '../campaign-tier-card';


interface ResponseModalProps {
  isOpen: boolean;
  onClose: () => void;
  rowData: { [key: string]: any };
  formResponse: FormResponse & { answers: Array<Answer & { question: Question }> };
}

const ResponseModal: React.FC<ResponseModalProps> = (
  { isOpen, onClose, rowData, formResponse }
) => {
  if (!isOpen) {
    return null;
  }

  const approveApplication = async () => {
    respondToCampaignApplication(rowData.id, true);
  }

  const declineApplication = async () => {
    respondToCampaignApplication(rowData.id, false);
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
              onClick={() => {
                declineApplication();
                onClose();
              }}
            >
              DECLINE
            </Button>
            <Button
              onClick={onClose}
            >
              SKIP
            </Button>
            <Button
              onClick={() => {
                approveApplication();
                onClose();
              }}
            >
              APPROVE
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ResponseModal;
