import { Menu, X } from "lucide-react";
import { useState } from "react";
import { Button } from "../ui/button";
import { Sidebar } from "./Sidebar";

export function ResponsiveSidebar() {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <div className="flex items-center justify-between border-b border-border bg-background p-4 sm:hidden">
        <div className="text-lg font-semibold">BatchPro</div>
        <Button
          type="button"
          variant="outline"
          size="icon"
          onClick={() => setOpen((current) => !current)}
          aria-label={open ? "Close menu" : "Open menu"}
        >
          {open ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
        </Button>
      </div>

      <div className={`${open ? "block" : "hidden"} sm:block`}>
        <Sidebar />
      </div>
    </div>
  );
}
