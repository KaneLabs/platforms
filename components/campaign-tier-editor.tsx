import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CampaignTier, Form } from "@prisma/client";
import { useState, useEffect } from 'react';
import { toast } from "sonner";
import * as ToggleGroup from "@radix-ui/react-toggle-group";

type EditedCampaignTier = Partial<Omit<CampaignTier, "price">> & { price: string | undefined }

interface CampaignTierEditorProps {
  tier: CampaignTier;
  forms: Form[];
  disableFields: boolean;
  onCancel: (tier: EditedCampaignTier) => void;
  onSave: (tier: EditedCampaignTier) => void;
}

export default function CampaignTierEditor({ tier, forms, disableFields, onCancel, onSave }: CampaignTierEditorProps) {
  const [editedTier, setEditedTier] = useState<EditedCampaignTier>(
    { name: tier.name, description: tier.description, quantity: tier.quantity,
      price: tier.price?.toString(), isOpenAmount: tier.isOpenAmount, formId: tier.formId });

  useEffect(() => {
    if (tier) {
      setEditedTier({
        name: tier.name,
        description: tier.description ?? undefined,
        quantity: tier.quantity ?? undefined,
        price: tier.price?.toString() ?? undefined,
        isOpenAmount: tier.isOpenAmount ?? false,
        formId: tier.formId
      });
    }
  }, [tier]);

  const handleFieldChange = (field: string, value: boolean | string | number | null) => {
    setEditedTier(prev => ({ ...prev, [field]: value }));
  };

  const onApply = () => {
    try {
      if (!editedTier.name) {
        throw new Error("Tier name is required");
      } 
      if (!editedTier.isOpenAmount && !editedTier.price) {
        throw new Error("Tier price is required");
      }

      onSave(editedTier);
    } catch (e: any) {
      console.error(e);
      toast.error(e.message);
    }
  }

  return (
    <div className="mb-4 px-8 py-6 border rounded-lg">
      <div className="space-y-4">
        <div>Please name your Tier</div>
        <Input
          type="text" 
          id="tierName"
          value={editedTier.name}
          onChange={(e) => handleFieldChange('name', e.target.value)}
          placeholder="E.g. Residents Pass, Standard ticket, VIP ticket, Donor"
          disabled={disableFields}
        />
        <div>How much is the contribution for this Tier?</div>
        <div className="flex justify-between items-center gap-4">
          <ToggleGroup.Root
            id="openAmount"
            className={`inline-flex rounded-full bg-gray-200 shadow-md ${disableFields && "opacity-50 cursor-not-allowed"}`}
            type="single"
            defaultValue="false"
            value={String(editedTier.isOpenAmount)}
            disabled={disableFields}
            onValueChange={(value) => {
              if (value === "true") {
                handleFieldChange("price", "");
                handleFieldChange("isOpenAmount", true);
              } else {
                handleFieldChange("isOpenAmount", false);
              }
            }}
          >
            <ToggleGroup.Item
              className="px-4 py-2 rounded-l-full bg-gray-800 text-gray-100 shadow hover:bg-gray-800/90 data-[state=on]:!bg-accent-green/90 dark:bg-gray-100 dark:text-gray-900 dark:hover:bg-gray-300/90"
              value="false"
            >
              Fixed amount
            </ToggleGroup.Item>
            <ToggleGroup.Item
              className="px-4 py-2 rounded-r-full bg-gray-800 text-gray-100 shadow hover:bg-gray-800/90 data-[state=on]:!bg-accent-green/90 dark:bg-gray-100 dark:text-gray-900 dark:hover:bg-gray-300/90"
              value="true"
            >
              Open amount
            </ToggleGroup.Item>
          </ToggleGroup.Root>
          <div className="flex-grow">
            <Input
              id="price"
              type="text"
              value={editedTier.price}
              placeholder="E.g. 100, 8.99, 0.001"
              pattern="^\d*\.?\d*$"
              inputMode="decimal"
              disabled={disableFields}
              onKeyDown={(e) => {
                if (!/[\d.]/.test(e.key) && 
                    e.key !== "Backspace" && 
                    e.key !== "Tab" && 
                    e.key !== "ArrowLeft" && 
                    e.key !== "ArrowRight"
                ) {
                  e.preventDefault();
                }
              }}
              onChange={(e) => {
                let value = e.target.value.replace(/[^\d.]/g, '');

                if (parseFloat(value) < 0) value = '0';

                handleFieldChange("price", value);
                handleFieldChange("isOpenAmount", false);
              }}
            />
          </div>
        </div>
        <div>Describe the Tier</div>
        <Textarea 
          id="description"
          className="placeholder:text-gray-700"
          value={editedTier.description || ''}
          onChange={(e) => handleFieldChange('description', e.target.value)}
          placeholder="Consider describing who the tier is for and what you get by contributing"
        />
        <div>Would you like contributors to this tier to answer a questions form?</div>
        <Select
          value={editedTier.formId || ""}
          onValueChange={(value) => {
            handleFieldChange("formId", value === "none" ? null : value)
          }}
          disabled={disableFields}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select a Form" />
          </SelectTrigger>
          <SelectContent>
            {editedTier.formId && <SelectItem value="none">
              Select a Form
            </SelectItem>}
            {forms.map((form) => {
              return (
                <SelectItem 
                  key={form.id}
                  value={form.id}
                >
                  {form.name}
                </SelectItem>
              );
            })}
          </SelectContent>
        </Select>
      </div>
      <div className="flex justify-end">
        <Button
          variant="ghost"
          className="mt-4 mr-2"
          onClick={() => onCancel(editedTier)}
        >
          Cancel
        </Button>
        <Button
          className="mt-4"
          onClick={onApply}
        >
          Apply
        </Button>
      </div>
    </div>
  );
}