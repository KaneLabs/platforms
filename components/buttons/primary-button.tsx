import { cn } from "@/lib/utils";
import LoadingDots from "@/components/icons/loading-dots";
import { Button } from "../ui/button";

export type PrimaryButtonProps =
  React.ButtonHTMLAttributes<HTMLButtonElement> & {
    loading: boolean;
    children: React.ReactNode;
    className?: string;
  };

export default function PrimaryButton({
  loading,
  children,
  className,
  ...rest
}: PrimaryButtonProps) {
  return (
    <Button
      className={cn(
        "min-w-36 flex h-9 items-center justify-center space-x-2 rounded-lg text-sm transition-all duration-100 focus:outline-none sm:h-9 font-semibold",
        loading
          ? "cursor-not-allowed text-gray-100 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300"
          : "text-gray-100 active:bg-gray-200 dark:border-gray-700 dark:hover:border-gray-200 dark:hover:bg-gray-900/20 dark:hover:text-gray-100 dark:active:bg-gray-800",
        className,
      )}
      disabled={loading}
      {...rest}
    >
      {loading ? <LoadingDots color="#FFF" /> : children}
    </Button>
  );
}
