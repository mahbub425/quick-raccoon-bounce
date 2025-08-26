import React, { useMemo, useState } from "react";
import { useSubmittedVouchers } from "@/context/SubmittedVouchersContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { format, parseISO } from "date-fns";
import { DUMMY_INSTITUTIONS, DUMMY_PINS, DUMMY_PROGRAM_SESSIONS, DUMMY_VOUCHER_TYPES, OFFICE_SUPPLIES_ITEM_OPTIONS, CLEANING_SUPPLIES_ITEM_OPTIONS, KITCHEN_HOUSEHOLD_ITEM_OPTIONS, REPAIR_ITEM_OPTIONS } from "@/data/dummyData";
import { SubmittedVoucher } from "@/types";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import DynamicVoucherForm from "@/components/forms/DynamicVoucherForm";
import { useCart } from "@/context/CartContext";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext"; // Import useAuth
import AttachmentViewerPopup from "@/components/AttachmentViewerPopup"; // Import the new component
import { generateUniquePettyCashCode } from "@/utils/pettyCashUtils"; // Import utility for code generation

const Dashboard = () => {
  const { submittedVouchers, updateSubmittedVoucherStatus, markVoucherAsCorrected, addSubmittedVouchers, updatePettyCashCode } = useSubmittedVouchers();
  const { user } = useAuth(); // Get current user
  const { addToCart } = useCart(); // Use addToCart for new submission
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingVoucher, setEditingVoucher] = useState<SubmittedVoucher | null>(null);
  const [isAttachmentPopupOpen, setIsAttachmentPopupOpen] = useState(false); // State for attachment popup
  const [attachmentToView, setAttachmentToView] = useState(""); // State for filename to view

  const userSpecificVouchers = useMemo(() => {
    if (!user) return [];
    // Filter out vouchers that have been corrected by the user, unless they are the latest version
    return submittedVouchers.filter(v => v.submittedByPin === user.pin && v.status !== 'corrected_by_user');
  }, [submittedVouchers, user]);

  const sentBackVouchers = useMemo(() => userSpecificVouchers.filter(v => v.status === 'sent_back'), [userSpecificVouchers]);
  const rejectedVouchers = useMemo(() => userSpecificVouchers.filter(v => v.status === 'rejected'), [userSpecificVouchers]);
  const approvedPettyCashVouchers = useMemo(() => userSpecificVouchers.filter(v => v.voucherTypeId === 'petty-cash-demand' && v.status === 'approved'), [userSpecificVouchers]);

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
  const getVoucherHeadingById = (id: string) => {
    const voucherType = DUMMY_VOUCHER_TYPES.flatMap(v => v.type === 'multi' && v.subTypes ? [v, ...v.subTypes] : [v]).find(v => v.id === id);
    return voucherType?.heading || id;
  };
  const getPettyCashTypeLabel = (typeValue: string) => {
    const pettyCashVoucher = DUMMY_VOUCHER_TYPES.find(v => v.id === 'petty-cash-demand');
    const pettyCashTypeField = pettyCashVoucher?.formFields?.find(f => f.name === 'pettyCashType');
    return pettyCashTypeField?.options?.find(opt => opt.value === typeValue)?.label || typeValue;
  };

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
    } else if (fieldName === "expenseCategory" && voucherTypeId === "entertainment" && itemData.expenseTitle) {
      const expenseTitleField = voucherTypeDetails.formFields.find(f => f.name === 'expenseTitle');
      const matchingConditionalField = expenseTitleField?.conditionalFields?.find(cf => cf.value === itemData.expenseTitle);
      const expenseCategoryField = matchingConditionalField?.fields.find(f => f.name === 'expenseCategory');
      options = expenseCategoryField?.options || [];
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
      options = field.options || [];
    }

    return options.find(opt => opt.value === fieldValue)?.label || fieldValue;
  };

  const handleEditSentBackVoucher = (voucher: SubmittedVoucher) => {
    setEditingVoucher(voucher);
    setIsEditDialogOpen(true);
  };

  const handleResubmitVoucher = (updatedData: any) => {
    if (editingVoucher) {
      // 1. Mark the original voucher as 'corrected_by_user'
      markVoucherAsCorrected(editingVoucher.id);

      // 2. Create a new CartItem structure for the resubmission
      const newCartItem = {
        voucherTypeId: editingVoucher.voucherTypeId,
        voucherHeading: editingVoucher.voucherHeading,
        data: updatedData,
        voucherNumber: editingVoucher.voucherNumber, // Keep the same voucher number
        originalVoucherId: editingVoucher.id, // Link to the original voucher
        correctionCount: (editingVoucher.correctionCount || 0) + 1, // Increment correction count
      };

      // 3. Add the new voucher to submittedVouchers
      addSubmittedVouchers([newCartItem]);
      
      toast.success("ভাউচার সফলভাবে পুনরায় সাবমিট করা হয়েছে!");
      setIsEditDialogOpen(false);
      setEditingVoucher(null);
    }
  };

  const handleViewAttachment = (filename: string) => {
    setAttachmentToView(filename);
    setIsAttachmentPopupOpen(true);
  };

  const handleGeneratePettyCashCode = (voucherId: string) => {
    const code = generateUniquePettyCashCode();
    updatePettyCashCode(voucherId, code);
    toast.success(`গোপন কোড তৈরি হয়েছে: ${code}`);
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

  const renderVoucherRow = (voucher: SubmittedVoucher, index: number, isEditable: boolean) => (
    <TableRow key={voucher.id}>
      <TableCell className="font-medium">{index + 1}</TableCell>
      <TableCell>{voucher.voucherNumber}</TableCell>
      <TableCell>{format(parseISO(voucher.createdAt), "dd MMM, yyyy")}</TableCell>
      <TableCell>{getVoucherHeadingById(voucher.voucherTypeId)}</TableCell>
      <TableCell>{getInstitutionName(voucher.data.institutionId)}</TableCell>
      <TableCell>{getBranchName(voucher.data.institutionId, voucher.data.branchId)}</TableCell>
      <TableCell className="text-right">{(voucher.data.amount || voucher.data.requestedAmount || 0).toLocaleString('bn-BD', { style: 'currency', currency: 'BDT' })}</TableCell> {/* Adjusted for requestedAmount */}
      <TableCell>{voucher.comment || "N/A"}</TableCell>
      {voucher.voucherTypeId !== 'petty-cash-demand' && renderAttachmentCell(voucher.data)} {/* Only render attachment if not petty-cash-demand */}
      <TableCell className="text-center">
        {isEditable ? (
          <Button variant="outline" size="sm" onClick={() => handleEditSentBackVoucher(voucher)}>
            এডিট করুন
          </Button>
        ) : (
          <Button variant="secondary" size="sm" disabled>
            দেখুন
          </Button>
        )}
      </TableCell>
    </TableRow>
  );

  return (
    <div className="min-h-[calc(100vh-80px)] bg-gradient-to-br from-gray-50 to-slate-50 p-6">
      <h1 className="text-4xl font-extrabold text-center text-gray-800 mb-8">
        ড্যাশবোর্ড
      </h1>

      {/* Approved Petty Cash List */}
      {approvedPettyCashVouchers.length > 0 && (
        <Card className="shadow-lg border-green-300 mb-8 max-w-7xl mx-auto">
          <CardHeader className="bg-green-100 rounded-t-lg p-4">
            <CardTitle className="text-2xl font-bold text-green-700">অনুমোদিত পেটিক্যাশ তালিকা</CardTitle>
            <CardDescription className="text-green-600">আপনার অনুমোদিত পেটি ক্যাশ চাহিদাপত্রগুলো এখানে দেখুন।</CardDescription>
          </CardHeader>
          <CardContent className="p-4">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-green-50">
                    <TableHead className="w-[50px]">ক্রমিক</TableHead>
                    <TableHead>পেটিক্যাশ চাহিদাপত্র নাম্বার</TableHead>
                    <TableHead>প্রতিষ্ঠানের নাম</TableHead>
                    <TableHead>প্রদেয় শাখা</TableHead>
                    <TableHead>কত তারিখে প্রয়োজন</TableHead>
                    <TableHead>পেটি ক্যাশের ধরন</TableHead>
                    <TableHead>বর্ণনা</TableHead>
                    <TableHead className="text-right">অনুমোদিত টাকার পরিমান</TableHead>
                    <TableHead>সম্ভাব্য সমন্বয়ের তারিখ</TableHead>
                    <TableHead className="text-center">অ্যাকশন</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {approvedPettyCashVouchers.map((voucher, index) => (
                    <TableRow key={voucher.id}>
                      <TableCell className="font-medium">{index + 1}</TableCell>
                      <TableCell>{voucher.voucherNumber}</TableCell>
                      <TableCell>{getInstitutionName(voucher.data.institutionId)}</TableCell>
                      <TableCell>{getBranchName(voucher.data.institutionId, voucher.data.branchId)}</TableCell>
                      <TableCell>{voucher.data.dateNeeded ? format(new Date(voucher.data.dateNeeded), "dd MMM, yyyy") : "N/A"}</TableCell>
                      <TableCell>{getPettyCashTypeLabel(voucher.data.pettyCashType)}</TableCell>
                      <TableCell>{voucher.data.description || "N/A"}</TableCell>
                      <TableCell className="text-right">{(voucher.approvedAmount || 0).toLocaleString('bn-BD', { style: 'currency', currency: 'BDT', minimumFractionDigits: 0, maximumFractionDigits: 0 })}</TableCell>
                      <TableCell>{voucher.expectedAdjustmentDate ? format(parseISO(voucher.expectedAdjustmentDate), "dd MMM, yyyy") : "N/A"}</TableCell>
                      <TableCell className="text-center">
                        {voucher.isCodeGenerated ? (
                          <span className="font-bold text-green-700">{voucher.pettyCashUniqueCode}</span>
                        ) : (
                          <Button
                            variant="default"
                            size="sm"
                            onClick={() => handleGeneratePettyCashCode(voucher.id)}
                            className="bg-blue-600 hover:bg-blue-700 text-white"
                          >
                            টাকা উত্তলনের জন্য গোপন কোড তৈরি করুন
                          </Button>
                        )}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}

      {sentBackVouchers.length === 0 && rejectedVouchers.length === 0 && approvedPettyCashVouchers.length === 0 ? (
        <div className="text-center text-xl text-gray-600 p-8 bg-white rounded-lg shadow-inner border border-gray-200">
          কোনো ফেরত পাঠানো, বাতিল করা বা অনুমোদিত ভাউচার নেই।
        </div>
      ) : (
        <div className="space-y-8 max-w-7xl mx-auto">
          {/* Sent Back Vouchers */}
          {sentBackVouchers.length > 0 && (
            <Card className="shadow-lg border-blue-300">
              <CardHeader className="bg-blue-100 rounded-t-lg p-4">
                <CardTitle className="text-2xl font-bold text-blue-700">ফেরত পাঠানো ভাউচার</CardTitle>
                <CardDescription className="text-blue-600">সংশোধনের জন্য ফেরত পাঠানো ভাউচারগুলো এখানে দেখুন।</CardDescription>
              </CardHeader>
              <CardContent className="p-4">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-blue-50">
                        <TableHead className="w-[50px]">ক্রমিক</TableHead>
                        <TableHead>ভাউচার নাম্বার</TableHead>
                        <TableHead>জমাদানের তারিখ</TableHead>
                        <TableHead>ভাউচারের ধরন</TableHead>
                        <TableHead>প্রতিষ্ঠানের নাম</TableHead>
                        <TableHead>শাখার নাম</TableHead>
                        <TableHead className="text-right">টাকার পরিমাণ</TableHead>
                        <TableHead>মন্তব্য</TableHead>
                        <TableHead>সংযুক্তি</TableHead> {/* Added attachment header */}
                        <TableHead className="text-center">অ্যাকশন</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {sentBackVouchers.map((voucher, index) => renderVoucherRow(voucher, index, true))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Rejected Vouchers */}
          {rejectedVouchers.length > 0 && (
            <Card className="shadow-lg border-red-300">
              <CardHeader className="bg-red-100 rounded-t-lg p-4">
                <CardTitle className="text-2xl font-bold text-red-700">বাতিল করা ভাউচার</CardTitle>
                <CardDescription className="text-red-600">বাতিল করা ভাউচারগুলো এখানে দেখুন।</CardDescription>
              </CardHeader>
              <CardContent className="p-4">
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-red-50">
                        <TableHead className="w-[50px]">ক্রমিক</TableHead>
                        <TableHead>ভাউচার নাম্বার</TableHead>
                        <TableHead>জমাদানের তারিখ</TableHead>
                        <TableHead>ভাউচারের ধরন</TableHead>
                        <TableHead>প্রতিষ্ঠানের নাম</TableHead>
                        <TableHead>শাখার নাম</TableHead>
                        <TableHead className="text-right">টাকার পরিমাণ</TableHead>
                        <TableHead>মন্তব্য</TableHead>
                        <TableHead>সংযুক্তি</TableHead> {/* Added attachment header */}
                        <TableHead className="text-center">অ্যাকশন</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {rejectedVouchers.map((voucher, index) => renderVoucherRow(voucher, index, false))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* Edit Dialog for Sent Back Vouchers */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[700px] p-6 max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-blue-700">ভাউচার এডিট করুন</DialogTitle>
          </DialogHeader>
          {editingVoucher && (
            <DynamicVoucherForm
              voucherTypeId={editingVoucher.voucherTypeId}
              initialData={editingVoucher.data}
              onFormSubmit={handleResubmitVoucher}
            />
          )}
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
    </div>
  );
};

export default Dashboard;