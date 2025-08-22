import React, { useState, useEffect, useMemo } from "react";
import { useForm, useWatch, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { Calendar } from "@/components/ui/calendar";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { DUMMY_INSTITUTIONS, DUMMY_VOUCHER_TYPES } from "@/data/dummyData";
import { cn } from "@/lib/utils";
import { EntertainmentVoucherFormData, FormField as FormFieldType, VoucherType } from "@/types";
import PinSelector from "@/components/PinSelector";
import { useCart } from "@/context/CartContext";
import { toast } from "sonner";

interface EntertainmentVoucherFormProps {
  voucherTypeId: string;
  onFormSubmit?: () => void;
}

// Helper to get voucher details and form fields
const getVoucherDetails = (id: string): VoucherType | undefined => {
  const allVouchers = DUMMY_VOUCHER_TYPES.flatMap(v => v.type === 'multi' && v.subTypes ? [v, ...v.subTypes] : [v]);
  return allVouchers.find(v => v.id === id);
};

// Dynamic Zod schema generation
const createSchema = (fields: FormFieldType[]) => {
  const schemaFields: { [key: string]: z.ZodTypeAny } = {};

  fields.forEach(field => {
    let fieldSchema: z.ZodTypeAny;

    switch (field.type) {
      case "date":
        fieldSchema = z.date({ required_error: `${field.label} আবশ্যক` });
        break;
      case "number":
        fieldSchema = z.coerce.number({ invalid_type_error: `${field.label} অবশ্যই একটি সংখ্যা হতে হবে` });
        break;
      case "dropdown":
      case "text":
      case "textarea":
      case "time":
        fieldSchema = z.string();
        break;
      case "file":
        fieldSchema = z.any(); // File input is tricky, often handled manually or with specific file schemas
        break;
      case "pin-selector":
        fieldSchema = z.array(z.string());
        break;
      case "quantity-unit":
        fieldSchema = z.object({
          quantity: z.string().min(1, "পরিমান আবশ্যক"),
          unit: z.string().min(1, "ইউনিট আবশ্যক"),
        });
        break;
      default:
        fieldSchema = z.any();
    }

    if (field.mandatory) {
      if (field.type === 'pin-selector') {
        fieldSchema = fieldSchema.refine(val => (val as string[]).length > 0, { message: `${field.label} আবশ্যক` });
      } else if (field.type === 'quantity-unit') {
        fieldSchema = fieldSchema.refine(val => (val as { quantity: string, unit: string }).quantity && (val as { quantity: string, unit: string }).unit, { message: `${field.label} আবশ্যক` });
      } else if (field.type !== 'file') { // File mandatory check is complex, skip for now
        fieldSchema = fieldSchema.min(1, { message: `${field.label} আবশ্যক` });
      }
    } else {
      fieldSchema = fieldSchema.optional();
    }

    schemaFields[field.name] = fieldSchema;

    // Handle conditional fields recursively
    if (field.conditionalFields) {
      field.conditionalFields.forEach(cond => {
        cond.fields.forEach(condField => {
          let condFieldSchema: z.ZodTypeAny;
          switch (condField.type) {
            case "date": condFieldSchema = z.date({ required_error: `${condField.label} আবশ্যক` }); break;
            case "number": condFieldSchema = z.coerce.number({ invalid_type_error: `${condField.label} অবশ্যই একটি সংখ্যা হতে হবে` }); break;
            case "dropdown":
            case "text":
            case "textarea":
            case "time":
              condFieldSchema = z.string();
              break;
            case "file": condFieldSchema = z.any(); break;
            case "pin-selector": condFieldSchema = z.array(z.string()); break;
            case "quantity-unit":
              condFieldSchema = z.object({
                quantity: z.string().min(1, "পরিমান আবশ্যক"),
                unit: z.string().min(1, "ইউনিট আবশ্যক"),
              });
              break;
            default: condFieldSchema = z.any();
          }
          if (condField.mandatory) {
            if (condField.type === 'pin-selector') {
              condFieldSchema = condFieldSchema.refine(val => (val as string[]).length > 0, { message: `${condField.label} আবশ্যক` });
            } else if (condField.type === 'quantity-unit') {
              condFieldSchema = condFieldSchema.refine(val => (val as { quantity: string, unit: string }).quantity && (val as { quantity: string, unit: string }).unit, { message: `${condField.label} আবশ্যক` });
            } else if (condField.type !== 'file') {
              condFieldSchema = condFieldSchema.min(1, { message: `${condField.label} আবশ্যক` });
            }
          } else {
            condFieldSchema = condFieldSchema.optional();
          }
          schemaFields[condField.name] = condFieldSchema;
        });
      });
    }
  });

  return z.object(schemaFields);
};

const EntertainmentVoucherForm = ({ voucherTypeId, onFormSubmit }: EntertainmentVoucherFormProps) => {
  const voucherDetails = getVoucherDetails(voucherTypeId);
  const { addToCart } = useCart();

  if (!voucherDetails || !voucherDetails.formFields) {
    return <div className="text-center text-red-500">ভাউচার ফর্মের তথ্য পাওয়া যায়নি।</div>;
  }

  const formSchema = createSchema(voucherDetails.formFields);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      // Initialize all possible fields to prevent undefined issues
      date: undefined,
      institutionId: "",
      branchId: "",
      expenseTitle: "",
      expenseCategory: "",
      selectedPins: [],
      guestName: "",
      studentName: "",
      guardianName: "",
      quantityUnit: { quantity: "", unit: "" },
      amount: undefined,
      description: "",
      attachment: undefined,
    },
  });

  const watchedValues = useWatch({ control: form.control });
  const selectedInstitutionId = watchedValues.institutionId;

  // Dynamically get branch options based on selected institution
  const branchOptions = useMemo(() => {
    if (!selectedInstitutionId) {
      return [];
    }
    const institution = DUMMY_INSTITUTIONS.find(
      (inst) => inst.id === selectedInstitutionId,
    );
    return institution
      ? institution.branches.map((branch) => ({
          value: branch.id,
          label: branch.name,
        }))
      : [];
  }, [selectedInstitutionId]);

  const onSubmit = (data: z.infer<typeof formSchema>) => {
    addToCart({
      voucherTypeId: voucherDetails.id,
      voucherHeading: voucherDetails.heading,
      data: data,
    });
    form.reset(); // Reset form after submission
    onFormSubmit?.(); // Call optional callback
  };

  const renderField = (field: FormFieldType) => {
    const fieldValue = watchedValues[field.name];
    const isVisible = !field.dependency || (watchedValues[field.dependency.field] === field.dependency.value || field.dependency.value === "*");

    if (!isVisible) return null;

    return (
      <FormField
        key={field.name}
        control={form.control}
        name={field.name as keyof z.infer<typeof formSchema>} // Use z.infer<typeof formSchema> for type safety
        render={({ field: formHookField }) => (
          <FormItem className="flex flex-col">
            <FormLabel className="text-gray-700 font-semibold">{field.label} {field.mandatory && <span className="text-red-500">*</span>}</FormLabel>
            <FormControl>
              {field.type === "text" && (
                <Input
                  placeholder={field.placeholder}
                  {...formHookField}
                  value={formHookField.value || ""}
                  className="border-blue-300 focus:border-blue-500 focus:ring-blue-500"
                />
              )}
              {field.type === "number" && (
                <Input
                  type="number"
                  placeholder={field.placeholder}
                  {...formHookField}
                  value={formHookField.value === undefined || formHookField.value === null ? "" : formHookField.value}
                  onChange={(e) => formHookField.onChange(e.target.value ? parseFloat(e.target.value) : undefined)}
                  className="border-blue-300 focus:border-blue-500 focus:ring-blue-500"
                />
              )}
              {field.type === "textarea" && (
                <Textarea
                  placeholder={field.placeholder}
                  {...formHookField}
                  value={formHookField.value || ""}
                  className="border-blue-300 focus:border-blue-500 focus:ring-blue-500"
                />
              )}
              {field.type === "dropdown" && field.name === "branchId" && (
                <Select onValueChange={formHookField.onChange} value={formHookField.value || ""}>
                  <SelectTrigger className="border-blue-300 focus:border-blue-500 focus:ring-blue-500">
                    <SelectValue placeholder={field.label} />
                  </SelectTrigger>
                  <SelectContent>
                    {branchOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
              {field.type === "dropdown" && field.name !== "branchId" && (
                <Select onValueChange={formHookField.onChange} value={formHookField.value || ""}>
                  <SelectTrigger className="border-blue-300 focus:border-blue-500 focus:ring-blue-500">
                    <SelectValue placeholder={field.label} />
                  </SelectTrigger>
                  <SelectContent>
                    {field.options?.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
              {field.type === "date" && (
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant={"outline"}
                      className={cn(
                        "w-full justify-start text-left font-normal border-blue-300 focus:border-blue-500 focus:ring-blue-500",
                        !formHookField.value && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {formHookField.value ? format(formHookField.value as Date, "PPP") : <span>তারিখ নির্বাচন করুন</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={formHookField.value as Date}
                      onSelect={formHookField.onChange}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              )}
              {field.type === "time" && (
                <Input
                  type="time"
                  {...formHookField}
                  value={formHookField.value || ""}
                  className="border-blue-300 focus:border-blue-500 focus:ring-blue-500"
                />
              )}
              {field.type === "file" && (
                <Input
                  type="file"
                  onChange={(e) => formHookField.onChange(e.target.files ? e.target.files[0] : undefined)}
                  className="border-blue-300 focus:border-blue-500 focus:ring-blue-500"
                />
              )}
              {field.type === "pin-selector" && (
                <PinSelector
                  label={field.label}
                  selectedPins={formHookField.value || []}
                  onSelectPins={formHookField.onChange}
                  allowMultiplePins={field.allowMultiplePins}
                />
              )}
              {field.type === "quantity-unit" && (
                <div className="flex space-x-2">
                  <Input
                    type="text"
                    placeholder="পরিমান"
                    value={formHookField.value?.quantity || ""}
                    onChange={(e) => formHookField.onChange({ ...formHookField.value, quantity: e.target.value })}
                    className="w-2/3 border-blue-300 focus:border-blue-500 focus:ring-blue-500"
                  />
                  <Select
                    value={formHookField.value?.unit || ""}
                    onValueChange={(value) => formHookField.onChange({ ...formHookField.value, unit: value })}
                  >
                    <SelectTrigger className="w-1/3 border-blue-300 focus:border-blue-500 focus:ring-blue-500">
                      <SelectValue placeholder="ইউনিট" />
                    </SelectTrigger>
                    <SelectContent>
                      {field.unitOptions?.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    );
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 p-6 bg-white rounded-lg shadow-lg border border-blue-200">
        <h2 className="text-3xl font-bold text-blue-800 mb-6 text-center">{voucherDetails.heading}</h2>
        {voucherDetails.formFields.map((field) => (
          <React.Fragment key={field.name}>
            {renderField(field)}
            {field.conditionalFields &&
              field.conditionalFields.map((cond) =>
                watchedValues[field.name] === cond.value
                  ? cond.fields.map((condField) => renderField(condField))
                  : null
              )}
          </React.Fragment>
        ))}
        <Button type="submit" className="w-full bg-gradient-to-r from-blue-600 to-purple-700 hover:from-blue-700 hover:to-purple-800 text-white text-lg py-3 rounded-lg transition-all duration-300 ease-in-out transform hover:scale-105">
          কার্টে যোগ করুন
        </Button>
      </form>
    </Form>
  );
};

export default EntertainmentVoucherForm;