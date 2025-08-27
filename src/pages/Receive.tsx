import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const Receive = () => {
  return (
    <div className="min-h-[calc(100vh-80px)] bg-gradient-to-br from-purple-50 to-pink-50 p-6">
      <h1 className="text-4xl font-extrabold text-center text-purple-800 mb-8">
        রিসিভ
      </h1>

      <Card className="mb-8 p-6 shadow-lg border-purple-300 bg-white max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-purple-700">রিসিভ প্যানেল</CardTitle>
        </CardHeader>
        <CardContent className="text-center text-xl text-gray-600">
          এখানে রিসিভ সম্পর্কিত তথ্য এবং কার্যকারিতা থাকবে।
        </CardContent>
      </Card>
    </div>
  );
};

export default Receive;