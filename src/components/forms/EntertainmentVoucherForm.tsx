import React, { useState, useEffect, useMemo } from "react";
import { useForm, useWatch, Controller, Path } from "react-hook-form";
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

// Helper to generate default values based on form fields
const generateDefaultValues = (formFields: FormFieldType[]) => {
  const defaults: { [key: string]: any } = {};
  formFields.forEach(field => {
    if (field.type === 'date') {
      defaults[field.name] = field.mandatory ? new Date() : null; // Use new Date() for mandatory, null for optional
    } else if (field.type === 'number') {
      defaults[field.name] = field.mandatory ? 0 : undefined;
    } else if (field.type === 'pin-selector') {
      defaults[field.name] = [];
    } else if (field.type === 'quantity-unit') {
      defaults[field.name] = { quantity: "", unit: "" };
    } else if (field.type === 'file') {
      defaults[field.name] = undefined;
    } else {
      defaults[field.name] = "";
    }

    // Handle conditional fields for default values
    if (field.conditionalFields) {
      field.conditionalFields.forEach(cond => {
        cond.fields.forEach(condField => {
          if (condField.type === 'date') {
            defaults[condField.name] = condField.mandatory ? new Date() : null;
          } else if (condField.type === 'number') {
            defaults[condField.name] = condField.mandatory ? 0 : undefined;
          } else if (condField.type === 'pin-selector') {
            defaults[condField.name] = [];
          } else if (condField.type === 'quantity-unit') {
            defaults[condField.name] = { quantity: "", unit: "" };
          } else if (condField.type === 'file') {
            defaults[condField.name] = undefined;
          } else {
            defaults[condField.name] = "";
          }
        });
      });
    }
  });
  return defaults;
};

// Dynamic Zod schema generation
const createSchema = (fields: FormFieldType[]) => {
  const schemaFields: { [key: string]: z.ZodTypeAny } = {};

  fields.forEach(field => {
    let currentFieldSchema: z.ZodTypeAny;

    switch (field.type) {
      case "date":
        currentFieldSchema = z.date();
        if (!field.mandatory) {
          currentFieldSchema = (currentFieldSchema as z.ZodDate).nullable().optional();
        }
        break;
      case "number":
        currentFieldSchema = z.coerce.number({ invalid_type_error: `${field.label} অবশ্যই একটি সংখ্যা হতে হবে` });
        if (field.mandatory) {
          currentFieldSchema = (currentFieldSchema as z.ZodNumber).min(1, { message: `${field.label} অবশ্যই 0 এর বেশি হতে হবে` });
        } else {
          currentFieldSchema = (currentFieldSchema as z.ZodNumber).optional();
        }
        break;
      case "dropdown":
      case "text":
      case "textarea":
      case "time":
        currentFieldSchema = z.string();
        if (field.mandatory) {
          currentFieldSchema = (currentFieldSchema as z.ZodString).min(1, { message: `${field.label} আবশ্যক` });
        } else {
          currentFieldSchema = (currentFieldSchema as z.ZodString).optional();
        }
        break;
      case "file":
        currentFieldSchema = z.any();
        if (field.mandatory) {
          currentFieldSchema = (currentFieldSchema as z.ZodAny).refine(file => file !== undefined, { message: `${field.label} আবশ্যক` });
        } else {
          currentFieldSchema = (currentFieldSchema as z.ZodAny).optional();
        }
        break;
      case "pin-selector":
        currentFieldSchema = z.array(z.string());
        if (field.mandatory) {
          currentFieldSchema = (currentFieldSchema as z.ZodArray<z.ZodString>).min(1, { message: `${field.label} আবশ্যক` });
        } else {
          currentFieldSchema = (currentFieldSchema as z.ZodArray<z.ZodString>).optional();
        }
        break;
      case "quantity-unit":
        currentFieldSchema = z.object({
          quantity: z.string().min(1, "পরিমান আবশ্যক"),
          unit: z.string().min(1, "ইউনিট আবশ্যক"),
        });
        if (!field.mandatory) {
          currentFieldSchema = (currentFieldSchema as z.ZodObject<{ quantity: z.ZodString, unit: z.ZodString }>).optional();
        }
        break;
      default:
        currentFieldSchema = z.any().optional();
    }

    schemaFields[field.name] = currentFieldSchema;

    // Handle conditional fields recursively
    if (field.conditionalFields) {
      field.conditionalFields.forEach(cond => {
        cond.fields.forEach(condField => {
          let currentCondFieldSchema: z.ZodTypeAny;
          switch (condField.type) {
            case "date":
              currentCondFieldSchema = z.date();
              if (!condField.mandatory) {
                currentCondFieldSchema = (currentCondFieldSchema as z.ZodDate).nullable().optional();
              }
              break;
            case "number":
              currentCondFieldSchema = z.coerce.number({ invalid_type_error: `${condField.label} অবশ্যই একটি সংখ্যা হতে হবে` });
              if (condField.mandatory) {
                currentCondFieldSchema = (currentCondFieldSchema as z.ZodNumber).min(1, { message: `${condField.label} অবশ্যই 0 এর বেশি হতে হবে` });
              } else {
                currentCondFieldSchema = (currentCondFieldSchema as z.ZodNumber).optional();
              }
              break;
            case "dropdown":
            case "text":
            case "textarea":
            case "time":
              currentCondFieldSchema = z.string();
              if (condField.mandatory) {
                currentCondFieldSchema = (currentCondFieldSchema as z.ZodString).min(1, { message: `${condField.label} আবশ্যক` });
              } else {
                currentCondFieldSchema = (currentCondFieldSchema as z.ZodString).optional();
              }
              break;
            case "file":
              currentCondFieldSchema = z.any();
              if (condField.mandatory) {
                currentCondFieldSchema = (currentCondFieldSchema as z.ZodAny).refine(file => file !== undefined, { message: `${condField.label} আবশ্যক` });
              } else {
                currentCondFieldSchema = (currentCondFieldSchema as z.ZodAny).optional();
              }
              break;
            case "pin-selector":
              currentCondFieldSchema = z.array(z.string());
              if (condField.mandatory) {
                currentCondFieldSchema = (currentCondFieldSchema as z.ZodArray<z.ZodString>).min(1, { message: `${condField.label} আবশ্যক` });
              } else {
                currentCondFieldSchema = (currentCondFieldSchema as z.ZodArray<z.ZodString>).optional();
              }
              break;
            case "quantity-unit":
              currentCondFieldSchema = z.object({
                quantity: z.string().min(1, "পরিমান আবশ্যক"),
                unit: z.string().min(1, "ইউনিট আবশ্যক"),
              });
              if (!condField.mandatory) {
                currentCondFieldSchema = (currentCondFieldSchema as z.ZodObject<{ quantity: z.ZodString, unit: z.ZodString }>).optional();
              }
              break;
            default:
              currentCondFieldSchema = z.any().optional();
          }
          schemaFields[condField.name] = currentCondFieldSchema;
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
  const defaultFormValues = useMemo(() => generateDefaultValues(voucherDetails.formFields), [voucherDetails.formFields]);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: defaultFormValues,
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
    form.reset(defaultFormValues); // Reset form to initial default values after submission
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
        name={field.name as Path<z.infer<typeof formSchema>>}
        render={({ field: formHookField }) => (
          <FormItem className="flex flex-col">
            <FormLabel className="text-gray-700 font-semibold">{field.label} {field.mandatory && <span className="text-red-500">*</span>}</FormLabel>
            <FormControl>
              {(() => { // IIFE to ensure only one child is passed to FormControl
                if (field.type === "text") {
                  return (
                    <Input
                      placeholder={field.placeholder}
                      {...formHookField}
                      value={formHookField.value || ""}
                      className="border-blue-300 focus:border-blue-500 focus:ring-blue-500"
                    />
                  );
                }
                if (field.type === "number") {
                  return (
                    <Input
                      type="number"
                      placeholder={field.placeholder}
                      {...formHookField}
                      value={formHookField.value === undefined || formHookField.value === null ? "" : String(formHookField.value)}
                      onChange={(e) => formHookField.onChange(e.target.value ? parseFloat(e.target.value) : undefined)}
                      className="border-blue-300 focus:border-blue-500 focus:ring-blue-500"
                    />
                  );
                }
                if (field.type === "textarea") {
                  return (
                    <Textarea
                      placeholder={field.placeholder}
                      {...formHookField}
                      value={formHookField.value || ""}
                      className="border-blue-300 focus:border-blue-500 focus:ring-blue-500"
                    />
                  );
                }
                if (field.type === "dropdown" && field.name === "branchId") {
                  return (
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
                  );
                }
                if (field.type === "dropdown" && field.name !== "branchId") {
                  return (
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
                  );
                }
                if (field.type === "date") {
                  return (
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
                          {formHookField.value ? format(formHookField.value as Date, "dd MMM, yyyy") : <span>তারিখ নির্বাচন করুন</span>}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={formHookField.value as Date | null | undefined}
                          onSelect={formHookField.onChange}
                          initialFocus
                          toDate={new Date()} 
                        />
                      </PopoverContent>
                    </Popover>
                  );
                }
                if (field.type === "time") {
                  return (
                    <Input
                      type="time"
                      {...formHookField}
                      value={formHookField.value || ""}
                      className="border-blue-300 focus:border-blue-500 focus:ring-blue-500"
                    />
                  );
                }
                if (field.type === "file") {
                  return (
                    <Input
                      type="file"
                      onChange={(e) => formHookField.onChange(e.target.files ? e.target.files[0] : undefined)}
                      className="border-blue-300 focus:border-blue-500 focus:ring-blue-500"
                    />
                  );
                }
                if (field.type === "pin-selector") {
                  return (
                    <PinSelector
                      label={field.label}
                      selectedPins={formHookField.value || []}
                      onSelectPins={formHookField.onChange}
                      allowMultiplePins={field.allowMultiplePins}
                    />
                  );
                }
                if (field.type === "quantity-unit") {
                  return (
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
                  );
                }
                return null; // Fallback if no type matches
              })()}
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