import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { CampaignPageLink } from "@prisma/client";
import { useState, useEffect } from "react";
import { toast } from "sonner";

type EditedCampaignLink = Partial<CampaignPageLink>;

interface CampaignTierEditorProps {
  link: CampaignPageLink;
  onCancel: () => void;
  onSave: (link: EditedCampaignLink) => void;
}

export default function CampaignLinkEditor({
  link,
  onCancel,
  onSave,
}: CampaignTierEditorProps) {
  const [editedLink, setEditedLink] = useState<EditedCampaignLink>({
    href: link.href,
    title: link.title,
    description: link.description ?? undefined,
  });

  useEffect(() => {
    if (link) {
      setEditedLink({
        href: link.href,
        title: link.title,
        description: link.description ?? undefined,
      });
    }
  }, [link]);

  const handleFieldChange = (field: string, value: string | null) => {
    setEditedLink((prev) => ({ ...prev, [field]: value }));
  };

  const onApply = () => {
    try {
      if (!editedLink.href) {
        throw new Error("Link url is required");
      }
      if (!editedLink.title) {
        throw new Error("Link title is required");
      }

      onSave(editedLink);
    } catch (e: any) {
      console.error(e);
      toast.error(e.message);
    }
  };

  return (
    <div className="mb-4 rounded-lg border px-8 py-6">
      <div className="space-y-4">
        <div>Link URL</div>
        <Input
          type="text"
          id="href"
          value={editedLink.href}
          onChange={(e) => handleFieldChange("href", e.target.value)}
        />
        <div>Link Title</div>
        <Input
          type="text"
          id="title"
          value={editedLink.title}
          onChange={(e) => handleFieldChange("title", e.target.value)}
        />
        <div>Link Description</div>
        <Textarea
          id="description"
          className="placeholder:text-gray-700"
          value={editedLink.description || ""}
          onChange={(e) => handleFieldChange("description", e.target.value)}
        />
      </div>
      <div className="flex justify-end">
        <Button variant="ghost" className="mr-2 mt-4" onClick={onCancel}>
          Cancel
        </Button>
        <Button className="mt-4" onClick={onApply}>
          Apply
        </Button>
      </div>
    </div>
  );
}
