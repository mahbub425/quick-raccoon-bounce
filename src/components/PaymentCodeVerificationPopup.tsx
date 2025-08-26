import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

interface PaymentCodeVerificationPopupProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onVerify: (code: string) => void;
  isLoading?: boolean;
}

const PaymentCodeVerificationPopup = ({ isOpen, onOpenChange, onVerify, isLoading = false }: PaymentCodeVerificationPopupProps) => {
  const [inputCode, setInputCode] = useState("");
  const [isConfirmButtonEnabled, setIsConfirmButtonEnabled] = useState(false);

  useEffect(() => {
    setIsConfirmButtonEnabled(inputCode.trim().length === 4); // Assuming a 4-digit code
  }, [inputCode]);

  const handleConfirm = () => {
    if (inputCode.trim().length === 4) {
      onVerify(inputCode.trim());
      setInputCode(""); // Clear input after verification attempt
    } else {
      toast.error("অনুগ্রহ করে ৪-ডিজিটের গোপন কোড প্রবেশ করুন।");
    }
  };

  const handleClose = () => {
    setInputCode("");
    onOpenChange(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[425px] p-6">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-blue-700">পেটিক্যাশ উত্তোলনের গোপন কোড ইনপুট দিন</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <Label htmlFor="secret-code" className="text-lg font-semibold text-gray-700">
            গোপন কোড
          </Label>
          <Input
            id="secret-code"
            type="text"
            placeholder="৪-ডিজিটের কোড লিখুন"
            maxLength={4}
            value={inputCode}
            onChange={(e) => setInputCode(e.target.value)}
            className="text-center text-xl tracking-widest border-blue-300 focus:border-blue-500 focus:ring-blue-500"
            disabled={isLoading}
          />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={isLoading}>
            বাতিল
          </Button>
          <Button
            type="submit"
            onClick={handleConfirm}
            disabled={!isConfirmButtonEnabled || isLoading}
            className="bg-blue-600 hover:bg-blue-700 text-white"
          >
            {isLoading ? "যাচাই করা হচ্ছে..." : "কনফার্ম পেমেন্ট"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default PaymentCodeVerificationPopup;