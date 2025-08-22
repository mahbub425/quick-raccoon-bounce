import React, { useState, useEffect } from "react";
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
  const schemaFields: { [key: string]: z.ZodAny } = {};

  fields.forEach(field => {
    let fieldSchema: z.ZodAny;

    switch (field.type) {
      case "date":
        fieldSchema = z.date();
        break;
      case "number":
        fieldSchema = z.coerce.number();
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
          quantity: z.string(),
          unit: z.string(),
        });
        break;
      default:
        fieldSchema = z.any();
    }

    if (field.mandatory) {
      fieldSchema = fieldSchema.refine(val => {
        if (field.type === 'file') return true; // File mandatory check is complex, skip for now
        if (field.type === 'pin-selector') return (val as string[]).length > 0;
        if (field.type === 'quantity-unit') return (val as { quantity: string, unit: string }).quantity && (val as { quantity: string, unit: string }).unit;
        return !!val;
      }, { message: `${field.label} আবশ্যক` });
    } else {
      fieldSchema = fieldSchema.optional();
    }

    schemaFields[field.name] = fieldSchema;

    // Handle conditional fields recursively
    if (field.conditionalFields) {
      field.conditionalFields.forEach(cond => {
        cond.fields.forEach(condField => {
          let condFieldSchema: z.ZodAny;
          switch (condField.type) {
            case "date": condFieldSchema = z.date(); break;
            case "number": condFieldSchema = z.coerce.number(); break;
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
                quantity: z.string(),
                unit: z.string(),
              });
              break;
            default: condFieldSchema = z.any();
          }
          if (condField.mandatory) {
            condFieldSchema = condFieldSchema.refine(val => {
              if (condField.type === 'file') return true;
              if (condField.type === 'pin-selector') return (val as string[]).length > 0;
              if (condField.type === 'quantity-unit') return (val as { quantity: string, unit: string }).quantity && (val as { quantity: string, unit: string }).unit;
              return !!val;
            }, { message: `${condField.label} আবশ্যক` });
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
    defaultValues: {},
  });

  const watchedValues = useWatch({ control: form.control });

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
        name={field.name as keyof EntertainmentVoucherFormData}
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
                  value={formHookField.value || ""}
                  onChange={(e) => formHookField.onChange(e.target.value ? parseFloat(e.target.value) : "")}
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
              {field.type === "dropdown" && (
                <Select onValueChange={formHookField.onChange} value={formHookField.value}>
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
                  onChange={(e) => formHookField.onChange(e.target.files ? e.target.files[0] : null)}
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