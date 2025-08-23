import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "sonner";
import { useCart } from "@/context/CartContext";
import { useSubmittedVouchers } from "@/context/SubmittedVouchersContext";
import { CartItem } from "@/types";
import { DUMMY_INSTITUTIONS, DUMMY_PINS, DUMMY_PROGRAM_SESSIONS } from "@/data/dummyData";
import { format } from "date-fns";
import { useAuth } from "@/context/AuthContext";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import DynamicVoucherForm from "@/components/forms/DynamicVoucherForm";
import { useNavigate } from "react-router-dom";

const Cart = () => {
  const { cartItems, removeFromCart, updateCartItem, clearCart } = useCart();
  const { addSubmittedVouchers } = useSubmittedVouchers();
  const { user } = useAuth();
  const [editingItem, setEditingItem] = useState<CartItem | null>(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const navigate = useNavigate();

  const entertainmentVouchers = cartItems.filter(item => item.voucherTypeId === 'entertainment');
  const conveyanceVouchers = cartItems.filter(item => item.voucherTypeId === 'conveyance');
  const publicityConveyanceVouchers = cartItems.filter(item => item.voucherTypeId === 'publicity-conveyance');
  const publicityEntertainmentVouchers = cartItems.filter(item => item.voucherTypeId === 'publicity-entertainment');
  const publicityPublicistBillVouchers = cartItems.filter(item => item.voucherTypeId === 'publicity-publicist-bill');
  const rentalUtilityVouchers = cartItems.filter(item => item.voucherTypeId === 'rental-utility');
  const mobileBillVouchers = cartItems.filter(item => item.voucherTypeId === 'mobile-bill');
  const repairVouchers = cartItems.filter(item => item.voucherTypeId === 'repair');
  const pettyCashVouchers = cartItems.filter(item => item.voucherTypeId === 'petty-cash');
  const officeSuppliesStationeryVouchers = cartItems.filter(item => item.voucherTypeId === 'office-supplies-stationery');


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

  const handleEdit = (item: CartItem) => {
    setEditingItem(item);
    setIsEditDialogOpen(true);
  };

  const handleUpdateVoucher = (updatedData: any) => {
    if (editingItem) {
      updateCartItem(editingItem.id, updatedData);
      setIsEditDialogOpen(false);
      setEditingItem(null);
    }
  };

  const handleSubmitAllVouchers = () => {
    if (cartItems.length === 0) {
      toast.error("কার্টে কোনো ভাউচার নেই সাবমিট করার জন্য।");
      return;
    }
    // Forward all cart items to the submitted vouchers context
    addSubmittedVouchers(cartItems);
    clearCart(); // Clear the cart after submission
    toast.success("আপনার ভাউচার সফলভাবে সাবমিট হয়েছে!"); // Updated success message
    // Removed: navigate("/mentor-approval"); // No longer navigate to mentor approval page
  };

  const renderEntertainmentTable = (items: CartItem[]) => {
    if (items.length === 0) {
      return (
        <TableRow>
          <TableCell colSpan={10} className="text-center text-gray-500">
            কোনো এন্টারটেইনমেন্ট ভাউচার নেই।
          </TableCell>
        </TableRow>
      );
    }

    return items.map((item, index) => (
      <TableRow key={item.id}>
        <TableCell className="font-medium">{index + 1}</TableCell>
        <TableCell>{item.data.date ? format(new Date(item.data.date), "dd MMM, yyyy") : "N/A"}</TableCell>
        <TableCell>{getInstitutionName(item.data.institutionId)}</TableCell>
        <TableCell>{getBranchName(item.data.institutionId, item.data.branchId)}</TableCell>
        <TableCell>{item.data.expenseTitle || "N/A"}</TableCell>
        <TableCell>
          {item.data.expenseCategory || "N/A"}
          {item.data.guestName && ` (অতিথি: ${item.data.guestName})`}
          {item.data.studentName && ` (শিক্ষার্থী: ${item.data.studentName})`}
          {item.data.guardianName && ` (অভিভাবক: ${item.data.guardianName})`}
          {item.data.selectedPins && item.data.selectedPins.length > 0 && ` (পিন: ${getPinNames(item.data.selectedPins)})`}
          {item.data.quantityUnit?.quantity && item.data.quantityUnit?.unit && ` (${item.data.quantityUnit.quantity} ${item.data.quantityUnit.unit})`}
        </TableCell>
        <TableCell className="text-right">{item.data.amount || 0}</TableCell>
        <TableCell>{item.data.description || "N/A"}</TableCell>
        <TableCell>{item.data.attachment ? "আছে" : "নেই"}</TableCell>
        <TableCell className="flex justify-center space-x-2">
          <Button variant="outline" size="sm" onClick={() => handleEdit(item)}>এডিট</Button>
          <Button variant="destructive" size="sm" onClick={() => removeFromCart(item.id)}>মুছে ফেলুন</Button>
        </TableCell>
      </TableRow>
    ));
  };

  const renderConveyanceTable = (items: CartItem[]) => {
    if (items.length === 0) {
      return (
        <TableRow>
          <TableCell colSpan={12} className="text-center text-gray-500">
            কোনো কনভেয়েন্স ভাউচার নেই।
          </TableCell>
        </TableRow>
      );
    }

    return items.map((item, index) => (
      <TableRow key={item.id}>
        <TableCell className="font-medium">{index + 1}</TableCell>
        <TableCell>{item.data.date ? format(new Date(item.data.date), "dd MMM, yyyy") : "N/A"}</TableCell>
        <TableCell>{getInstitutionName(item.data.institutionId)}</TableCell>
        <TableCell>{getBranchName(item.data.institutionId, item.data.branchId)}</TableCell>
        <TableCell>{item.data.applicableFor || "N/A"}</TableCell>
        <TableCell>
          {item.data.applicableFor === 'Myself' ? (user?.pin || 'N/A') :
           (item.data.teacherPins && item.data.teacherPins.length > 0 && `(শিক্ষক পিন: ${getPinNames(item.data.teacherPins)})`) ||
           (item.data.otherPins && item.data.otherPins.length > 0 && `(অন্যান্য পিন: ${getPinNames(item.data.otherPins)})`) || "N/A"}
        </TableCell>
        <TableCell>{item.data.from || "N/A"}</TableCell>
        <TableCell>{item.data.to || "N/A"}</TableCell>
        <TableCell>
          {item.data.vehicleName || "N/A"}
          {item.data.specialApproverPin && ` (অনুমোদনকারী পিন: ${item.data.specialApproverPin})`}
        </TableCell>
        <TableCell className="text-right">{item.data.amount || 0}</TableCell>
        <TableCell>{item.data.purpose || "N/A"}</TableCell>
        <TableCell>{item.data.attachment ? "আছে" : "নেই"}</TableCell>
        <TableCell className="flex justify-center space-x-2">
          <Button variant="outline" size="sm" onClick={() => handleEdit(item)}>এডিট</Button>
          <Button variant="destructive" size="sm" onClick={() => removeFromCart(item.id)}>মুছে ফেলুন</Button>
        </TableCell>
      </TableRow>
    ));
  };

  const renderPublicityConveyanceTable = (items: CartItem[]) => {
    if (items.length === 0) {
      return (
        <TableRow>
          <TableCell colSpan={15} className="text-center text-gray-500">
            কোনো প্রচারণা (কনভেয়েন্স) ভাউচার নেই।
          </TableCell>
        </TableRow>
      );
    }

    return items.map((item, index) => (
      <TableRow key={item.id}>
        <TableCell className="font-medium">{index + 1}</TableCell>
        <TableCell>{item.data.date ? format(new Date(item.data.date), "dd MMM, yyyy") : "N/A"}</TableCell>
        <TableCell>{getInstitutionName(item.data.institutionId)}</TableCell>
        <TableCell>{getBranchName(item.data.institutionId, item.data.branchId)}</TableCell>
        <TableCell>{getProgramSessionName(item.data.institutionId, item.data.programSessionId)}</TableCell>
        <TableCell>{item.data.publicityLocation || "N/A"}</TableCell>
        <TableCell>{item.data.startTime || "N/A"} - {item.data.endTime || "N/A"}</TableCell>
        <TableCell>{item.data.from || "N/A"}</TableCell>
        <TableCell>{item.data.to || "N/A"}</TableCell>
        <TableCell>
          {item.data.vehicleName || "N/A"}
          {item.data.specialApproverPin && ` (অনুমোদনকারী পিন: ${item.data.specialApproverPin})`}
        </TableCell>
        <TableCell>{item.data.numberOfPersons || 0}</TableCell>
        <TableCell className="text-right">{item.data.amount || 0}</TableCell>
        <TableCell>{item.data.description || "N/A"}</TableCell>
        <TableCell>{item.data.attachment ? "আছে" : "নেই"}</TableCell>
        <TableCell className="flex justify-center space-x-2">
          <Button variant="outline" size="sm" onClick={() => handleEdit(item)}>এডিট</Button>
          <Button variant="destructive" size="sm" onClick={() => removeFromCart(item.id)}>মুছে ফেলুন</Button>
        </TableCell>
      </TableRow>
    ));
  };

  const renderPublicityEntertainmentTable = (items: CartItem[]) => {
    if (items.length === 0) {
      return (
        <TableRow>
          <TableCell colSpan={14} className="text-center text-gray-500">
            কোনো প্রচারণা (এন্টারটেইনমেন্ট) ভাউচার নেই।
          </TableCell>
        </TableRow>
      );
    }

    return items.map((item, index) => (
      <TableRow key={item.id}>
        <TableCell className="font-medium">{index + 1}</TableCell>
        <TableCell>{item.data.date ? format(new Date(item.data.date), "dd MMM, yyyy") : "N/A"}</TableCell>
        <TableCell>{getInstitutionName(item.data.institutionId)}</TableCell>
        <TableCell>{getBranchName(item.data.institutionId, item.data.branchId)}</TableCell>
        <TableCell>{getProgramSessionName(item.data.institutionId, item.data.programSessionId)}</TableCell>
        <TableCell>{item.data.publicityLocation || "N/A"}</TableCell>
        <TableCell>{item.data.startTime || "N/A"} - {item.data.endTime || "N/A"}</TableCell>
        <TableCell>{item.data.applicableFor || "N/A"}</TableCell>
        <TableCell>
          {item.data.pin && `(পিন: ${getPinNames([item.data.pin])})`}
          {item.data.name && `(নাম: ${item.data.name})`}
          {!item.data.pin && !item.data.name && "N/A"}
        </TableCell>
        <TableCell>{item.data.type || "N/A"}</TableCell>
        <TableCell className="text-right">{item.data.amount || 0}</TableCell>
        <TableCell>{item.data.description || "N/A"}</TableCell>
        <TableCell>{item.data.attachment ? "আছে" : "নেই"}</TableCell>
        <TableCell className="flex justify-center space-x-2">
          <Button variant="outline" size="sm" onClick={() => handleEdit(item)}>এডিট</Button>
          <Button variant="destructive" size="sm" onClick={() => removeFromCart(item.id)}>মুছে ফেলুন</Button>
        </TableCell>
      </TableRow>
    ));
  };

  const renderPublicityPublicistBillTable = (items: CartItem[]) => {
    if (items.length === 0) {
      return (
        <TableRow>
          <TableCell colSpan={13} className="text-center text-gray-500">
            কোনো প্রচারণা (প্রচারণাকারীর বিল) ভাউচার নেই।
          </TableCell>
        </TableRow>
      );
    }

    return items.map((item, index) => (
      <TableRow key={item.id}>
        <TableCell className="font-medium">{index + 1}</TableCell>
        <TableCell>{item.data.date ? format(new Date(item.data.date), "dd MMM, yyyy") : "N/A"}</TableCell>
        <TableCell>{getInstitutionName(item.data.institutionId)}</TableCell>
        <TableCell>{getBranchName(item.data.institutionId, item.data.branchId)}</TableCell>
        <TableCell>{getProgramSessionName(item.data.institutionId, item.data.programSessionId)}</TableCell>
        <TableCell>{item.data.publicityLocation || "N/A"}</TableCell>
        <TableCell>{item.data.startTime || "N/A"} - {item.data.endTime || "N/A"}</TableCell>
        <TableCell>{item.data.publicistName || "N/A"}</TableCell>
        <TableCell>{item.data.mobileNumber || "N/A"}</TableCell>
        <TableCell>{item.data.shift || "N/A"}</TableCell>
        <TableCell className="text-right">{item.data.amount || 0}</TableCell>
        <TableCell>{item.data.attachment ? "আছে" : "নেই"}</TableCell>
        <TableCell className="flex justify-center space-x-2">
          <Button variant="outline" size="sm" onClick={() => handleEdit(item)}>এডিট</Button>
          <Button variant="destructive" size="sm" onClick={() => removeFromCart(item.id)}>মুছে ফেলুন</Button>
        </TableCell>
      </TableRow>
    ));
  };

  const renderOfficeSuppliesStationeryTable = (items: CartItem[]) => {
    if (items.length === 0) {
      return (
        <TableRow>
          <TableCell colSpan={10} className="text-center text-gray-500">
            কোনো অফিস সাপ্লাইস ও স্টেশনারি ভাউচার নেই।
          </TableCell>
        </TableRow>
      );
    }

    return items.map((item, index) => (
      <TableRow key={item.id}>
        <TableCell className="font-medium">{index + 1}</TableCell>
        <TableCell>{item.data.date ? format(new Date(item.data.date), "dd MMM, yyyy") : "N/A"}</TableCell>
        <TableCell>{getInstitutionName(item.data.institutionId)}</TableCell>
        <TableCell>{getBranchName(item.data.institutionId, item.data.branchId)}</TableCell>
        <TableCell>{item.data.expenseTitle || "N/A"}</TableCell>
        <TableCell>{item.data.itemName || "N/A"}</TableCell>
        <TableCell>{item.data.quantityUnit?.quantity || "N/A"} {item.data.quantityUnit?.unit || ""}</TableCell>
        <TableCell className="text-right">{item.data.amount || 0}</TableCell>
        <TableCell>{item.data.description || "N/A"}</TableCell>
        <TableCell>{item.data.attachment ? "আছে" : "নেই"}</TableCell>
        <TableCell className="flex justify-center space-x-2">
          <Button variant="outline" size="sm" onClick={() => handleEdit(item)}>এডিট</Button>
          <Button variant="destructive" size="sm" onClick={() => removeFromCart(item.id)}>মুছে ফেলুন</Button>
        </TableCell>
      </TableRow>
    ));
  };

  // Helper function for rendering simple voucher tables (rental-utility, mobile-bill, repair, petty-cash)
  const renderGenericSimpleTable = (items: CartItem[], title: string, headerBgClass: string) => {
    if (items.length === 0) {
      return (
        <TableRow>
          <TableCell colSpan={8} className="text-center text-gray-500">
            কোনো {title} ভাউচার নেই।
          </TableCell>
        </TableRow>
      );
    }

    return items.map((item, index) => (
      <TableRow key={item.id}>
        <TableCell className="font-medium">{index + 1}</TableCell>
        <TableCell>{item.data.date ? format(new Date(item.data.date), "dd MMM, yyyy") : "N/A"}</TableCell>
        <TableCell>{getInstitutionName(item.data.institutionId)}</TableCell>
        <TableCell>{getBranchName(item.data.institutionId, item.data.branchId)}</TableCell>
        <TableCell className="text-right">{item.data.amount || 0}</TableCell>
        <TableCell>{item.data.description || "N/A"}</TableCell>
        <TableCell>{item.data.attachment ? "আছে" : "নেই"}</TableCell>
        <TableCell className="flex justify-center space-x-2">
          <Button variant="outline" size="sm" onClick={() => handleEdit(item)}>এডিট</Button>
          <Button variant="destructive" size="sm" onClick={() => removeFromCart(item.id)}>মুছে ফেলুন</Button>
        </TableCell>
      </TableRow>
    ));
  };


  return (
    <div className="min-h-[calc(100vh-80px)] bg-gradient-to-br from-green-50 to-teal-50 p-6">
      <h1 className="text-4xl font-extrabold text-center text-green-800 mb-8">
        আপনার কার্ট
      </h1>

      {cartItems.length === 0 ? (
        <div className="text-center text-xl text-gray-600 p-8 bg-white rounded-lg shadow-inner border border-gray-200">
          আপনার কার্ট খালি। ভাউচার এন্ট্রি পেজ থেকে আইটেম যোগ করুন।
        </div>
      ) : (
        <div className="space-y-8">
          {/* Publicity Conveyance Voucher Table */}
          {publicityConveyanceVouchers.length > 0 && (
            <div className="bg-white p-6 rounded-xl shadow-lg border border-blue-200">
              <h2 className="text-2xl font-bold text-blue-700 mb-4">প্রচারণা (কনভেয়েন্স)</h2>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-blue-100">
                      <TableHead className="w-[50px]">ক্রমিক</TableHead>
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
                      <TableHead className="text-center">অ্যাকশন</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {renderPublicityConveyanceTable(publicityConveyanceVouchers)}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}

          {/* Publicity Entertainment Voucher Table */}
          {publicityEntertainmentVouchers.length > 0 && (
            <div className="bg-white p-6 rounded-xl shadow-lg border border-green-200">
              <h2 className="text-2xl font-bold text-green-700 mb-4">প্রচারণা (এন্টারটেইনমেন্ট)</h2>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-green-100">
                      <TableHead className="w-[50px]">ক্রমিক</TableHead>
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
                      <TableHead className="text-center">অ্যাকশন</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {renderPublicityEntertainmentTable(publicityEntertainmentVouchers)}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}

          {/* Publicity Publicist Bill Voucher Table */}
          {publicityPublicistBillVouchers.length > 0 && (
            <div className="bg-white p-6 rounded-xl shadow-lg border border-orange-200">
              <h2 className="text-2xl font-bold text-orange-700 mb-4">প্রচারণা (প্রচারণাকারীর বিল)</h2>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-orange-100">
                      <TableHead className="w-[50px]">ক্রমিক</TableHead>
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
                      <TableHead className="text-center">অ্যাকশন</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {renderPublicityPublicistBillTable(publicityPublicistBillVouchers)}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}

          {/* Office Supplies & Stationery Voucher Table */}
          {officeSuppliesStationeryVouchers.length > 0 && (
            <div className="bg-white p-6 rounded-xl shadow-lg border border-purple-200">
              <h2 className="text-2xl font-bold text-purple-700 mb-4">অফিস সাপ্লাইস ও স্টেশনারি</h2>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-purple-100">
                      <TableHead className="w-[50px]">ক্রমিক</TableHead>
                      <TableHead>তারিখ</TableHead>
                      <TableHead>প্রতিষ্ঠানের নাম</TableHead>
                      <TableHead>শাখার নাম</TableHead>
                      <TableHead>ব্যয়ের শিরোনাম</TableHead>
                      <TableHead>আইটেমের নাম</TableHead>
                      <TableHead>সংখ্যা</TableHead>
                      <TableHead className="text-right">টাকার পরিমাণ</TableHead>
                      <TableHead>বর্ণনা</TableHead>
                      <TableHead>সংযুক্তি</TableHead>
                      <TableHead className="text-center">অ্যাকশন</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {renderOfficeSuppliesStationeryTable(officeSuppliesStationeryVouchers)}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}

          {/* Entertainment Voucher Table */}
          {entertainmentVouchers.length > 0 && (
            <div className="bg-white p-6 rounded-xl shadow-lg border border-green-200">
              <h2 className="text-2xl font-bold text-green-700 mb-4">এন্টারটেইনমেন্ট ভাউচার</h2>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-green-100">
                      <TableHead className="w-[50px]">ক্রমিক</TableHead>
                      <TableHead>তারিখ</TableHead>
                      <TableHead>প্রতিষ্ঠানের নাম</TableHead>
                      <TableHead>শাখার নাম</TableHead>
                      <TableHead>ব্যয়ের শিরোনাম</TableHead>
                      <TableHead>ব্যয়ের খাত</TableHead>
                      <TableHead className="text-right">টাকার পরিমাণ</TableHead>
                      <TableHead>বর্ণনা</TableHead>
                      <TableHead>সংযুক্তি</TableHead>
                      <TableHead className="text-center">অ্যাকশন</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {renderEntertainmentTable(entertainmentVouchers)}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}

          {/* Conveyance Voucher Table */}
          {conveyanceVouchers.length > 0 && (
            <div className="bg-white p-6 rounded-xl shadow-lg border border-blue-200">
              <h2 className="text-2xl font-bold text-blue-700 mb-4">কনভেয়েন্স ভাউচার</h2>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-blue-100">
                      <TableHead className="w-[50px]">ক্রমিক</TableHead>
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
                      <TableHead className="text-center">অ্যাকশন</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {renderConveyanceTable(conveyanceVouchers)}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}

          {/* New tables for simple single-type vouchers */}
          {rentalUtilityVouchers.length > 0 && (
            <div className="bg-white p-6 rounded-xl shadow-lg border border-red-200">
              <h2 className="text-2xl font-bold text-red-700 mb-4">রেন্টাল ও ইউটিলিটি বিল ভাউচার</h2>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-red-100">
                      <TableHead className="w-[50px]">ক্রমিক</TableHead>
                      <TableHead>তারিখ</TableHead>
                      <TableHead>প্রতিষ্ঠানের নাম</TableHead>
                      <TableHead>শাখার নাম</TableHead>
                      <TableHead className="text-right">টাকার পরিমাণ</TableHead>
                      <TableHead>বর্ণনা</TableHead>
                      <TableHead>সংযুক্তি</TableHead>
                      <TableHead className="text-center">অ্যাকশন</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {renderGenericSimpleTable(rentalUtilityVouchers, "রেন্টাল ও ইউটিলিটি বিল", "bg-red-100")}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}

          {mobileBillVouchers.length > 0 && (
            <div className="bg-white p-6 rounded-xl shadow-lg border border-yellow-200">
              <h2 className="text-2xl font-bold text-yellow-700 mb-4">মোবাইল বিল ভাউচার</h2>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-yellow-100">
                      <TableHead className="w-[50px]">ক্রমিক</TableHead>
                      <TableHead>তারিখ</TableHead>
                      <TableHead>প্রতিষ্ঠানের নাম</TableHead>
                      <TableHead>শাখার নাম</TableHead>
                      <TableHead className="text-right">টাকার পরিমাণ</TableHead>
                      <TableHead>বর্ণনা</TableHead>
                      <TableHead>সংযুক্তি</TableHead>
                      <TableHead className="text-center">অ্যাকশন</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {renderGenericSimpleTable(mobileBillVouchers, "মোবাইল বিল", "bg-yellow-100")}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}

          {repairVouchers.length > 0 && (
            <div className="bg-white p-6 rounded-xl shadow-lg border border-teal-200">
              <h2 className="text-2xl font-bold text-teal-700 mb-4">রিপেয়ার ভাউচার</h2>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-teal-100">
                      <TableHead className="w-[50px]">ক্রমিক</TableHead>
                      <TableHead>তারিখ</TableHead>
                      <TableHead>প্রতিষ্ঠানের নাম</TableHead>
                      <TableHead>শাখার নাম</TableHead>
                      <TableHead className="text-right">টাকার পরিমাণ</TableHead>
                      <TableHead>বর্ণনা</TableHead>
                      <TableHead>সংযুক্তি</TableHead>
                      <TableHead className="text-center">অ্যাকশন</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {renderGenericSimpleTable(repairVouchers, "রিপেয়ার", "bg-teal-100")}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}

          {pettyCashVouchers.length > 0 && (
            <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-200">
              <h2 className="text-2xl font-bold text-gray-700 mb-4">পেটি ক্যাশ ভাউচার</h2>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-gray-100">
                      <TableHead className="w-[50px]">ক্রমিক</TableHead>
                      <TableHead>তারিখ</TableHead>
                      <TableHead>প্রতিষ্ঠানের নাম</TableHead>
                      <TableHead>শাখার নাম</TableHead>
                      <TableHead className="text-right">টাকার পরিমাণ</TableHead>
                      <TableHead>বর্ণনা</TableHead>
                      <TableHead>সংযুক্তি</TableHead>
                      <TableHead className="text-center">অ্যাকশন</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {renderGenericSimpleTable(pettyCashVouchers, "পেটি ক্যাশ", "bg-gray-100")}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}
          <div className="text-center mt-10">
            <Button
              onClick={handleSubmitAllVouchers}
              className="bg-gradient-to-r from-green-600 to-teal-700 hover:from-green-700 hover:to-teal-800 text-white text-xl py-3 px-8 rounded-full shadow-lg transition-all duration-300 ease-in-out transform hover:scale-105"
            >
              সাবমিট করুন
            </Button>
          </div>
        </div>
      )}

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[700px] p-6 max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-blue-700">ভাউচার এডিট করুন</DialogTitle>
          </DialogHeader>
          {editingItem && (
            <DynamicVoucherForm
              voucherTypeId={editingItem.voucherTypeId}
              initialData={editingItem.data}
              onFormSubmit={handleUpdateVoucher}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Cart;