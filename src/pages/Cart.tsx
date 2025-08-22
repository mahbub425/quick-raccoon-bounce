import React from "react";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { toast } from "sonner";

const Cart = () => {
  // This will eventually hold cart items from a global state
  const cartItems: any[] = []; // Placeholder for actual cart items

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
          {/* Example table structure for a specific voucher type */}
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
                {/* {cartItems.filter(item => item.voucherType === 'entertainment').map((item, index) => (
                  <TableRow key={item.id}>
                    <TableCell className="font-medium">{index + 1}</TableCell>
                    <TableCell>{item.data.date}</TableCell>
                    <TableCell>{item.data.institution}</TableCell>
                    <TableCell>{item.data.branch}</TableCell>
                    <TableCell>{item.data.expenseTitle}</TableCell>
                    <TableCell>{item.data.expenseCategory}</TableCell>
                    <TableCell className="text-right">{item.data.amount}</TableCell>
                    <TableCell>{item.data.description}</TableCell>
                    <TableCell>{item.data.attachment ? "আছে" : "নেই"}</TableCell>
                    <TableCell className="flex justify-center space-x-2">
                      <Button variant="outline" size="sm" onClick={() => toast.info("এডিট ক্লিক করা হয়েছে")}>এডিট</Button>
                      <Button variant="destructive" size="sm" onClick={() => toast.error("মুছে ফেলুন ক্লিক করা হয়েছে")}>মুছে ফেলুন</Button>
                    </TableCell>
                  </TableRow>
                ))} */}
                <TableRow>
                  <TableCell colSpan={10} className="text-center text-gray-500">
                    কোনো এন্টারটেইনমেন্ট ভাউচার নেই।
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </div>

          {/* Other voucher type tables will follow a similar structure */}
        </div>
      )}
    </div>
  );
};

export default Cart;