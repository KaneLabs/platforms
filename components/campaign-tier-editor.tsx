import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { CampaignTier } from "@prisma/client";
import { useState, useEffect } from 'react';


interface CampaignTierEditorProps {
  tier: CampaignTier;
  onSave: (tier: Partial<CampaignTier>) => void;
}

export default function CampaignTierEditor({ tier, onSave }: CampaignTierEditorProps) {
  const [editedTier, setEditedTier] = useState<Partial<CampaignTier>>(
    { name: tier.name, description: tier.description, quantity: tier.quantity,
      price: tier.price });

  useEffect(() => {
    if (tier) {
      if (tier.price === null) {
        tier.price = 0;
      }
      setEditedTier({
        name: tier.name,
        description: tier.description ?? undefined,
        quantity: tier.quantity ?? undefined,
        price: tier.price > 0 ? tier.price : undefined,
      });
    }
  }, [tier]);

  const handleFieldChange = (field: string, value: string | number) => {
    setEditedTier(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="mb-4 p-4 border rounded-lg">
      <div className="space-y-4">
        <div>Please name your Contributor Tier</div>
        <Input
          type="text" 
          id="tierName"
          value={editedTier.name}
          placeholder="Tier name"
          onChange={(e) => handleFieldChange('name', e.target.value)}
        />
        <div>How much is the contribution for this Tier?</div>
        <Input
          type="number"
          id="price"
          value={editedTier.price ?? ''}
          placeholder="Price"
          onChange={(e) => handleFieldChange('price', e.target.value)}
        />
        <div>How would you describe it to your citizens?</div>
        <Textarea 
          id="description"
          value={editedTier.description || ''}
          placeholder="Tier description"
          onChange={(e) => handleFieldChange('description', e.target.value)}
        />
        <div>How many spots are available in this Tier? (Optional)</div>
          <Input 
            type="number" 
            id="quantity"
            value={editedTier.quantity ?? ''}
            placeholder="Number of spots "
            onChange={(e) => handleFieldChange('quantity', e.target.value)}
          />
        </div>
      <div className="flex justify-end">
        <Button
          className="mt-2"
          onClick={() => onSave(editedTier)}
        >
          Save
        </Button>
    </div>
    </div>
  );
}