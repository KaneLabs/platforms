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
import { getApplicationStatusColor, getApplicationStatusText, getCurrencySymbol } from "@/lib/utils";
import { PictureInPicture2, Trash2 } from "lucide-react";
import { deleteCampaignApplication } from "@/lib/actions";
import useEthereum from "@/hooks/useEthereum";
import LoadingDots from "../icons/loading-dots";

export default function CampaignApplicationsDataTable({
  campaign,
  applications,
  subdomain
}: {
  campaign: Campaign,
  applications: Array<CampaignApplication & { user: User | null } & { campaignTier: CampaignTier | null } & { formResponse: FormResponse & { answers: Array<Answer & { question: Question }> } | null } & { contribution: CampaignContribution | null }>
  subdomain: string
}) {
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<Row<any>[]>([]);
  const [isModalOpen, setModalOpen] = useState(false);
  const [selectedRowIndex, setSelectedRowIndex] = useState<number>(0);
  const [selectedTableRows, setSelectedTableRows] = useState<Array<Row<any>>>([]);
  const { rejectContribution } = useEthereum();
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
          campaignData: campaign,
          applicationData: application,
          contributionData: application.contribution,
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

  const handleRemoveApplication = async (row: Row<any>) => {
    if (window.confirm("Are you sure you want to delete this application?")) {
      setLoading(true);
      await rejectContribution(row.original.campaignData, row.original.applicationData, row.original.contributionData.walletEthAddress, row.original.justRejected) &&
      await deleteCampaignApplication({
        applicationId: row.original.applicationData.id, 
        contributionId: row.original.contributionData.id
      }, { params: { subdomain } }, null);
      setLoading(false);
      setData(data.filter(d => d.id !== row.original.applicationData.id));  
    }
  };

  const columns: ColumnDef<any, any>[] = [{
    header: "Applicant",
    accessorKey: "applicant",
    cell: ({ row }: { row: Row<any> }) => {
      return (
        <div className="flex flex-wrap space-x-1 font-medium">
          {row.original.applicant}
        </div>
      );
    },
  }, {
    header: "Tier",
    accessorKey: "tier",
    cell: ({ row }: { row: Row<any> }) => {
      return (
        <div className="flex flex-wrap space-x-1 font-medium">
          {row.original.tier}
        </div>
      );
    },
  }, {
    header: "Contribution",
    accessorKey: "contribution",
    cell: ({ row }: { row: Row<any> }) => {
      return (
        <div className="flex flex-wrap space-x-1 font-medium">
          {row.original.contribution}
        </div>
      );
    },
  }, {
    header: "Status",
    accessorKey: "status",
    cell: ({ row }: { row: Row<any> }) => {
      return (
        <div className={`flex flex-wrap space-x-1 font-medium ${getApplicationStatusColor(row.original.status)}`}>
          {getApplicationStatusText(row.original.status)}
        </div>
      );
    },
  }, {
    header: "",
    accessorKey: "expand",
    cell: ({ row, rows }: { row: Row<any>, rows?: Array<Row<any>> }) => {
      return (
        <>
        {
          loading 
          ? <LoadingDots color="#808080" />
          : <div className="flex space-x-4">
              <PictureInPicture2 
                className="cursor-pointer" 
                onClick={(e) => {
                  e.stopPropagation();
                  handleRowClick(row, rows || []);
                }} 
                width={18}
              />
              <Trash2 
                className="cursor-pointer" 
                onClick={(e) => {
                  e.stopPropagation();
                  handleRemoveApplication(row);
                }}
                width={18}
              />
            </div>
        }
        </>
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
            <div className="flex items-center pb-2 border-b border-gray-300 justify-between">
                <div className={`text-lg font-medium w-48 ${getApplicationStatusColor(status as ApplicationStatus)}`}>
                  {getApplicationStatusText(status as ApplicationStatus)}
                </div>
                <div className="flex flex-1 justify-end items-center space-x-10">
                    <div>
                        <span className="text-sm font-medium text-gray-800">Users: </span>
                        <span className="text-sm font-semibold">{statusData.length}</span>
                    </div>
                    <div>
                        <span className="text-sm font-medium text-gray-800">Subtotal: </span>
                        <span className="text-sm font-semibold">{getCurrencySymbol(campaign.currency)}{contributionSum.toFixed(5)} {campaign.currency}</span>
                    </div>
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
        onRefresh={() => {
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