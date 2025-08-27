import React, { useMemo } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { format, parseISO } from "date-fns";
import { useNotifications } from "@/context/NotificationContext";
import { useAuth } from "@/context/AuthContext";
import { cn } from "@/lib/utils";

interface NotificationPopupProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

const NotificationPopup = ({ isOpen, onOpenChange }: NotificationPopupProps) => {
  const { user } = useAuth();
  const { getNotificationsForUser } = useNotifications();

  const userNotifications = useMemo(() => {
    if (!user) return [];
    return getNotificationsForUser(user.pin);
  }, [user, getNotificationsForUser]);

  if (!user) {
    return null; // Should not happen if protected routes are working
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] p-6 max-h-[90vh] overflow-y-auto">
        <DialogHeader className="text-center mb-4">
          <DialogTitle className="text-2xl font-bold text-blue-700">
            আপনার নোটিফিকেশন
          </DialogTitle>
          <DialogDescription className="text-gray-600">
            আপনার জন্য জেনারেট হওয়া গোপন কোড এবং পেমেন্টের তথ্য।
          </DialogDescription>
        </DialogHeader>

        {userNotifications.length === 0 ? (
          <div className="text-center text-xl text-gray-600 p-4 bg-gray-50 rounded-lg border border-gray-200">
            আপনার জন্য কোনো নোটিফিকেশন নেই।
          </div>
        ) : (
          <div className="overflow-x-auto border rounded-md">
            <Table>
              <TableHeader>
                <TableRow className="bg-blue-100">
                  <TableHead className="w-[50px]">ক্রমিক</TableHead>
                  <TableHead>তারিখ</TableHead>
                  <TableHead>টাকার পরিমাণ</TableHead>
                  <TableHead>গোপন কোড</TableHead>
                  <TableHead>স্ট্যাটাস</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {userNotifications.map((notif, index) => (
                  <TableRow key={index} className={cn(notif.isUsed ? "bg-gray-50 text-gray-500" : "bg-white")}>
                    <TableCell className="font-medium">{index + 1}</TableCell>
                    <TableCell>{format(parseISO(notif.generatedAt), "dd MMM, yyyy HH:mm")}</TableCell>
                    <TableCell className="text-right">
                      {notif.amount.toLocaleString('bn-BD', { style: 'currency', currency: 'BDT', minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                    </TableCell>
                    <TableCell className="font-bold text-lg tracking-widest">
                      {notif.code}
                    </TableCell>
                    <TableCell>
                      <span className={cn(
                        "px-2 py-1 rounded-full text-xs font-semibold",
                        notif.isUsed ? "bg-red-100 text-red-800" : "bg-green-100 text-green-800"
                      )}>
                        {notif.isUsed ? "ব্যবহৃত" : "নতুন"}
                      </span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default NotificationPopup;