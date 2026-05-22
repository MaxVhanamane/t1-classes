import { Loader } from "lucide-react";

const Loading = () => {
  return (
    <div className="flex h-(--h-viewport-minus-navbar) items-center justify-center overflow-hidden">
      <Loader className="size-6 animate-spin text-muted-foreground" />
    </div>
  );
};

export default Loading;
