import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Checkbox } from "@/components/ui/checkbox";
import { DUMMY_PINS } from "@/data/dummyData";
import { cn } from "@/lib/utils";

interface PinSelectorProps {
  label: string;
  selectedPins: string[];
  onSelectPins: (pins: string[]) => void;
  allowMultiplePins?: boolean;
}

const PinSelector = ({ label, selectedPins, onSelectPins, allowMultiplePins = false }: PinSelectorProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [tempSelectedPins, setTempSelectedPins] = useState<string[]>(selectedPins);

  const filteredPins = DUMMY_PINS.filter((pin) =>
    pin.pin.includes(searchTerm) || pin.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCheckboxChange = (pin: string, checked: boolean) => {
    if (allowMultiplePins) {
      setTempSelectedPins((prev) =>
        checked ? [...prev, pin] : prev.filter((p) => p !== pin)
      );
    } else {
      setTempSelectedPins(checked ? [pin] : []);
    }
  };

  const handleConfirm = () => {
    onSelectPins(tempSelectedPins);
    setIsOpen(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "w-full justify-between",
            selectedPins.length > 0 ? "border-blue-500 text-blue-700" : "border-gray-300 text-gray-700"
          )}
        >
          <span>{label} ({selectedPins.length})</span>
          {selectedPins.length > 0 && (
            <span className="ml-2 text-blue-500">
              {selectedPins.length} নির্বাচিত
            </span>
          )}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[600px] p-6">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-blue-700">পিন নম্বর সংযুক্ত করুন</DialogTitle>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <Input
            placeholder="পিন লিখে সার্চ করুন"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="col-span-3"
          />
          <div className="max-h-60 overflow-y-auto border rounded-md">
            <Table>
              <TableHeader>
                <TableRow className="bg-blue-50">
                  <TableHead className="w-[50px]">SL</TableHead>
                  <TableHead>PIN</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead className="text-center">নির্বাচন</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPins.length > 0 ? (
                  filteredPins.map((pinData, index) => (
                    <TableRow key={pinData.pin}>
                      <TableCell className="font-medium">{index + 1}</TableCell>
                      <TableCell>{pinData.pin}</TableCell>
                      <TableCell>{pinData.name}</TableCell>
                      <TableCell className="text-center">
                        <Checkbox
                          checked={tempSelectedPins.includes(pinData.pin)}
                          onCheckedChange={(checked) => handleCheckboxChange(pinData.pin, !!checked)}
                          className="h-4 w-4 border-blue-500 data-[state=checked]:bg-blue-500 data-[state=checked]:text-white"
                        />
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center text-gray-500">
                      কোনো পিন পাওয়া যায়নি।
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </div>
        <Button onClick={handleConfirm} className="bg-blue-600 hover:bg-blue-700 text-white">
          কনফার্ম
        </Button>
      </DialogContent>
    </Dialog>
  );
};

export default PinSelector;