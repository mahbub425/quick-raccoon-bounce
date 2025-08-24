import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { FileText } from "lucide-react";

interface AttachmentViewerPopupProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  filename: string;
}

const AttachmentViewerPopup = ({ isOpen, onOpenChange, filename }: AttachmentViewerPopupProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] p-6">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-blue-700">সংযুক্ত ফাইল</DialogTitle>
          <DialogDescription className="text-gray-600">
            আপনি যে ফাইলটি সংযুক্ত করেছেন তার বিবরণ।
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col items-center justify-center p-4 border border-dashed border-gray-300 rounded-md bg-gray-50 text-gray-700">
          <FileText className="h-12 w-12 text-blue-500 mb-3" />
          <p className="text-lg font-medium text-center break-all">{filename}</p>
          <p className="text-sm text-gray-500 mt-2">
            {/* In a real application, you would fetch and display the actual file content here. */}
            (এখানে ফাইলের বিষয়বস্তু প্রদর্শিত হবে)
          </p>
        </div>
        <div className="mt-4 text-right">
          <Button onClick={() => onOpenChange(false)}>বন্ধ করুন</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AttachmentViewerPopup;