import React, { useState, useMemo } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow, TableFooter } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import { format, parseISO } from "date-fns";
import { SubmittedVoucher, VoucherStatus } from "@/types";
import { useSubmittedVouchers } from "@/context/SubmittedVouchersContext";
import { DUMMY_INSTITUTIONS, DUMMY_PINS, DUMMY_PROGRAM_SESSIONS, DUMMY_VOUCHER_TYPES, OFFICE_SUPPLIES_ITEM_OPTIONS, CLEANING_SUPPLIES_ITEM_OPTIONS, KITCHEN_HOUSEHOLD_ITEM_OPTIONS, RENTAL_UTILITY_EXPENSE_CATEGORIES, REPAIR_ITEM_OPTIONS } from "@/data/dummyData";
import { useNavigate } from "react-router-dom";
import AttachmentViewerPopup from "@/components/AttachmentViewerPopup"; // Import the new component

interface VoucherDetailsPopupProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  voucher: SubmittedVoucher;
}

// Helper function to get correction text
const getCorrectionText = (count: number | undefined) => {
  if (count === undefined || count === 0) { // Original submission, or no correction count
    return ''; // No text for original submission
  } else if (count === 1) {
    return 'সংশোধিত';
  } else { // count > 1
    const bengaliNumbers = ['০', '১', '২', '৩', '৪', '৫', '৬', '৭', '৮', '৯'];
    const toBengaliNumber = (num: number) => {
      return String(num).split('').map(digit => bengaliNumbers[parseInt(digit)]).join('');
    };
    return `${toBengaliNumber(count)}য় বার সংশোধিত`;
  }
};

const VoucherDetailsPopup = ({ isOpen, onOpenChange, voucher }: VoucherDetailsPopupProps) => {
  const { submittedVouchers, updateSubmittedVoucherStatus } = useSubmittedVouchers();
  const navigate = useNavigate();
  const [isCommentDialogOpen, setIsCommentDialogOpen] = useState(false);
  const [commentType, setCommentType] = useState<'send_back' | 'reject' | null>(null);
  const [comment, setComment] = useState("");
  const [isAttachmentPopupOpen, setIsAttachmentPopupOpen] = useState(false); // State for attachment popup
  const [attachmentToView, setAttachmentToView] = useState(""); // State for filename to view
  const [isOriginalVoucherPopupOpen, setIsOriginalVoucherPopupOpen] = useState(false); // State for original voucher popup
  const [originalVoucher, setOriginalVoucher] = useState<SubmittedVoucher | null>(null); // State for original voucher data

  // Helper functions (copied/adapted from Cart.tsx)
  const getInstitutionName = (id: string) => DUMMY_INSTITUTIONS.find(inst => inst.id === id)?.name || "N/A";
  const getBranchName = (institutionId: string, branchId: string) => {
    const institution = DUMMY_INSTITUTIONS.find(inst => inst.id === institutionId);
    return institution?.branches.find(branch => branch.id === branchId)?.name || "N/A";
  };
  const getProgramSessionName = (institutionId: string, sessionId: string) => {
    const sessions = DUMMY_PROGRAM_SESSIONS[institutionId];
    return sessions?.find(session => session.id === sessionId)?.name || "N/A";
  };
  const getPinNames = (pins: string[]) => {
    if (!pins || pins.length === 0) return "N/A";
    return pins.map(pin => DUMMY_PINS.find(p => p.pin === pin)?.name || pin).join(", ");
  };

  // Helper function to get the full label for a dropdown value (adapted from Cart.tsx)
  const getDropdownLabel = (voucherTypeId: string, fieldName: string, fieldValue: string, itemData: any = {}) => {
    if (!fieldValue) return "N/A";

    const allVouchers = DUMMY_VOUCHER_TYPES.flatMap(v => v.type === 'multi' && v.subTypes ? [v, ...v.subTypes] : [v]);
    const voucherTypeDetails = allVouchers.find(v => v.id === voucherTypeId);
    if (!voucherTypeDetails || !voucherTypeDetails.formFields) return fieldValue;

    const field = voucherTypeDetails.formFields.find(f => f.name === fieldName);
    if (!field) return fieldValue;

    let options: { value: string; label: string }[] = [];

    if (fieldName === "institutionId") {
      options = DUMMY_INSTITUTIONS.map(inst => ({ value: inst.id, label: inst.name }));
    } else if (fieldName === "branchId") {
      const institution = DUMMY_INSTITUTIONS.find(inst => inst.id === itemData.institutionId);
      options = institution ? institution.branches.map(branch => ({ value: branch.id, label: branch.name })) : [];
    } else if (fieldName === "programSessionId") {
      options = itemData.institutionId && DUMMY_PROGRAM_SESSIONS[itemData.institutionId]
                ? DUMMY_PROGRAM_SESSIONS[itemData.institutionId].map(session => ({ value: session.id, label: session.name }))
                : [];
    } else if (fieldName === "expenseTitle") {
      options = field.options || [];
    } else if (fieldName === "itemName") {
      const currentExpenseTitle = itemData.expenseTitle;
      if (voucherTypeId === "office-supplies-stationery") {
        options = currentExpenseTitle ? OFFICE_SUPPLIES_ITEM_OPTIONS[currentExpenseTitle] || [] : [];
      } else if (voucherTypeId === "cleaning-supplies") {
        options = currentExpenseTitle ? CLEANING_SUPPLIES_ITEM_OPTIONS[currentExpenseTitle] || [] : [];
      } else if (voucherTypeId === "kitchen-household-items") {
        options = currentExpenseTitle ? KITCHEN_HOUSEHOLD_ITEM_OPTIONS[currentExpenseTitle] || [] : [];
      } else if (voucherTypeId === "repair") { // NEW: Repair item options
        options = currentExpenseTitle ? REPAIR_ITEM_OPTIONS[currentExpenseTitle] || [] : [];
      }
    } else if (fieldName === "expenseCategory") { // Handle expenseCategory for all relevant voucher types
      if (voucherTypeId === "entertainment" && itemData.expenseTitle) {
        const entertainmentVoucherDetails = DUMMY_VOUCHER_TYPES.flatMap(v => v.type === 'multi' && v.subTypes ? [v, ...v.subTypes] : [v]).find(v => v.id === "entertainment");
        const expenseTitleField = entertainmentVoucherDetails?.formFields?.find(f => f.name === 'expenseTitle');
        const matchingConditionalField = expenseTitleField?.conditionalFields?.find(cf => cf.value === itemData.expenseTitle);
        const expenseCategoryField = matchingConditionalField?.fields.find(f => f.name === 'expenseCategory');
        options = expenseCategoryField?.options || [];
      } else if (voucherTypeId === "rental-utility" && itemData.expenseTitle) {
        options = RENTAL_UTILITY_EXPENSE_CATEGORIES[itemData.expenseTitle] || [];
      }
    } else if (fieldName === "applicableFor") {
      options = field.options || [];
    } else if (fieldName === "vehicleName") {
      options = field.options || [];
    } else if (fieldName === "type" && voucherTypeId === "publicity-entertainment") {
      options = field.options || [];
    } else if (fieldName === "shift" && voucherTypeId === "publicity-publicist-bill") {
      options = field.options || [];
    } else if (fieldName === "pettyCashType" && voucherTypeId === "petty-cash-demand") { // NEW: Petty Cash Type
      options = field.options || [];
    } else {
      options = field.options || []; // Fallback for other dropdowns
    }

    return options.find(opt => opt.value === fieldValue)?.label || fieldValue;
  };

  const getVoucherHeadingById = (id: string) => {
    const voucherType = DUMMY_VOUCHER_TYPES.flatMap(v => v.type === 'multi' && v.subTypes ? [v, ...v.subTypes] : [v]).find(v => v.id === id);
    return voucherType?.heading || id;
  };

  const handleApprove = () => {
    // Special handling for petty-cash-demand
    if (voucher.voucherTypeId === 'petty-cash-demand') {
      if (voucher.approvedAmount === undefined || voucher.approvedAmount <= 0 || !voucher.expectedAdjustmentDate) {
        toast.error("পেটি ক্যাশ অনুমোদনের জন্য অনুমোদিত টাকার পরিমাণ এবং সম্ভাব্য সমন্বয়ের তারিখ আবশ্যক।");
        return;
      }
      // For petty-cash-demand, approval means it goes to payment and user dashboard
      updateSubmittedVoucherStatus(voucher.id, 'approved'); // Mark as approved by mentor
      toast.success("পেটি ক্যাশ চাহিদাপত্র অনুমোদিত হয়েছে এবং পেমেন্টের জন্য প্রস্তুত!");
    } else {
      // Existing logic for other voucher types
      updateSubmittedVoucherStatus(voucher.id, 'approved');
      toast.success("অনুমোদন সম্পন্ন হয়েছে!");
    }
    onOpenChange(false); // Close popup
  };

  const handleSendBack = () => {
    setCommentType('send_back');
    setIsCommentDialogOpen(true);
  };

  const handleReject = () => {
    setCommentType('reject');
    setIsCommentDialogOpen(true);
  };

  const handleCommentConfirm = () => {
    if (!comment.trim()) {
      toast.error("মন্তব্য আবশ্যক।");
      return;
    }
    if (commentType === 'send_back') {
      updateSubmittedVoucherStatus(voucher.id, 'sent_back', comment);
      toast.info("ভাউচার ফেরত পাঠানো হয়েছে।");
    } else if (commentType === 'reject') {
      updateSubmittedVoucherStatus(voucher.id, 'rejected', comment);
      toast.error("ভাউচার বাতিল করা হয়েছে।");
    }
    setIsCommentDialogOpen(false);
    setComment("");
    onOpenChange(false); // Close main popup
  };

  const handleViewAttachment = (filename: string) => {
    setAttachmentToView(filename);
    setIsAttachmentPopupOpen(true);
  };

  const handleViewOriginalVoucher = () => {
    if (voucher.originalVoucherId) {
      const original = submittedVouchers.find(v => v.id === voucher.originalVoucherId);
      if (original) {
        setOriginalVoucher(original);
        setIsOriginalVoucherPopupOpen(true);
      } else {
        toast.error("পূর্ববর্তী ভাউচারটি খুঁজে পাওয়া যায়নি।");
      }
    }
  };

  const renderAttachmentCell = (itemData: any) => (
    <TableCell>
      {itemData.attachment ? (
        <Button
          variant="link"
          className="p-0 h-auto text-blue-600 hover:text-blue-800"
          onClick={(e) => {
            e.stopPropagation(); // Prevent row click if any
            handleViewAttachment(itemData.attachment);
          }}
        >
          {itemData.attachment}
        </Button>
      ) : (
        "নেই"
      )}
    </TableCell>
  );

  const renderVoucherDetailsTable = (item: SubmittedVoucher) => {
    const itemData = item.data;
    const voucherTypeId = item.voucherTypeId;

    // This logic is adapted from Cart.tsx render functions, but simplified for a single item and no action column
    switch (voucherTypeId) {
      case 'entertainment':
        return (
          <TableBody>
            <TableRow>
              <TableCell>{itemData.date ? format(new Date(itemData.date), "dd MMM, yyyy") : "N/A"}</TableCell>
              <TableCell>{getInstitutionName(itemData.institutionId)}</TableCell>
              <TableCell>{getBranchName(itemData.institutionId, itemData.branchId)}</TableCell>
              <TableCell>{getDropdownLabel(voucherTypeId, 'expenseTitle', itemData.expenseTitle, itemData) || "N/A"}</TableCell>
              <TableCell>
                {getDropdownLabel(voucherTypeId, 'expenseCategory', itemData.expenseCategory, itemData) || "N/A"}
                {itemData.guestName && ` (অতিথি: ${itemData.guestName})`}
                {itemData.studentName && ` (শিক্ষার্থী: ${itemData.studentName})`}
                {itemData.guardianName && ` (অভিভাবক: ${itemData.guardianName})`}
                {itemData.selectedPins && itemData.selectedPins.length > 0 && ` (পিন: ${itemData.selectedPins.length} জন)`} {/* Updated line */}
                {itemData.quantityUnit?.quantity && itemData.quantityUnit?.unit && ` (${itemData.quantityUnit.quantity} ${itemData.quantityUnit.unit})`}
              </TableCell>
              <TableCell className="text-right">{(itemData.amount || 0).toLocaleString('bn-BD', { style: 'currency', currency: 'BDT', minimumFractionDigits: 0, maximumFractionDigits: 0 })}</TableCell>
              <TableCell>{itemData.description || "N/A"}</TableCell>
              {renderAttachmentCell(itemData)}
            </TableRow>
          </TableBody>
        );
      case 'conveyance':
        return (
          <TableBody>
            <TableRow>
              <TableCell>{itemData.date ? format(new Date(itemData.date), "dd MMM, yyyy") : "N/A"}</TableCell>
              <TableCell>{getInstitutionName(itemData.institutionId)}</TableCell>
              <TableCell>{getBranchName(itemData.institutionId, itemData.branchId)}</TableCell>
              <TableCell>{getDropdownLabel(voucherTypeId, 'applicableFor', itemData.applicableFor, itemData) || "N/A"}</TableCell>
              <TableCell>
                {item.submittedByPin === itemData.submittedByPin ? (item.submittedByPin || 'N/A') :
                 (itemData.teacherPins && itemData.teacherPins.length > 0 && `(শিক্ষক পিন: ${getPinNames(itemData.teacherPins)})`) ||
                 (itemData.otherPins && itemData.otherPins.length > 0 && `(অন্যান্য পিন: ${getPinNames(itemData.otherPins)})`) || "N/A"}
              </TableCell>
              <TableCell>{itemData.from || "N/A"}</TableCell>
              <TableCell>{itemData.to || "N/A"}</TableCell>
              <TableCell>
                {getDropdownLabel(voucherTypeId, 'vehicleName', itemData.vehicleName, itemData) || "N/A"}
                {itemData.specialApproverPin && ` (অনুমোদনকারী পিন: ${itemData.specialApproverPin})`}
              </TableCell>
              <TableCell className="text-right">{(itemData.amount || 0).toLocaleString('bn-BD', { style: 'currency', currency: 'BDT', minimumFractionDigits: 0, maximumFractionDigits: 0 })}</TableCell>
              <TableCell>{itemData.purpose || "N/A"}</TableCell>
              {renderAttachmentCell(itemData)}
            </TableRow>
          </TableBody>
        );
      case 'publicity-conveyance':
        return (
          <TableBody>
            <TableRow>
              <TableCell>{itemData.date ? format(new Date(itemData.date), "dd MMM, yyyy") : "N/A"}</TableCell>
              <TableCell>{getInstitutionName(itemData.institutionId)}</TableCell>
              <TableCell>{getBranchName(itemData.institutionId, itemData.branchId)}</TableCell>
              <TableCell>{getProgramSessionName(itemData.institutionId, itemData.programSessionId)}</TableCell>
              <TableCell>{itemData.publicityLocation || "N/A"}</TableCell>
              <TableCell>{itemData.startTime || "N/A"} - {itemData.endTime || "N/A"}</TableCell>
              <TableCell>{itemData.from || "N/A"}</TableCell>
              <TableCell>{itemData.to || "N/A"}</TableCell>
              <TableCell>
                {getDropdownLabel(voucherTypeId, 'vehicleName', itemData.vehicleName, itemData) || "N/A"}
                {itemData.specialApproverPin && ` (অনুমোদনকারী পিন: ${itemData.specialApproverPin})`}
              </TableCell>
              <TableCell>{itemData.numberOfPersons || 0}</TableCell>
              <TableCell className="text-right">{(itemData.amount || 0).toLocaleString('bn-BD', { style: 'currency', currency: 'BDT', minimumFractionDigits: 0, maximumFractionDigits: 0 })}</TableCell>
              <TableCell>{itemData.description || "N/A"}</TableCell>
              {renderAttachmentCell(itemData)}
            </TableRow>
          </TableBody>
        );
      case 'publicity-entertainment':
        return (
          <TableBody>
            <TableRow>
              <TableCell>{itemData.date ? format(new Date(itemData.date), "dd MMM, yyyy") : "N/A"}</TableCell>
              <TableCell>{getInstitutionName(itemData.institutionId)}</TableCell>
              <TableCell>{getBranchName(itemData.institutionId, itemData.branchId)}</TableCell>
              <TableCell>{getProgramSessionName(itemData.institutionId, itemData.programSessionId)}</TableCell>
              <TableCell>{itemData.publicityLocation || "N/A"}</TableCell>
              <TableCell>{itemData.startTime || "N/A"} - {itemData.endTime || "N/A"}</TableCell>
              <TableCell>{getDropdownLabel(voucherTypeId, 'applicableFor', itemData.applicableFor, itemData) || "N/A"}</TableCell>
              <TableCell>
                {itemData.pin && `(পিন: ${getPinNames([itemData.pin])})`}
                {itemData.name && `(নাম: ${itemData.name})`}
                {!itemData.pin && !itemData.name && "N/A"}
              </TableCell>
              <TableCell>{getDropdownLabel(voucherTypeId, 'type', itemData.type, itemData) || "N/A"}</TableCell>
              <TableCell className="text-right">{(itemData.amount || 0).toLocaleString('bn-BD', { style: 'currency', currency: 'BDT', minimumFractionDigits: 0, maximumFractionDigits: 0 })}</TableCell>
              <TableCell>{itemData.description || "N/A"}</TableCell>
              {renderAttachmentCell(itemData)}
            </TableRow>
          </TableBody>
        );
      case 'publicity-publicist-bill':
        return (
          <TableBody>
            <TableRow>
              <TableCell>{itemData.date ? format(new Date(itemData.date), "dd MMM, yyyy") : "N/A"}</TableCell>
              <TableCell>{getInstitutionName(itemData.institutionId)}</TableCell>
              <TableCell>{getBranchName(itemData.institutionId, itemData.branchId)}</TableCell>
              <TableCell>{getProgramSessionName(itemData.institutionId, itemData.programSessionId)}</TableCell>
              <TableCell>{itemData.publicityLocation || "N/A"}</TableCell>
              <TableCell>{itemData.startTime || "N/A"} - {itemData.endTime || "N/A"}</TableCell>
              <TableCell>{itemData.publicistName || "N/A"}</TableCell>
              <TableCell>{itemData.mobileNumber || "N/A"}</TableCell>
              <TableCell>{getDropdownLabel(voucherTypeId, 'shift', itemData.shift, itemData) || "N/A"}</TableCell>
              <TableCell className="text-right">{(itemData.amount || 0).toLocaleString('bn-BD', { style: 'currency', currency: 'BDT', minimumFractionDigits: 0, maximumFractionDigits: 0 })}</TableCell>
              {renderAttachmentCell(itemData)}
            </TableRow>
          </TableBody>
        );
      case 'office-supplies-stationery':
        return (
          <TableBody>
            <TableRow>
              <TableCell>{itemData.date ? format(new Date(itemData.date), "dd MMM, yyyy") : "N/A"}</TableCell>
              <TableCell>{getInstitutionName(itemData.institutionId)}</TableCell>
              <TableCell>{getBranchName(itemData.institutionId, itemData.branchId)}</TableCell>
              <TableCell>{getDropdownLabel(voucherTypeId, 'expenseTitle', itemData.expenseTitle, itemData) || "N/A"}</TableCell>
              <TableCell>{getDropdownLabel(voucherTypeId, 'itemName', itemData.itemName, itemData) || "N/A"}</TableCell>
              <TableCell>{itemData.quantityUnit?.quantity || "N/A"} {itemData.quantityUnit?.unit || ""}</TableCell>
              <TableCell className="text-right">{(itemData.amount || 0).toLocaleString('bn-BD', { style: 'currency', currency: 'BDT', minimumFractionDigits: 0, maximumFractionDigits: 0 })}</TableCell>
              <TableCell>{itemData.description || "N/A"}</TableCell>
              {renderAttachmentCell(itemData)}
            </TableRow>
          </TableBody>
        );
      case 'cleaning-supplies':
        return (
          <TableBody>
            <TableRow>
              <TableCell>{itemData.date ? format(new Date(itemData.date), "dd MMM, yyyy") : "N/A"}</TableCell>
              <TableCell>{getInstitutionName(itemData.institutionId)}</TableCell>
              <TableCell>{getBranchName(itemData.institutionId, itemData.branchId)}</TableCell>
              <TableCell>{getDropdownLabel(voucherTypeId, 'expenseTitle', itemData.expenseTitle, itemData) || "N/A"}</TableCell>
              <TableCell>{getDropdownLabel(voucherTypeId, 'itemName', itemData.itemName, itemData) || "N/A"}</TableCell>
              <TableCell>{itemData.quantityUnit?.quantity || "N/A"} {itemData.quantityUnit?.unit || ""}</TableCell>
              <TableCell className="text-right">{(itemData.amount || 0).toLocaleString('bn-BD', { style: 'currency', currency: 'BDT', minimumFractionDigits: 0, maximumFractionDigits: 0 })}</TableCell>
              <TableCell>{itemData.description || "N/A"}</TableCell>
              {renderAttachmentCell(itemData)}
            </TableRow>
          </TableBody>
        );
      case 'kitchen-household-items':
        return (
          <TableBody>
            <TableRow>
              <TableCell>{itemData.date ? format(new Date(itemData.date), "dd MMM, yyyy") : "N/A"}</TableCell>
              <TableCell>{getInstitutionName(itemData.institutionId)}</TableCell>
              <TableCell>{getBranchName(itemData.institutionId, itemData.branchId)}</TableCell>
              <TableCell>{getDropdownLabel(voucherTypeId, 'expenseTitle', itemData.expenseTitle, itemData) || "N/A"}</TableCell>
              <TableCell>{getDropdownLabel(voucherTypeId, 'itemName', itemData.itemName, itemData) || "N/A"}</TableCell>
              <TableCell>{itemData.quantityUnit?.quantity || "N/A"} {itemData.quantityUnit?.unit || ""}</TableCell>
              <TableCell className="text-right">{(itemData.amount || 0).toLocaleString('bn-BD', { style: 'currency', currency: 'BDT', minimumFractionDigits: 0, maximumFractionDigits: 0 })}</TableCell>
              <TableCell>{itemData.description || "N/A"}</TableCell>
              {renderAttachmentCell(itemData)}
            </TableRow>
          </TableBody>
        );
      case 'rental-utility':
        return (
          <TableBody>
            <TableRow>
              <TableCell>{itemData.date ? format(new Date(itemData.date), "dd MMM, yyyy") : "N/A"}</TableCell>
              <TableCell>{getInstitutionName(itemData.institutionId)}</TableCell>
              <TableCell>{getBranchName(itemData.institutionId, itemData.branchId)}</TableCell>
              <TableCell>{getDropdownLabel(voucherTypeId, 'expenseTitle', itemData.expenseTitle, itemData) || "N/A"}</TableCell>
              <TableCell>{getDropdownLabel(voucherTypeId, 'expenseCategory', itemData.expenseCategory, itemData) || "N/A"}</TableCell>
              <TableCell className="text-right">{(itemData.amount || 0).toLocaleString('bn-BD', { style: 'currency', currency: 'BDT', minimumFractionDigits: 0, maximumFractionDigits: 0 })}</TableCell>
              <TableCell>{itemData.recipientName || "N/A"}</TableCell>
              <TableCell>{itemData.monthName ? format(new Date(itemData.monthName), "MMMM yyyy") : "N/A"}</TableCell>
              <TableCell>{itemData.description || "N/A"}</TableCell>
              {renderAttachmentCell(itemData)}
            </TableRow>
          </TableBody>
        );
      case 'repair': // NEW: Repair voucher details
        return (
          <TableBody>
            <TableRow>
              <TableCell>{itemData.date ? format(new Date(itemData.date), "dd MMM, yyyy") : "N/A"}</TableCell>
              <TableCell>{getInstitutionName(itemData.institutionId)}</TableCell>
              <TableCell>{getBranchName(itemData.institutionId, itemData.branchId)}</TableCell>
              <TableCell>{getDropdownLabel(voucherTypeId, 'expenseTitle', itemData.expenseTitle, itemData) || "N/A"}</TableCell>
              <TableCell>{getDropdownLabel(voucherTypeId, 'itemName', itemData.itemName, itemData) || "N/A"}</TableCell>
              <TableCell className="text-right">{(itemData.amount || 0).toLocaleString('bn-BD', { style: 'currency', currency: 'BDT', minimumFractionDigits: 0, maximumFractionDigits: 0 })}</TableCell>
              <TableCell>{itemData.description || "N/A"}</TableCell>
              {renderAttachmentCell(itemData)}
            </TableRow>
          </TableBody>
        );
      case 'mobile-bill':
        return (
          <TableBody>
            <TableRow>
              <TableCell>{itemData.date ? format(new Date(itemData.date), "dd MMM, yyyy") : "N/A"}</TableCell>
              <TableCell>{getInstitutionName(itemData.institutionId)}</TableCell>
              <TableCell>{getBranchName(itemData.institutionId, itemData.branchId)}</TableCell>
              <TableCell className="text-right">{(itemData.amount || 0).toLocaleString('bn-BD', { style: 'currency', currency: 'BDT', minimumFractionDigits: 0, maximumFractionDigits: 0 })}</TableCell>
              <TableCell>{itemData.description || "N/A"}</TableCell>
              {renderAttachmentCell(itemData)}
            </TableRow>
          </TableBody>
        );
      case 'petty-cash-demand': // NEW: Petty Cash Demand details
        return (
          <TableBody>
            <TableRow>
              <TableCell>{getInstitutionName(itemData.institutionId)}</TableCell>
              <TableCell>{getBranchName(itemData.institutionId, itemData.branchId)}</TableCell>
              <TableCell>{itemData.dateNeeded ? format(new Date(itemData.dateNeeded), "dd MMM, yyyy") : "N/A"}</TableCell>
              <TableCell>{getDropdownLabel(voucherTypeId, 'pettyCashType', itemData.pettyCashType, itemData) || "N/A"}</TableCell>
              <TableCell className="text-right">{(itemData.requestedAmount || 0).toLocaleString('bn-BD', { style: 'currency', currency: 'BDT', minimumFractionDigits: 0, maximumFractionDigits: 0 })}</TableCell>
              <TableCell className="text-right">{(item.approvedAmount || 0).toLocaleString('bn-BD', { style: 'currency', currency: 'BDT', minimumFractionDigits: 0, maximumFractionDigits: 0 })}</TableCell>
              <TableCell>{item.expectedAdjustmentDate ? format(parseISO(item.expectedAdjustmentDate), "dd MMM, yyyy") : "N/A"}</TableCell>
              <TableCell>{itemData.description || "N/A"}</TableCell>
            </TableRow>
          </TableBody>
        );
      default:
        return (
          <TableBody>
            <TableRow>
              <TableCell colSpan={8} className="text-center text-gray-500">
                এই ভাউচারের জন্য বিস্তারিত তথ্য পাওয়া যায়নি।
              </TableCell>
            </TableRow>
          </TableBody>
        );
    }
  };

  const renderVoucherDetailsTableHeader = (voucherTypeId: string) => {
    switch (voucherTypeId) {
      case 'entertainment':
        return (
          <TableRow className="bg-green-100">
            <TableHead>তারিখ</TableHead>
            <TableHead>প্রতিষ্ঠানের নাম</TableHead>
            <TableHead>শাখার নাম</TableHead>
            <TableHead>ব্যয়ের শিরোনাম</TableHead>
            <TableHead>ব্যয়ের খাত</TableHead>
            <TableHead className="text-right">টাকার পরিমাণ</TableHead>
            <TableHead>বর্ণনা</TableHead>
            <TableHead>সংযুক্তি</TableHead>
          </TableRow>
        );
      case 'conveyance':
        return (
          <TableRow className="bg-blue-100">
            <TableHead>তারিখ</TableHead>
            <TableHead>প্রতিষ্ঠানের নাম</TableHead>
            <TableHead>শাখার নাম</TableHead>
            <TableHead>যাহার জন্য প্রযোজ্য</TableHead>
            <TableHead>পিন</TableHead>
            <TableHead>হইতে</TableHead>
            <TableHead>পর্যন্ত</TableHead>
            <TableHead>বাহনের নাম</TableHead>
            <TableHead className="text-right">টাকার পরিমাণ</TableHead>
            <TableHead>উদ্দেশ্য</TableHead>
            <TableHead>সংযুক্তি</TableHead>
          </TableRow>
        );
      case 'publicity-conveyance':
        return (
          <TableRow className="bg-blue-100">
            <TableHead>তারিখ</TableHead>
            <TableHead>প্রতিষ্ঠানের নাম</TableHead>
            <TableHead>শাখার নাম</TableHead>
            <TableHead>প্রোগ্রাম ও সেশন</TableHead>
            <TableHead>প্রচারণার স্থান</TableHead>
            <TableHead>সময়কাল</TableHead>
            <TableHead>হইতে</TableHead>
            <TableHead>পর্যন্ত</TableHead>
            <TableHead>বাহনের নাম</TableHead>
            <TableHead>ব্যক্তির সংখ্যা</TableHead>
            <TableHead className="text-right">টাকার পরিমাণ</TableHead>
            <TableHead>বর্ণনা</TableHead>
            <TableHead>সংযুক্তি</TableHead>
          </TableRow>
        );
      case 'publicity-entertainment':
        return (
          <TableRow className="bg-green-100">
            <TableHead>তারিখ</TableHead>
            <TableHead>প্রতিষ্ঠানের নাম</TableHead>
            <TableHead>শাখার নাম</TableHead>
            <TableHead>প্রোগ্রাম ও সেশন</TableHead>
            <TableHead>প্রচারণার স্থান</TableHead>
            <TableHead>সময়কাল</TableHead>
            <TableHead>যাহার জন্য প্রযোজ্য</TableHead>
            <TableHead>ব্যক্তি/পিন</TableHead>
            <TableHead>ধরণ</TableHead>
            <TableHead className="text-right">টাকার পরিমাণ</TableHead>
            <TableHead>বর্ণনা</TableHead>
            <TableHead>সংযুক্তি</TableHead>
          </TableRow>
        );
      case 'publicity-publicist-bill':
        return (
          <TableRow className="bg-orange-100">
            <TableHead>তারিখ</TableHead>
            <TableHead>প্রতিষ্ঠানের নাম</TableHead>
            <TableHead>শাখার নাম</TableHead>
            <TableHead>প্রোগ্রাম ও সেশন</TableHead>
            <TableHead>প্রচারণার স্থান</TableHead>
            <TableHead>সময়কাল</TableHead>
            <TableHead>প্রচারণাকরীর নাম</TableHead>
            <TableHead>মোবাইল নম্বর</TableHead>
            <TableHead>সিফট</TableHead>
            <TableHead className="text-right">টাকার পরিমাণ</TableHead>
            <TableHead>সংযুক্তি</TableHead>
          </TableRow>
        );
      case 'office-supplies-stationery':
        return (
          <TableRow className="bg-purple-100">
            <TableHead>তারিখ</TableHead>
            <TableHead>প্রতিষ্ঠানের নাম</TableHead>
            <TableHead>শাখার নাম</TableHead>
            <TableHead>ব্যয়ের শিরোনাম</TableHead>
            <TableHead>আইটেমের নাম</TableHead>
            <TableHead>সংখ্যা</TableHead>
            <TableHead className="text-right">টাকার পরিমাণ</TableHead>
            <TableHead>বর্ণনা</TableHead>
            <TableHead>সংযুক্তি</TableHead>
          </TableRow>
        );
      case 'cleaning-supplies':
        return (
          <TableRow className="bg-pink-100">
            <TableHead>তারিখ</TableHead>
            <TableHead>প্রতিষ্ঠানের নাম</TableHead>
            <TableHead>শাখার নাম</TableHead>
            <TableHead>ব্যয়ের শিরোনাম</TableHead>
            <TableHead>আইটেমের নাম</TableHead>
            <TableHead>সংখ্যা</TableHead>
            <TableHead className="text-right">টাকার পরিমাণ</TableHead>
            <TableHead>বর্ণনা</TableHead>
            <TableHead>সংযুক্তি</TableHead>
          </TableRow>
        );
      case 'kitchen-household-items':
        return (
          <TableRow className="bg-yellow-100">
            <TableHead>তারিখ</TableHead>
            <TableHead>প্রতিষ্ঠানের নাম</TableHead>
            <TableHead>শাখার নাম</TableHead>
            <TableHead>ব্যয়ের শিরোনাম</TableHead>
            <TableHead>আইটেমের নাম</TableHead>
            <TableHead>সংখ্যা</TableHead>
            <TableHead className="text-right">টাকার পরিমাণ</TableHead>
            <TableHead>বর্ণনা</TableHead>
            <TableHead>সংযুক্তি</TableHead>
          </TableRow>
        );
      case 'rental-utility':
        return (
          <TableRow className="bg-red-100">
            <TableHead>তারিখ</TableHead>
            <TableHead>প্রতিষ্ঠানের নাম</TableHead>
            <TableHead>শাখার নাম</TableHead>
            <TableHead>ব্যয়ের শিরোনাম</TableHead>
            <TableHead>ব্যয়ের খাত</TableHead>
            <TableHead className="text-right">টাকার পরিমাণ</TableHead>
            <TableHead>গ্রহিতার নাম</TableHead>
            <TableHead>মাসের নাম</TableHead>
            <TableHead>বর্ণনা</TableHead>
            <TableHead>সংযুক্তি</TableHead>
          </TableRow>
        );
      case 'repair': // NEW: Repair voucher table header
        return (
          <TableRow className="bg-teal-100">
            <TableHead>তারিখ</TableHead>
            <TableHead>প্রতিষ্ঠানের নাম</TableHead>
            <TableHead>শাখার নাম</TableHead>
            <TableHead>ব্যয়ের শিরোনাম</TableHead>
            <TableHead>আইটেমের নাম</TableHead>
            <TableHead className="text-right">টাকার পরিমাণ</TableHead>
            <TableHead>বর্ণনা</TableHead>
            <TableHead>সংযুক্তি</TableHead>
          </TableRow>
        );
      case 'mobile-bill':
        return (
          <TableRow className="bg-gray-100">
            <TableHead>তারিখ</TableHead>
            <TableHead>প্রতিষ্ঠানের নাম</TableHead>
            <TableHead>শাখার নাম</TableHead>
            <TableHead className="text-right">টাকার পরিমাণ</TableHead>
            <TableHead>বর্ণনা</TableHead>
            <TableHead>সংযুক্তি</TableHead>
          </TableRow>
        );
      case 'petty-cash-demand': // NEW: Petty Cash Demand table header
        return (
          <TableRow className="bg-gray-100">
            <TableHead>প্রতিষ্ঠানের নাম</TableHead>
            <TableHead>প্রদেয় শাখা</TableHead>
            <TableHead>কত তারিখে প্রয়োজন</TableHead>
            <TableHead>পেটি ক্যাশের ধরন</TableHead>
            <TableHead className="text-right">চাহিদাকৃত টাকার পরিমান</TableHead>
            <TableHead className="text-right">অনুমোদিত টাকার পরিমান</TableHead>
            <TableHead>সম্ভাব্য সমন্বয়ের তারিখ</TableHead>
            <TableHead>বর্ণনা</TableHead>
          </TableRow>
        );
      default:
        return (
          <TableRow className="bg-gray-100">
            <TableHead>বিস্তারিত তথ্য</TableHead>
          </TableRow>
        );
    }
  };

  const getTableColSpan = (voucherTypeId: string) => {
    switch (voucherTypeId) {
      case 'entertainment': return 8;
      case 'conveyance': return 11;
      case 'publicity-conveyance': return 13;
      case 'publicity-entertainment': return 12;
      case 'publicity-publicist-bill': return 11;
      case 'office-supplies-stationery': return 9;
      case 'cleaning-supplies': return 9;
      case 'kitchen-household-items': return 9;
      case 'rental-utility': return 10;
      case 'repair': return 8; // NEW: Colspan for repair
      case 'mobile-bill': return 6;
      case 'petty-cash-demand': return 8; // NEW: Colspan for petty-cash-demand
      default: return 1;
    }
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[90vw] max-w-[95vw] p-6 max-h-[90vh] overflow-y-auto">
          <DialogHeader className="text-center mb-4">
            <DialogTitle className="text-2xl font-bold text-blue-700">
              {getVoucherHeadingById(voucher.voucherTypeId)}
              {voucher.originalVoucherId && (
                <span className="ml-2 text-sm text-purple-600">
                  ({getCorrectionText(voucher.correctionCount)})
                </span>
              )}
              {voucher.originalVoucherId && (
                <span
                  className="ml-2 text-sm text-purple-600 cursor-pointer hover:underline"
                  onClick={handleViewOriginalVoucher}
                >
                  (প্রথম জমা দেওয়া ভাউচার দেখুন)
                </span>
              )}
            </DialogTitle>
            <p className="text-sm text-gray-600">
              জমাদানের তারিখ: {format(parseISO(voucher.createdAt), "dd MMM, yyyy")} | ভাউচার নম্বর: {voucher.voucherNumber}
            </p>
            <p className="text-sm text-gray-600">
              ইউজারের নাম: {voucher.submittedByName} (PIN: {voucher.submittedByPin}) | মোবাইল নম্বর: {voucher.submittedByMobile}
            </p>
          </DialogHeader>

          <div className="overflow-x-auto border rounded-md">
            <Table>
              <TableHeader>
                {renderVoucherDetailsTableHeader(voucher.voucherTypeId)}
              </TableHeader>
              {renderVoucherDetailsTable(voucher)}
              <TableFooter>
                <TableRow className="bg-gray-50 font-bold">
                  <TableCell colSpan={getTableColSpan(voucher.voucherTypeId) - 1}>মোট</TableCell>
                  <TableCell className="text-right">{(voucher.data.amount || voucher.data.requestedAmount || 0).toLocaleString('bn-BD', { style: 'currency', currency: 'BDT', minimumFractionDigits: 0, maximumFractionDigits: 0 })}</TableCell>
                </TableRow>
              </TableFooter>
            </Table>
          </div>

          <DialogFooter className="flex flex-col sm:flex-row sm:justify-center gap-4 mt-6">
            <Button className="bg-green-600 hover:bg-green-700 text-white" onClick={handleApprove}>
              অনুমোদিত
            </Button>
            <Button className="bg-blue-600 hover:bg-blue-700 text-white" onClick={handleSendBack}>
              ফেরত পাঠান
            </Button>
            <Button variant="destructive" onClick={handleReject}>
              বাতিল করুন
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Comment Dialog for Send Back / Reject */}
      <Dialog open={isCommentDialogOpen} onOpenChange={setIsCommentDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{commentType === 'send_back' ? "কেন ফেরত পাঠাতে চান?" : "কেন বাতিল করতে চান?"}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <Label htmlFor="comment" className="sr-only">
              মন্তব্য
            </Label>
            <Textarea
              id="comment"
              placeholder="আপনার মন্তব্য লিখুন..."
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              className="col-span-3"
            />
          </div>
          <DialogFooter>
            <Button type="submit" onClick={handleCommentConfirm} disabled={!comment.trim()}>
              কনফার্ম
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Attachment Viewer Popup */}
      {isAttachmentPopupOpen && (
        <AttachmentViewerPopup
          isOpen={isAttachmentPopupOpen}
          onOpenChange={setIsAttachmentPopupOpen}
          filename={attachmentToView}
        />
      )}

      {/* Original Voucher Details Popup */}
      {isOriginalVoucherPopupOpen && originalVoucher && (
        <VoucherDetailsPopup
          isOpen={isOriginalVoucherPopupOpen}
          onOpenChange={setIsOriginalVoucherPopupOpen}
          voucher={originalVoucher}
        />
      )}
    </>
  );
};

export default VoucherDetailsPopup;