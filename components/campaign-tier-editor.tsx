import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CampaignTier, Form } from "@prisma/client";
import { useState, useEffect } from 'react';

type EditedCampaignTier = Partial<Omit<CampaignTier, "price">> & { price: string | undefined }

interface CampaignTierEditorProps {
  tier: CampaignTier;
  forms: Form[];
  onSave: (tier: EditedCampaignTier) => void;
}

export default function CampaignTierEditor({ tier, forms, onSave }: CampaignTierEditorProps) {
  const [editedTier, setEditedTier] = useState<EditedCampaignTier>(
    { name: tier.name, description: tier.description, quantity: tier.quantity,
      price: tier.price?.toString(), formId: tier.formId });

  useEffect(() => {
    if (tier) {
      setEditedTier({
        name: tier.name,
        description: tier.description ?? undefined,
        quantity: tier.quantity ?? undefined,
        price: tier.price?.toString() ?? undefined,
        formId: tier.formId
      });
    }
  }, [tier]);

  const handleFieldChange = (field: string, value: string | number) => {
    setEditedTier(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="mb-4 px-8 py-6 border rounded-lg">
      <div className="space-y-4">
        <div>Please name your Contributor Tier</div>
        <Input
          type="text" 
          id="tierName"
          value={editedTier.name}
          onChange={(e) => handleFieldChange('name', e.target.value)}
        />
        <div>How much is the contribution for this Tier?</div>
        <Input
          id="price"
          type="text"
          value={editedTier.price}
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
          }}
        />
        <div>How would you describe it to your citizens?</div>
        <Textarea 
          id="description"
          className="text"
          value={editedTier.description || ''}
          onChange={(e) => handleFieldChange('description', e.target.value)}
        />
        <div>What form does it link to (if any)?</div>
        <Select
          value={editedTier.formId || ""}
          onValueChange={(value) => {
            handleFieldChange("formId", value)
          }}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select a Form" />
          </SelectTrigger>
          <SelectContent>
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
          className="mt-4"
          onClick={() => {
            onSave(editedTier)
          }}
        >
          Apply
        </Button>
    </div>
    </div>
  );
}