import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { FileText, Download } from "lucide-react";
import { toast } from "sonner";

interface AttachmentViewerPopupProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  filename: string;
}

const AttachmentViewerPopup = ({ isOpen, onOpenChange, filename }: AttachmentViewerPopupProps) => {
  const isImageFile = /\.(jpg|jpeg|png|gif|webp|svg)$/i.test(filename);

  const handleDownload = () => {
    // In a real application, you would fetch the file from a server
    // and trigger a download. For now, we'll simulate it.
    toast.info(`"${filename}" ফাইলটি ডাউনলোড করা হচ্ছে... (বাস্তব অ্যাপ্লিকেশনে সার্ভার থেকে ডাউনলোড হবে)`);
    // Example of a simulated download link (won't work without actual file URL)
    // const dummyDownloadLink = document.createElement('a');
    // dummyDownloadLink.href = `/public/placeholder.svg`; // Replace with actual file URL
    // dummyDownloadLink.download = filename;
    // document.body.appendChild(dummyDownloadLink);
    // dummyDownloadLink.click();
    // document.body.removeChild(dummyDownloadLink);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] p-6">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-blue-700">সংযুক্ত ফাইল</DialogTitle>
          <DialogDescription className="text-gray-600">
            আপনি যে ফাইলটি সংযুক্ত করেছেন তার বিবরণ।
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col items-center justify-center p-4 border border-dashed border-gray-300 rounded-md bg-gray-50 text-gray-700 min-h-[200px]">
          {isImageFile ? (
            <img
              src="/public/placeholder.svg" // Placeholder image for now
              alt="Attachment preview"
              className="max-w-full h-auto max-h-60 object-contain mb-3"
            />
          ) : (
            <FileText className="h-12 w-12 text-blue-500 mb-3" />
          )}
          <p className="text-lg font-medium text-center break-all">{filename}</p>
          <p className="text-sm text-gray-500 mt-2">
            (এখানে ফাইলের বিষয়বস্তু প্রদর্শিত হবে)
          </p>
        </div>
        <DialogFooter className="flex justify-between items-center mt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)}>বন্ধ করুন</Button>
          <Button onClick={handleDownload} className="bg-blue-600 hover:bg-blue-700 text-white">
            <Download className="mr-2 h-4 w-4" /> ডাউনলোড করুন
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AttachmentViewerPopup;