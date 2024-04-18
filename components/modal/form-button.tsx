import { useFormStatus } from "react-dom";
import PrimaryButton from "../buttons/primary-button";
import { cn } from "@/lib/utils";
import { Button } from "../ui/button";

export default function FormButton({
  text,
  loading,
  className,
}: {
  text: string;
  loading?: boolean;
  className?: string;
}) {
  const { pending } = useFormStatus();
  return (
    <Button
      type="submit"
      className={cn(className)}
    >
      <span>{text}</span>
    </Button>
  );
}
