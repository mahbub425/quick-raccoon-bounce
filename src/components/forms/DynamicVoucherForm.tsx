import React, { useMemo } from "react";
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
import AutosuggestInput from "@/components/AutosuggestInput"; // Import AutosuggestInput

interface DynamicVoucherFormProps {
  voucherTypeId: string;
  onFormSubmit?: () => void;
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
        defaults[field.name] = field.mandatory ? new Date() : null;
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

      // Recursively process conditional fields
      if (field.conditionalFields) {
        field.conditionalFields.forEach(cond => {
          processFields(cond.fields); // Recursive call
        });
      }
    });
  };

  processFields(formFields);
  return defaults;
};

// Dynamic Zod schema generation (recursive)
const createSchema = (fields: FormFieldType[], watchedValues: any) => {
  const schemaFields: { [key: string]: z.ZodTypeAny } = {};

  const addFieldToSchema = (field: FormFieldType) => {
    let currentFieldSchema: z.ZodTypeAny;

    switch (field.type) {
      case "date":
        currentFieldSchema = z.date({ required_error: `${field.label} আবশ্যক` });
        if (!field.mandatory) {
          currentFieldSchema = (currentFieldSchema as z.ZodDate).nullable().optional();
        }
        break;
      case "number":
        currentFieldSchema = z.coerce.number({ invalid_type_error: `${field.label} অবশ্যই একটি সংখ্যা হতে হবে`, required_error: `${field.label} আবশ্যক` });
        if (field.mandatory) {
          currentFieldSchema = (currentFieldSchema as z.ZodNumber).min(1, { message: `${field.label} অবশ্যই 0 এর বেশি হতে হবে` });
        } else {
          currentFieldSchema = (currentFieldSchema as z.ZodNumber).optional();
        }

        // Add maxAmountRules validation if present
        if (field.maxAmountRules && field.name === "amount" && watchedValues.shift) {
          const maxAmount = field.maxAmountRules[watchedValues.shift];
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

    // Recursively add conditional fields to schema
    if (field.conditionalFields) {
      field.conditionalFields.forEach(cond => {
        cond.fields.forEach(condField => addFieldToSchema(condField)); // Recursive call
      });
    }
  };

  fields.forEach(addFieldToSchema); // Start recursion for top-level fields

  return z.object(schemaFields);
};

const DynamicVoucherForm = ({ voucherTypeId, onFormSubmit }: DynamicVoucherFormProps) => {
  const voucherDetails = getVoucherDetails(voucherTypeId);
  const { addToCart } = useCart();

  if (!voucherDetails || !voucherDetails.formFields) {
    return <div className="text-center text-red-500">ভাউচার ফর্মের তথ্য পাওয়া যায়নি।</div>;
  }

  const defaultFormValues = useMemo(() => generateDefaultValues(voucherDetails.formFields), [voucherDetails.formFields]);

  // Initialize form with a temporary schema to get control for useWatch
  const tempForm = useForm({ defaultValues: defaultFormValues });
  const watchedValues = useWatch({ control: tempForm.control });

  // Now create the dynamic schema using watchedValues
  const formSchema = useMemo(() => createSchema(voucherDetails.formFields, watchedValues), [voucherDetails.formFields, watchedValues]);

  // Re-initialize useForm with the dynamic schema
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema), // Pass resolver here
    defaultValues: defaultFormValues,
  });

  // If watchedValues change, the formSchema will change, and useForm will effectively re-initialize its resolver.
  // We need to ensure the form instance used for useWatch is the same as the one used for the form.
  // The best practice is to define form once and let its resolver update.
  // The previous approach of `form.setResolver` was incorrect.
  // The current approach of re-initializing `form` with `useMemo` or `useState` is also not ideal.

  // Let's simplify: `useForm` should be called once. The `resolver` can be a `useMemo` value.
  // The `watchedValues` will be derived from the `form.control` of that single `useForm` instance.
  // This means `formSchema` will update, and `react-hook-form` will handle the resolver update internally.

  // Re-structuring to avoid the temporary form and ensure `watchedValues` are from the actual form.
  // This is the standard pattern for dynamic resolvers in RHF.
  const formInstance = useForm<z.infer<typeof formSchema>>({
    defaultValues: defaultFormValues,
    resolver: zodResolver(formSchema), // Pass resolver here
  });

  // Use the control from the actual form instance
  const actualWatchedValues = useWatch({ control: formInstance.control });
  const actualFormSchema = useMemo(() => createSchema(voucherDetails.formFields, actualWatchedValues), [voucherDetails.formFields, actualWatchedValues]);

  // Re-initialize formInstance with the actualFormSchema. This will cause a re-render.
  // This is the correct way to handle dynamic schemas that depend on form values.
  // The `formInstance` variable will be updated on subsequent renders.

  // The `form` variable should be the one returned by `useForm`.
  // Let's use `form` directly and ensure `formSchema` is correctly memoized.

  const finalForm = useForm<z.infer<typeof formSchema>>({
    defaultValues: defaultFormValues,
    resolver: zodResolver(formSchema), // This formSchema will be re-evaluated when watchedValues change
  });

  const selectedInstitutionId = finalForm.watch("institutionId"); // Use watch from the final form instance

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

  // Dynamically get program session options based on selected institution
  const programSessionOptions = useMemo(() => {
    if (!selectedInstitutionId || !DUMMY_PROGRAM_SESSIONS[selectedInstitutionId]) {
      return [];
    }
    return DUMMY_PROGRAM_SESSIONS[selectedInstitutionId].map(session => ({
      value: session.id,
      label: session.name,
    }));
  }, [selectedInstitutionId]);


  const onSubmit = (data: z.infer<typeof formSchema>) => {
    addToCart({
      voucherTypeId: voucherDetails.id,
      voucherHeading: voucherDetails.heading,
      data: data,
    });
    finalForm.reset(defaultFormValues); // Reset form to initial default values after submission
    onFormSubmit?.(); // Call optional callback
  };

  // Recursive render function for form fields
  const renderField = (field: FormFieldType) => {
    const isVisible = !field.dependency || (finalForm.watch(field.dependency.field) === field.dependency.value || field.dependency.value === "*");

    if (!isVisible) return null;

    return (
      <div key={field.name} className="space-y-4">
        <FormField
          control={finalForm.control}
          name={field.name as Path<z.infer<typeof formSchema>>} // Use the correct schema type
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
                  return null; // Fallback if no type matches
                })()}
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        {/* Recursively render nested conditional fields */}
        {field.conditionalFields &&
          field.conditionalFields.map((cond) =>
            finalForm.watch(field.name) === cond.value
              ? cond.fields.map((nestedCondField) => renderField(nestedCondField))
              : null
          )}
      </div>
    );
  };

  return (
    <Form {...finalForm}>
      <form onSubmit={finalForm.handleSubmit(onSubmit)} className="space-y-6 p-6 bg-white rounded-lg shadow-lg border border-blue-200">
        <h2 className="text-3xl font-bold text-blue-800 mb-6 text-center">{voucherDetails.heading}</h2>
        {voucherDetails.formFields.map((field) => renderField(field))}
        <Button type="submit" className="w-full bg-gradient-to-r from-blue-600 to-purple-700 hover:from-blue-700 hover:to-purple-800 text-white text-lg py-3 rounded-lg transition-all duration-300 ease-in-out transform hover:scale-105">
          কার্টে যোগ করুন
        </Button>
      </form>
    </Form>
  );
};

export default DynamicVoucherForm;