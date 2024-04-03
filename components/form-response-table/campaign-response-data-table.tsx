"use client";

import {
  Answer,
  ApplicationStatus,
  Campaign,
  CampaignApplication,
  CampaignContribution,
  CampaignTier,
  CurrencyType,
  Form,
  FormResponse,
  Question,
  User,
} from "@prisma/client";
import DataTable from "./data-table";
import { ColumnDef, Row } from "@tanstack/react-table";
import { useEffect, useState } from 'react';
import ResponseModal from '@/components/modal/view-response';
import { useRouter } from "next/navigation";
import { getApplicationStatusText, getCurrencySymbol } from "@/lib/utils";
import { PictureInPicture2 } from "lucide-react";

export default function CampaignApplicationsDataTable({
  campaign,
  applications,
}: {
  campaign: Campaign,
  applications: Array<CampaignApplication & { user: User | null } & { campaignTier: CampaignTier | null } & { formResponse: FormResponse & { answers: Array<Answer & { question: Question }> } | null } & { contribution: CampaignContribution | null }>
}) {
  const [data, setData] = useState<Row<any>[]>([]);
  const [isModalOpen, setModalOpen] = useState(false);
  const [selectedRowIndex, setSelectedRowIndex] = useState<number>(0);
  const [selectedTableRows, setSelectedTableRows] = useState<Array<Row<any>>>([]);

  const router = useRouter();

  useEffect(() => {
    async function formatCampaignApplicationRows() {
      const formattedData = applications.map((application) => {
        const contribution = application.contribution?.amount && application.contribution?.amount > 0 
          ? getCurrencySymbol(campaign.currency) + application.contribution?.amount + " " + campaign.currency 
          : "";
        const row: { [key: string]: any } = {
          id: application.id,
          applicant: application.user?.email,
          tier: application.campaignTier?.name,
          contribution,
          contributionAmount: application.contribution?.amount,
          status: application.status,
          currency: campaign.currency,
          tierData: application.campaignTier,
          formResponseData: application.formResponse
        };

        if (application.formResponse) {
          application.formResponse.answers.forEach((answer: Answer) => {
            row[answer.questionId] = answer;
          });
        }

        return row as Row<any>;
      });

      const nonNullFormattedData = formattedData.filter(row => row !== null) as Row<any>[];
      setData(nonNullFormattedData);      
    }

    formatCampaignApplicationRows();
  }, [applications, campaign]);

  const handleRowClick = (row: Row<any>, rows: Array<Row<any>>) => {
    setSelectedRowIndex(row.index);
    setSelectedTableRows(rows);
    setModalOpen(true);
  };

  const columns: ColumnDef<any, any>[] = [{
    header: "Applicant",
    accessorKey: "applicant",
    cell: ({ row }: { row: Row<any> }) => {
      return (
        <div className="flex flex-wrap space-x-1">
          {row.original.applicant}
        </div>
      );
    },
  }, {
    header: "Tier",
    accessorKey: "tier",
    cell: ({ row }: { row: Row<any> }) => {
      return (
        <div className="flex flex-wrap space-x-1">
          {row.original.tier}
        </div>
      );
    },
  }, {
    header: "Contribution",
    accessorKey: "contribution",
    cell: ({ row }: { row: Row<any> }) => {
      return (
        <div className="flex flex-wrap space-x-1">
          {row.original.contribution}
        </div>
      );
    },
  }, {
    header: "Status",
    accessorKey: "status",
    cell: ({ row }: { row: Row<any> }) => {
      return (
        <div className="flex flex-wrap space-x-1">
          {getApplicationStatusText(row.original.status)}
        </div>
      );
    },
  }, {
    header: "",
    accessorKey: "expand",
    cell: ({ row, rows }: { row: Row<any>, rows?: Array<Row<any>> }) => {
      return (
        <PictureInPicture2 
          className="cursor-pointer" 
          onClick={(e) => {
            e.stopPropagation();
            handleRowClick(row, rows || []);
          }} 
          width={18}
        />
      );
    },
  }];

  return (
    <div className="mt-4">
      {Object.keys(ApplicationStatus).map(status => {
        const statusData = data.filter((d: any) => d.status === status);

        if (statusData.length === 0) {
          return null; 
        }

        const contributionSum = statusData.reduce((sum, cur: any) => {
          return sum + cur.contributionAmount;
        }, 0);

        return (
            <div className="mt-4" key={status}>
                <div className="flex items-center space-x-4">
                    <div>
                        <span className="text-sm font-medium text-gray-800">Status - </span>
                        <span className="text-sm font-semibold">{getApplicationStatusText(status as ApplicationStatus)}</span>
                    </div>
                    <div>
                        <span className="text-sm font-medium text-gray-800">Applications - </span>
                        <span className="text-sm font-semibold">{statusData.length}</span>
                    </div>
                    <div>
                        <span className="text-sm font-medium text-gray-800">Amount - </span>
                        <span className="text-sm font-semibold">{getCurrencySymbol(campaign.currency)}{contributionSum.toFixed(2)} {campaign.currency}</span>
                    </div>
            </div>
            <DataTable columns={columns} data={statusData} />
          </div>
        );
      })}
      <ResponseModal
        isOpen={isModalOpen}
        onClose={() => {
          setModalOpen(false); 
          router.refresh();
        }}
        rowsData={selectedTableRows}
        selectedRowIndex={selectedRowIndex}
        onPrev={() => setSelectedRowIndex(selectedRowIndex - 1)}
        onNext={() => setSelectedRowIndex(selectedRowIndex + 1)}
      />
    </div>
  );
}