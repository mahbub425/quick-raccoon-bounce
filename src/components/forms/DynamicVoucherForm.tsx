import React, { useMemo, useImperativeHandle, forwardRef, useEffect } from "react";
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
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { DUMMY_INSTITUTIONS, DUMMY_PROGRAM_SESSIONS, DUMMY_PUBLICITY_LOCATIONS, DUMMY_VOUCHER_TYPES } from "@/data/dummyData";
import { cn } from "@/lib/utils";
import { FormField as FormFieldType, VoucherType } from "@/types";
import PinSelector from "@/components/PinSelector";
import { useCart } from "@/context/CartContext";
import { toast } from "sonner";
import AutosuggestInput from "@/components/AutosuggestInput";

interface DynamicVoucherFormProps {
  voucherTypeId: string;
  onFormSubmit?: (data: any) => void; // This will be used when parent wants to handle submission
  hideSubmitButton?: boolean; // New prop to hide the submit button
  initialData?: any; // New prop for pre-filling form data for editing
}

// Define the ref type for the parent component
export interface DynamicVoucherFormRef {
  getValues: () => any;
  trigger: (name?: Path<any> | Path<any>[]) => Promise<boolean>;
  reset: (values?: any) => void;
  control: any; // Expose control for useWatch in parent if needed
}

// Helper to get voucher details and form fields
const getVoucherDetails = (id: string): VoucherType | undefined => {
  const allVouchers = DUMMY_VOUCHER_TYPES.flatMap(v => v.type === 'multi' && v.subTypes ? [v, ...v.subTypes] : [v]);
  return allVouchers.find(v => v.id === id);
};

// Helper to generate default values based on form fields (recursive)
const generateDefaultValues = (formFields: FormFieldType[]) => {
  const defaults: { [key: string]: any } = {};

  const processFields = (fields: FormFieldType[]) => {
    fields.forEach(field => {
      if (field.type === 'date') {
        defaults[field.name] = null;
      } else if (field.type === 'number') {
        defaults[field.name] = undefined;
      } else if (field.type === 'pin-selector') {
        defaults[field.name] = [];
      } else if (field.type === 'quantity-unit') {
        defaults[field.name] = { quantity: "", unit: "" };
      } else if (field.type === 'file') {
        defaults[field.name] = undefined;
      } else {
        defaults[field.name] = "";
      }

      if (field.conditionalFields) {
        field.conditionalFields.forEach(cond => {
          processFields(cond.fields);
        });
      }
    });
  };

  processFields(formFields);
  return defaults;
};

// Dynamic Zod schema generation (recursive)
const createSchema = (fields: FormFieldType[], currentFormValues: any) => {
  const schemaFields: { [key: string]: z.ZodTypeAny } = {};

  const addFieldToSchema = (field: FormFieldType) => {
    let currentFieldSchema: z.ZodTypeAny;

    switch (field.type) {
      case "date":
        currentFieldSchema = z.date({ invalid_type_error: `${field.label} অবশ্যই একটি তারিখ হতে হবে` });
        if (field.mandatory) {
          currentFieldSchema = (currentFieldSchema as z.ZodDate).nullable().refine(val => val !== null, { message: `${field.label} আবশ্যক` });
        } else {
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

        if (field.maxAmountRules && field.name === "amount" && currentFormValues.shift) {
          const maxAmount = field.maxAmountRules[currentFormValues.shift];
          if (maxAmount !== undefined) {
            currentFieldSchema = (currentFieldSchema as z.ZodNumber).refine(
              (val) => val === undefined || val <= maxAmount,
              {
                message: `সর্বোচ্চ টাকার পরিমাণ ${maxAmount} টাকা।`,
              }
            );
          }
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
          currentFieldSchema = (currentFieldSchema as z.ZodString).optional().or(z.literal(""));
        }
        break;
      case "file":
        currentFieldSchema = z.any();
        if (field.mandatory) {
          currentFieldSchema = (currentFieldSchema as z.ZodAny).refine(file => file !== undefined && file !== null, { message: `${field.label} আবশ্যক` });
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
        if (field.mandatory) {
          currentFieldSchema = (currentFieldSchema as z.ZodObject<{ quantity: z.ZodString, unit: z.ZodString }>).refine(
            (val) => val.quantity !== "" && val.unit !== "",
            { message: `${field.label} এর পরিমান ও ইউনিট উভয়ই আবশ্যক` }
          );
        } else {
          currentFieldSchema = (currentFieldSchema as z.ZodObject<{ quantity: z.ZodString, unit: z.ZodString }>).optional();
        }
        break;
      default:
        currentFieldSchema = z.any().optional();
    }

    schemaFields[field.name] = currentFieldSchema;

    if (field.conditionalFields) {
      const currentFieldValue = currentFormValues[field.name];
      field.conditionalFields.forEach(cond => {
        if (currentFieldValue === cond.value) {
          cond.fields.forEach(condField => addFieldToSchema(condField));
        }
      });
    }
  };

  fields.forEach(addFieldToSchema);

  return z.object(schemaFields);
};

const DynamicVoucherForm = forwardRef<DynamicVoucherFormRef, DynamicVoucherFormProps>(
  ({ voucherTypeId, onFormSubmit, hideSubmitButton, initialData }, ref) => {
    const voucherDetails = getVoucherDetails(voucherTypeId);
    const { addToCart } = useCart();

    if (!voucherDetails || !voucherDetails.formFields) {
      return <div className="text-center text-red-500">ভাউচার ফর্মের তথ্য পাওয়া যায়নি।</div>;
    }

    const defaultFormValues = useMemo(() => generateDefaultValues(voucherDetails.formFields), [voucherDetails.formFields]);

    const form = useForm<z.infer<z.ZodObject<any>>>({
      defaultValues: initialData ? {
        ...defaultFormValues,
        ...initialData,
        // Special handling for date type if it's a string from initialData
        date: initialData.date ? new Date(initialData.date) : null,
      } : defaultFormValues,
      resolver: (values, context, options) => {
        const dynamicSchema = createSchema(voucherDetails.formFields, values);
        return zodResolver(dynamicSchema)(values, context, options);
      },
    });

    // Reset form when voucherTypeId changes or initialData changes (for edit mode)
    useEffect(() => {
      form.reset(initialData ? {
        ...defaultFormValues,
        ...initialData,
        date: initialData.date ? new Date(initialData.date) : null,
      } : defaultFormValues);
    }, [voucherTypeId, initialData, form, defaultFormValues]);


    // Expose form methods to parent via ref
    useImperativeHandle(ref, () => ({
      getValues: form.getValues,
      trigger: form.trigger,
      reset: form.reset,
      control: form.control,
    }));

    const selectedInstitutionId = form.watch("institutionId");

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

    const programSessionOptions = useMemo(() => {
      if (!selectedInstitutionId || !DUMMY_PROGRAM_SESSIONS[selectedInstitutionId]) {
        return [];
      }
      return DUMMY_PROGRAM_SESSIONS[selectedInstitutionId].map(session => ({
        value: session.id,
        label: session.name,
      }));
    }, [selectedInstitutionId]);


    const onSubmit = async (data: z.infer<z.ZodObject<any>>) => {
      if (onFormSubmit) {
        // If onFormSubmit is provided, parent wants to handle the submission
        // This form's data is passed to the parent. Parent will handle reset.
        onFormSubmit(data);
      } else {
        // Default behavior: add to cart directly
        addToCart({
          voucherTypeId: voucherDetails.id,
          voucherHeading: voucherDetails.heading,
          data: data,
        });
        toast.success(`${voucherDetails.heading} কার্টে যোগ করা হয়েছে!`);
        form.reset(defaultFormValues); // Only reset if this component handles addToCart
      }
    };

    const onError = (errors: any) => {
      console.error("Form validation errors:", errors);
      toast.error("ফর্ম পূরণে ত্রুটি আছে। অনুগ্রহ করে সকল আবশ্যক ফিল্ড পূরণ করুন।");
    };

    const renderField = (field: FormFieldType) => {
      const isVisible = !field.dependency || (form.watch(field.dependency.field) === field.dependency.value || field.dependency.value === "*");

      if (!isVisible) return null;

      // Determine if the field should span two columns
      const shouldSpanTwoColumns = field.type === "textarea" || field.type === "file";
      const colSpanClass = shouldSpanTwoColumns ? "md:col-span-2" : "md:col-span-1";

      return (
        <div key={field.name} className={colSpanClass}>
          <FormField
            control={form.control}
            name={field.name as Path<z.infer<z.ZodObject<any>>>}
            render={({ field: formHookField }) => (
              <FormItem className="flex flex-col">
                <FormLabel className="text-gray-700 font-semibold">{field.label} {field.mandatory && <span className="text-red-500">*</span>}</FormLabel>
                <FormControl>
                  {(() => {
                    if (field.type === "text") {
                      if (field.options && field.options.length > 0) {
                        return (
                          <AutosuggestInput
                            placeholder={field.placeholder}
                            value={formHookField.value || ""}
                            onChange={formHookField.onChange}
                            options={field.options}
                            className="border-blue-300 focus:border-blue-500 focus:ring-blue-500"
                          />
                        );
                      }
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
                    if (field.type === "dropdown") {
                      let optionsToRender = field.options;
                      if (field.name === "branchId") {
                        optionsToRender = branchOptions;
                      } else if (field.name === "programSessionId") {
                        optionsToRender = programSessionOptions;
                      }
                      return (
                        <Select onValueChange={formHookField.onChange} value={formHookField.value || ""}>
                          <SelectTrigger className="border-blue-300 focus:border-blue-500 focus:ring-blue-500">
                            <SelectValue placeholder={field.label} />
                          </SelectTrigger>
                          <SelectContent>
                            {optionsToRender?.map((option) => (
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
                    return null;
                  })()}
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          {field.conditionalFields &&
            field.conditionalFields.map((cond) =>
              form.watch(field.name) === cond.value
                ? cond.fields.map((nestedCondField) => renderField(nestedCondField))
                : null
            )}
        </div>
      );
    };

    return (
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit, onError)} className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 bg-white rounded-lg shadow-lg border border-blue-200">
          <h2 className="text-3xl font-bold text-blue-800 mb-6 text-center md:col-span-2">{voucherDetails.heading}</h2>
          {voucherDetails.formFields.map((field) => renderField(field))}
          {!hideSubmitButton && ( // Conditionally render submit button
            <Button type="submit" className="w-full bg-gradient-to-r from-blue-600 to-purple-700 hover:from-blue-700 hover:to-purple-800 text-white text-lg py-3 rounded-lg transition-all duration-300 ease-in-out transform hover:scale-105 md:col-span-2">
              {initialData ? "আপডেট করুন" : "কার্টে যোগ করুন"}
            </Button>
          )}
        </form>
      </Form>
    );
  }
);

export default DynamicVoucherForm;