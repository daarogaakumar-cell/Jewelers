import { Spinner } from "@/components/ui/Spinner";

export default function Loading() {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <Spinner className="h-8 w-8 text-gold-500" />
        <p className="text-sm text-charcoal-400">Loading...</p>
      </div>
    </div>
  );
}
