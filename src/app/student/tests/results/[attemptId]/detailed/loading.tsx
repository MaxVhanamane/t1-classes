import { Loader } from "lucide-react";

function loading() {
  return (
    <div className="flex h-(--h-viewport-minus-navbar) w-full items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-6 text-center">
        {/* Spinner */}
        <div className="relative">
          <Loader className=" animate-spin text-primary" />

          {/* Soft glow ring */}
          <div className="absolute inset-0 rounded-full bg-primary/20 blur-xl" />
        </div>

        {/* Changing text */}
        <div className="h-5">
          <p className="text-sm text-muted-foreground animate-in fade-in duration-300">
            Preparing...
          </p>
        </div>
      </div>
    </div>
  );
}

export default loading;
