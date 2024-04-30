import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CampaignTier, Form } from "@prisma/client";
import { useState, useEffect } from 'react';
import { toast } from "sonner";
import * as Toggle from '@radix-ui/react-toggle';

type EditedCampaignTier = Partial<Omit<CampaignTier, "price">> & { price: string | undefined }

interface CampaignTierEditorProps {
  tier: CampaignTier;
  forms: Form[];
  onCancel: (tier: EditedCampaignTier) => void;
  onSave: (tier: EditedCampaignTier) => void;
}

export default function CampaignTierEditor({ tier, forms, onCancel, onSave }: CampaignTierEditorProps) {
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
        />
        <div>How much is the contribution for this Tier?</div>
        <div className="flex justify-between items-center">
          <div className="flex-grow">
            <Input
              id="price"
              type="text"
              value={editedTier.price}
              placeholder="E.g. 100, 8.99, 0.001"
              pattern="^\d*\.?\d*$"
              inputMode="decimal"
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
          <div className="px-4">OR</div>
          <Toggle.Root
            id="openAmount"
            pressed={!!editedTier.isOpenAmount}
            onPressedChange={(pressed: boolean) => {
              handleFieldChange("price", "");
              handleFieldChange("isOpenAmount", !!pressed);
            }}
            className={`${
              editedTier.isOpenAmount ? 'bg-accent-green text-gray-100' : 'bg-gray-100 text-gray-800'
            } rounded-md p-2 `}
          >
            Open Amount
          </Toggle.Root>
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