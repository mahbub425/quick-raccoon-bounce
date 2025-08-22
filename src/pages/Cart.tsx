import React from "react";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "sonner";
import { useCart } from "@/context/CartContext";
import { CartItem } from "@/types";
import { DUMMY_INSTITUTIONS, DUMMY_PINS } from "@/data/dummyData";
import { format } from "date-fns"; // Import format from date-fns

const Cart = () => {
  const { cartItems, removeFromCart } = useCart();

  const entertainmentVouchers = cartItems.filter(item => item.voucherTypeId === 'entertainment');
  const conveyanceVouchers = cartItems.filter(item => item.voucherTypeId === 'conveyance');
  const publicityVouchers = cartItems.filter(item => item.voucherTypeId === 'publicity');
  const publicityConveyanceVouchers = cartItems.filter(item => item.voucherTypeId === 'publicity-conveyance');
  const publicityEntertainmentVouchers = cartItems.filter(item => item.voucherTypeId === 'publicity-entertainment');
  const publicityPublicistBillVouchers = cartItems.filter(item => item.voucherTypeId === 'publicity-publicist-bill');

  const getInstitutionName = (id: string) => DUMMY_INSTITUTIONS.find(inst => inst.id === id)?.name || "N/A";
  const getBranchName = (institutionId: string, branchId: string) => {
    const institution = DUMMY_INSTITUTIONS.find(inst => inst.id === institutionId);
    return institution?.branches.find(branch => branch.id === branchId)?.name || "N/A";
  };
  const getPinNames = (pins: string[]) => {
    if (!pins || pins.length === 0) return "N/A";
    return pins.map(pin => DUMMY_PINS.find(p => p.pin === pin)?.name || pin).join(", ");
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
          <Button variant="outline" size="sm" onClick={() => toast.info("এডিট ক্লিক করা হয়েছে")}>এডিট</Button>
          <Button variant="destructive" size="sm" onClick={() => removeFromCart(item.id)}>মুছে ফেলুন</Button>
        </TableCell>
      </TableRow>
    ));
  };

  const renderConveyanceTable = (items: CartItem[]) => {
    if (items.length === 0) {
      return (
        <TableRow>
          <TableCell colSpan={11} className="text-center text-gray-500">
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
          {item.data.teacherPins && item.data.teacherPins.length > 0 && `(শিক্ষক পিন: ${getPinNames(item.data.teacherPins)})`}
          {item.data.otherPins && item.data.otherPins.length > 0 && `(অন্যান্য পিন: ${getPinNames(item.data.otherPins)})`}
          {!item.data.teacherPins?.length && !item.data.otherPins?.length && "N/A"}
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
          <Button variant="outline" size="sm" onClick={() => toast.info("এডিট ক্লিক করা হয়েছে")}>এডিট</Button>
          <Button variant="destructive" size="sm" onClick={() => removeFromCart(item.id)}>মুছে ফেলুন</Button>
        </TableCell>
      </TableRow>
    ));
  };

  const renderPublicityTable = (items: CartItem[]) => {
    if (items.length === 0) {
      return (
        <TableRow>
          <TableCell colSpan={8} className="text-center text-gray-500">
            কোনো প্রচারণা ভাউচার নেই।
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
        <TableCell>{item.data.programSessionId || "N/A"}</TableCell>
        <TableCell>{item.data.publicityLocation || "N/A"}</TableCell>
        <TableCell>{item.data.startTime || "N/A"} - {item.data.endTime || "N/A"}</TableCell>
        <TableCell className="flex justify-center space-x-2">
          <Button variant="outline" size="sm" onClick={() => toast.info("এডিট ক্লিক করা হয়েছে")}>এডিট</Button>
          <Button variant="destructive" size="sm" onClick={() => removeFromCart(item.id)}>মুছে ফেলুন</Button>
        </TableCell>
      </TableRow>
    ));
  };

  const renderPublicityConveyanceTable = (items: CartItem[]) => {
    if (items.length === 0) {
      return (
        <TableRow>
          <TableCell colSpan={10} className="text-center text-gray-500">
            কোনো প্রচারণা (কনভেয়েন্স) ভাউচার নেই।
          </TableCell>
        </TableRow>
      );
    }

    return items.map((item, index) => (
      <TableRow key={item.id}>
        <TableCell className="font-medium">{index + 1}</TableCell>
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
          <Button variant="outline" size="sm" onClick={() => toast.info("এডিট ক্লিক করা হয়েছে")}>এডিট</Button>
          <Button variant="destructive" size="sm" onClick={() => removeFromCart(item.id)}>মুছে ফেলুন</Button>
        </TableCell>
      </TableRow>
    ));
  };

  const renderPublicityEntertainmentTable = (items: CartItem[]) => {
    if (items.length === 0) {
      return (
        <TableRow>
          <TableCell colSpan={7} className="text-center text-gray-500">
            কোনো প্রচারণা (এন্টারটেইনমেন্ট) ভাউচার নেই।
          </TableCell>
        </TableRow>
      );
    }

    return items.map((item, index) => (
      <TableRow key={item.id}>
        <TableCell className="font-medium">{index + 1}</TableCell>
        <TableCell>{item.data.applicableFor || "N/A"}</TableCell>
        <TableCell>
          {item.data.pin && `(পিন: ${getPinNames([item.data.pin])})`}
          {item.data.name && `(নাম: ${item.data.name})`}
          {!item.data.pin && !item.data.name && "N/A"}
        </TableCell>
        <TableCell>{item.data.type || "N/A"}</TableCell>
        <TableCell className="text-right">{item.data.amount || 0}</TableCell>
        <TableCell className="flex justify-center space-x-2">
          <Button variant="outline" size="sm" onClick={() => toast.info("এডিট ক্লিক করা হয়েছে")}>এডিট</Button>
          <Button variant="destructive" size="sm" onClick={() => removeFromCart(item.id)}>মুছে ফেলুন</Button>
        </TableCell>
      </TableRow>
    ));
  };

  const renderPublicityPublicistBillTable = (items: CartItem[]) => {
    if (items.length === 0) {
      return (
        <TableRow>
          <TableCell colSpan={8} className="text-center text-gray-500">
            কোনো প্রচারণা (প্রচারণাকারীর বিল) ভাউচার নেই।
          </TableCell>
        </TableRow>
      );
    }

    return items.map((item, index) => (
      <TableRow key={item.id}>
        <TableCell className="font-medium">{index + 1}</TableCell>
        <TableCell>{item.data.publicistName || "N/A"}</TableCell>
        <TableCell>{item.data.mobileNumber || "N/A"}</TableCell>
        <TableCell>{item.data.shift || "N/A"}</TableCell>
        <TableCell className="text-right">{item.data.amount || 0}</TableCell>
        <TableCell>{item.data.attachment ? "আছে" : "নেই"}</TableCell>
        <TableCell className="flex justify-center space-x-2">
          <Button variant="outline" size="sm" onClick={() => toast.info("এডিট ক্লিক করা হয়েছে")}>এডিট</Button>
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
          {/* Publicity Voucher Table */}
          {publicityVouchers.length > 0 && (
            <div className="bg-white p-6 rounded-xl shadow-lg border border-purple-200">
              <h2 className="text-2xl font-bold text-purple-700 mb-4">প্রচারণা ভাউচার</h2>
              <Table>
                <TableHeader>
                  <TableRow className="bg-purple-100">
                    <TableHead className="w-[50px]">ক্রমিক</TableHead>
                    <TableHead>তারিখ</TableHead>
                    <TableHead>প্রতিষ্ঠানের নাম</TableHead>
                    <TableHead>শাখার নাম</TableHead>
                    <TableHead>প্রোগ্রাম ও সেশন</TableHead>
                    <TableHead>প্রচারণার স্থান</TableHead>
                    <TableHead>সময়কাল</TableHead>
                    <TableHead className="text-center">অ্যাকশন</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {renderPublicityTable(publicityVouchers)}
                </TableBody>
              </Table>
            </div>
          )}

          {/* Publicity Conveyance Voucher Table */}
          {publicityConveyanceVouchers.length > 0 && (
            <div className="bg-white p-6 rounded-xl shadow-lg border border-blue-200">
              <h2 className="text-2xl font-bold text-blue-700 mb-4">প্রচারণা (কনভেয়েন্স)</h2>
              <Table>
                <TableHeader>
                  <TableRow className="bg-blue-100">
                    <TableHead className="w-[50px]">ক্রমিক</TableHead>
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
          )}

          {/* Publicity Entertainment Voucher Table */}
          {publicityEntertainmentVouchers.length > 0 && (
            <div className="bg-white p-6 rounded-xl shadow-lg border border-green-200">
              <h2 className="text-2xl font-bold text-green-700 mb-4">প্রচারণা (এন্টারটেইনমেন্ট)</h2>
              <Table>
                <TableHeader>
                  <TableRow className="bg-green-100">
                    <TableHead className="w-[50px]">ক্রমিক</TableHead>
                    <TableHead>যাহার জন্য প্রযোজ্য</TableHead>
                    <TableHead>ব্যক্তি/পিন</TableHead>
                    <TableHead>ধরণ</TableHead>
                    <TableHead className="text-right">টাকার পরিমাণ</TableHead>
                    <TableHead className="text-center">অ্যাকশন</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {renderPublicityEntertainmentTable(publicityEntertainmentVouchers)}
                </TableBody>
              </Table>
            </div>
          )}

          {/* Publicity Publicist Bill Voucher Table */}
          {publicityPublicistBillVouchers.length > 0 && (
            <div className="bg-white p-6 rounded-xl shadow-lg border border-orange-200">
              <h2 className="text-2xl font-bold text-orange-700 mb-4">প্রচারণা (প্রচারণাকারীর বিল)</h2>
              <Table>
                <TableHeader>
                  <TableRow className="bg-orange-100">
                    <TableHead className="w-[50px]">ক্রমিক</TableHead>
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
          )}

          {/* Other Voucher Tables */}
          {entertainmentVouchers.length > 0 && (
            <div className="bg-white p-6 rounded-xl shadow-lg border border-green-200">
              <h2 className="text-2xl font-bold text-green-700 mb-4">এন্টারটেইনমেন্ট ভাউচার</h2>
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
          )}

          {conveyanceVouchers.length > 0 && (
            <div className="bg-white p-6 rounded-xl shadow-lg border border-blue-200">
              <h2 className="text-2xl font-bold text-blue-700 mb-4">কনভেয়েন্স ভাউচার</h2>
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
          )}

          {/* For now, if there are other types, just show a generic message */}
          {cartItems.filter(item =>
            item.voucherTypeId !== 'entertainment' &&
            item.voucherTypeId !== 'conveyance' &&
            item.voucherTypeId !== 'publicity' &&
            item.voucherTypeId !== 'publicity-conveyance' &&
            item.voucherTypeId !== 'publicity-entertainment' &&
            item.voucherTypeId !== 'publicity-publicist-bill'
          ).length > 0 && (
            <div className="text-center text-xl text-gray-600 p-8 bg-white rounded-lg shadow-inner border border-gray-200">
              অন্যান্য ভাউচার প্রকারের আইটেম কার্টে আছে।
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Cart;