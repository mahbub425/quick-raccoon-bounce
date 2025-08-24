import React from "react";
import { useSubmittedVouchers } from "@/context/SubmittedVouchersContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { format } from "date-fns";
import { DUMMY_INSTITUTIONS, DUMMY_PINS, DUMMY_PROGRAM_SESSIONS } from "@/data/dummyData";
import { useNavigate } from "react-router-dom";

const Payment = () => {
  const { submittedVouchers } = useSubmittedVouchers();
  const navigate = useNavigate();

  // Filter for vouchers that are 'approved' by a mentor
  const approvedVouchersForPayment = submittedVouchers.filter(v => v.status === 'approved');

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

  const handleMarkAsPaid = (voucherId: string) => {
    console.log(`Voucher ${voucherId} marked as paid.`);
    // In a real application, this would update the voucher's status in a backend.
    // For now, it's a placeholder.
  };

  return (
    <div className="min-h-[calc(100vh-80px)] bg-gradient-to-br from-teal-50 to-blue-50 p-6">
      <h1 className="text-4xl font-extrabold text-center text-teal-800 mb-8">
        পেমেন্ট
      </h1>

      {approvedVouchersForPayment.length === 0 ? (
        <div className="text-center text-xl text-gray-600 p-8 bg-white rounded-lg shadow-inner border border-gray-200">
          কোনো ভাউচার পেমেন্টের জন্য অপেক্ষমাণ নেই।
          <div className="mt-6">
            <Button onClick={() => navigate("/payment/home")} className="bg-blue-600 hover:bg-blue-700 text-white text-lg py-2 px-6 rounded-md shadow-md">
              হোম পেজে ফিরে যান
            </Button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto">
          {approvedVouchersForPayment.map((item) => (
            <Card key={item.id} className="shadow-lg border-teal-300">
              <CardHeader className="bg-teal-100 rounded-t-lg p-4">
                <CardTitle className="text-xl font-bold text-teal-800">{item.voucherHeading}</CardTitle>
                <CardDescription className="text-sm text-teal-600">
                  সাবমিট করা হয়েছে: {format(new Date(item.createdAt), "dd MMM, yyyy HH:mm")}
                </CardDescription>
              </CardHeader>
              <CardContent className="p-4 space-y-2 text-gray-700">
                <p><strong>তারিখ:</strong> {item.data.date ? format(new Date(item.data.date), "dd MMM, yyyy") : "N/A"}</p>
                <p><strong>প্রতিষ্ঠানের নাম:</strong> {getInstitutionName(item.data.institutionId)}</p>
                <p><strong>শাখার নাম:</strong> {getBranchName(item.data.institutionId, item.data.branchId)}</p>
                {item.data.programSessionId && <p><strong>প্রোগ্রাম ও সেশন:</strong> {getProgramSessionName(item.data.institutionId, item.data.programSessionId)}</p>}
                {item.data.publicityLocation && <p><strong>প্রচারণার স্থান:</strong> {item.data.publicityLocation}</p>}
                {item.data.startTime && item.data.endTime && <p><strong>সময়কাল:</strong> {item.data.startTime} - {item.data.endTime}</p>}
                {item.data.expenseTitle && <p><strong>ব্যয়ের শিরোনাম:</strong> {item.data.expenseTitle}</p>}
                {item.data.expenseCategory && <p><strong>ব্যয়ের খাত:</strong> {item.data.expenseCategory}</p>}
                {item.data.applicableFor && <p><strong>যাহার জন্য প্রযোজ্য:</strong> {item.data.applicableFor}</p>}
                {item.data.from && <p><strong>হইতে:</strong> {item.data.from}</p>}
                {item.data.to && <p><strong>পর্যন্ত:</strong> {item.data.to}</p>}
                {item.data.vehicleName && <p><strong>বাহনের নাম:</strong> {item.data.vehicleName}</p>}
                {item.data.amount && <p><strong>টাকার পরিমাণ:</strong> {item.data.amount}</p>}
                {item.data.description && <p><strong>বর্ণনা:</strong> {item.data.description}</p>}
                {item.data.purpose && <p><strong>উদ্দেশ্য:</strong> {item.data.purpose}</p>}
                {item.data.publicistName && <p><strong>প্রচারণাকরীর নাম:</strong> {item.data.publicistName}</p>}
                {item.data.mobileNumber && <p><strong>মোবাইল নম্বর:</strong> {item.data.mobileNumber}</p>}
                {item.data.shift && <p><strong>সিফট:</strong> {item.data.shift}</p>}
                {item.data.selectedPins && item.data.selectedPins.length > 0 && <p><strong>নির্বাচিত পিন:</strong> {getPinNames(item.data.selectedPins)}</p>}
                {item.data.teacherPins && item.data.teacherPins.length > 0 && <p><strong>শিক্ষক পিন:</strong> {getPinNames(item.data.teacherPins)}</p>}
                {item.data.otherPins && item.data.otherPins.length > 0 && <p><strong>অন্যান্য পিন:</strong> {getPinNames(item.data.otherPins)}</p>}
                {item.data.specialApproverPin && <p><strong>অনুমোদনকারী পিন:</strong> {item.data.specialApproverPin}</p>}
                {item.data.quantityUnit?.quantity && item.data.quantityUnit?.unit && <p><strong>পরিমান ও ইউনিট:</strong> {item.data.quantityUnit.quantity} {item.data.quantityUnit.unit}</p>}
                {item.data.attachment && <p><strong>সংযুক্তি:</strong> আছে</p>}

                <div className="flex justify-end mt-4">
                  <Button className="bg-teal-600 hover:bg-teal-700 text-white" onClick={() => handleMarkAsPaid(item.id)}>
                    পেমেন্ট সম্পন্ন করুন
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default Payment;