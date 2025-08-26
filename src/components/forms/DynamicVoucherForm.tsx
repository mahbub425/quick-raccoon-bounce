import React, { useMemo, useImperativeHandle, forwardRef, useEffect } from "react";
import { useForm, Path } from "react-hook-form";
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
import { DUMMY_INSTITUTIONS, DUMMY_PROGRAM_SESSIONS, DUMMY_PUBLICITY_LOCATIONS, DUMMY_VOUCHER_TYPES, OFFICE_SUPPLIES_ITEM_OPTIONS, CLEANING_SUPPLIES_ITEM_OPTIONS, KITCHEN_HOUSEHOLD_ITEM_OPTIONS, RENTAL_UTILITY_EXPENSE_CATEGORIES, REPAIR_ITEM_OPTIONS } from "@/data/dummyData";
import { cn } from "@/lib/utils";
import { FormField as FormFieldType, VoucherType } from "@/types";
import PinSelector from "@/components/PinSelector";
import { useCart } from "@/context/CartContext";
import { toast } from "sonner";
import AutosuggestInput from "@/components/AutosuggestInput";
import MonthPicker from "@/components/MonthPicker"; // Import the new MonthPicker

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
        defaults[field.name] = null; // Changed from undefined to null for consistency
      } else if (field.type === 'pin-selector') {
        defaults[field.name] = [];
      } else if (field.type === 'quantity-unit') {
        defaults[field.name] = { quantity: "", unit: "" };
      } else if (field.type === 'file') {
        defaults[field.name] = undefined; // Store filename string or undefined
      } else if (field.type === 'month-picker') { // Handle new month-picker type
        defaults[field.name] = null;
      }
      else {
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
const createSchema = (fields: FormFieldType[], currentFormValues: any, voucherTypeId: string) => {
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
      case "month-picker": // Handle new month-picker type
        currentFieldSchema = z.date({ invalid_type_error: `${field.label} অবশ্যই একটি মাস হতে হবে` });
        if (field.mandatory) {
          currentFieldSchema = (currentFieldSchema as z.ZodDate).nullable().refine(val => val !== null, { message: `${field.label} আবশ্যক` });
        } else {
          currentFieldSchema = (currentFieldSchema as z.ZodDate).nullable().optional();
        }
        break;
      case "number":
        let baseNumberSchema;

        if (field.mandatory) {
          baseNumberSchema = z.coerce.number({ invalid_type_error: `${field.label} অবশ্যই একটি সংখ্যা হতে হবে` }).min(1, { message: `${field.label} অবশ্যই 0 এর বেশি হতে হবে` });
        } else {
          baseNumberSchema = z.coerce.number({ invalid_type_error: `${field.label} অবশ্যই একটি সংখ্যা হতে হবে` }).nullable();
        }

        if (field.maxAmountRules && field.name === "amount" && currentFormValues.shift) {
          const maxAmount = field.maxAmountRules[currentFormValues.shift];
          if (maxAmount !== undefined) {
            currentFieldSchema = baseNumberSchema.refine(
              (val) => val === null || val <= maxAmount, // Allow null
              {
                message: `আপনি টাকার পরিমান বেশি দেখিয়েছেন`, // Updated message
              }
            );
          } else {
            currentFieldSchema = baseNumberSchema; // If no maxAmount, use the base schema
          }
        } else {
          currentFieldSchema = baseNumberSchema; // If no maxAmountRules, use the base schema
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

        // Dynamic validation for itemName in office-supplies-stationery, cleaning-supplies, kitchen-household-items, repair
        if (field.name === "itemName") {
          const currentExpenseTitle = currentFormValues.expenseTitle;
          let dynamicItemOptions: { value: string; label: string }[] = [];

          if (voucherTypeId === "office-supplies-stationery") {
            dynamicItemOptions = currentExpenseTitle ? OFFICE_SUPPLIES_ITEM_OPTIONS[currentExpenseTitle] || [] : [];
          } else if (voucherTypeId === "cleaning-supplies") {
            dynamicItemOptions = currentExpenseTitle ? CLEANING_SUPPLIES_ITEM_OPTIONS[currentExpenseTitle] || [] : [];
          } else if (voucherTypeId === "kitchen-household-items") {
            dynamicItemOptions = currentExpenseTitle ? KITCHEN_HOUSEHOLD_ITEM_OPTIONS[currentExpenseTitle] || [] : [];
          } else if (voucherTypeId === "repair") { // NEW: Add repair logic
            dynamicItemOptions = currentExpenseTitle ? REPAIR_ITEM_OPTIONS[currentExpenseTitle] || [] : [];
          }
          
          const allowedValues = dynamicItemOptions.map(opt => opt.value);

          if (field.mandatory) {
            currentFieldSchema = (currentFieldSchema as z.ZodString)
              .min(1, { message: `${field.label} আবশ্যক` })
              .refine(val => allowedValues.includes(val), { message: `${field.label} একটি বৈধ অপশন হতে হবে` });
          }
        }
        // Dynamic validation for expenseCategory in rental-utility and entertainment
        if ((voucherTypeId === "rental-utility" || voucherTypeId === "entertainment") && field.name === "expenseCategory") {
          const currentExpenseTitle = currentFormValues.expenseTitle;
          let dynamicCategoryOptions: { value: string; label: string }[] = [];
          if (voucherTypeId === "rental-utility" && currentExpenseTitle && RENTAL_UTILITY_EXPENSE_CATEGORIES[currentExpenseTitle]) {
            dynamicCategoryOptions = RENTAL_UTILITY_EXPENSE_CATEGORIES[currentExpenseTitle];
          } else if (voucherTypeId === "entertainment" && currentExpenseTitle) {
            const entertainmentVoucherDetails = getVoucherDetails("entertainment");
            const expenseTitleField = entertainmentVoucherDetails?.formFields?.find(f => f.name === 'expenseTitle');
            // In the new structure, expenseCategory is a direct field, but its options are still derived from conditional logic
            // So we need to manually construct the options based on expenseTitle
            if (currentExpenseTitle === "Myself") {
              dynamicCategoryOptions = [
                { value: "Breakfast", label: "Breakfast (সকালের নাস্তা)" },
                { value: "Lunch", label: "Lunch (দুপুরের খাবার)" },
                { value: "Afternoon Snacks", label: "Afternoon Snacks (বিকালের নাস্তা)" },
                { value: "Dinner", label: "Dinner (রাতের খাবার)" },
                { value: "Iftar", label: "Iftar (ইফতার)" },
                { value: "Sehri", label: "Sehri (সেহরি)" },
              ];
            } else if (currentExpenseTitle === "Staff") {
              dynamicCategoryOptions = [
                { value: "Afternoon Snacks", label: "Afternoon Snacks (বিকালের নাস্তা)" },
                { value: "Special Occasion", label: "Special Occasion (বিশেষ উপলক্ষ)" },
                { value: "Iftar", label: "Iftar (ইফতার)" },
              ];
            } else if (currentExpenseTitle === "Teacher") {
              dynamicCategoryOptions = [
                { value: "Breakfast", label: "Breakfast (সকালের নাস্তা)" },
                { value: "Afternoon Snacks", label: "Afternoon Snacks (বিকালের নাস্তা)" },
                { value: "Regular Lunch & Dinner", label: "Regular Lunch & Dinner (দুপুর ও রাতের প্রতিদিনের খাবার)" },
                { value: "Special Lunch & Dinner", label: "Special Lunch & Dinner (দুপুর ও রাতের বিশেষ খাবার)" },
                { value: "Special Occasion", label: "Special Occasion (বিশেষ উপলক্ষ)" },
              ];
            } else if (currentExpenseTitle === "Director & Guest") {
              dynamicCategoryOptions = [
                { value: "Director", label: "Director (পরিচালক)" },
                { value: "Guest", label: "Guest (অতিথি)" },
              ];
            } else if (currentExpenseTitle === "Student & Guardian") {
              dynamicCategoryOptions = [
                { value: "Student", label: "Student (শিক্ষার্থী)" },
                { value: "Guardian", label: "Guardian (অভিভাবক)" },
              ];
            } else if (currentExpenseTitle === "Tea & Tea Materials") {
              dynamicCategoryOptions = [
                { value: "Tea Bag", label: "Tea Bag (টি ব্যাগ)" },
                { value: "Sugar", label: "Sugar (চিনি)" },
                { value: "Ginger", label: "Ginger (আদা)" },
                { value: "Lemon", label: "Lemon (লেবু)" },
                { value: "Spice", label: "Spice (মসলা)" },
              ];
            } else if (currentExpenseTitle === "Drinking Water") {
              dynamicCategoryOptions = [
                { value: "Safe International", label: "Safe International" },
                { value: "Ma Enterprise", label: "Ma Enterprise" },
                { value: "Others", label: "Others" },
              ];
            } else if (currentExpenseTitle === "Others") {
              dynamicCategoryOptions = [
                { value: "Gas for Cooking", label: "Gas for Cooking (রান্নার গ্যাস)" },
                { value: "Meeting", label: "Meeting (আলোচনা সভা)" },
                { value: "Tablighi Jamat", label: "Tablighi Jamat (তাবলীগ জামাত)" },
              ];
            }
          }
          const allowedValues = dynamicCategoryOptions.map(opt => opt.value);

          if (field.mandatory) {
            currentFieldSchema = (currentFieldSchema as z.ZodString)
              .min(1, { message: `${field.label} আবশ্যক` })
              .refine(val => allowedValues.includes(val), { message: `${field.label} একটি বৈধ অপশন হতে হবে` });
          }
        }
        break;
      case "file":
        currentFieldSchema = z.string().optional(); // Expecting filename string or undefined
        if (field.mandatory) {
          currentFieldSchema = (currentFieldSchema as z.ZodString).min(1, { message: `${field.label} আবশ্যক` });
        }
        break;
      case "pin-selector":
        // Special validation logic for 'selectedPins' in 'entertainment' voucher
        if (voucherTypeId === "entertainment" && field.name === "selectedPins") {
          const currentExpenseTitle = currentFormValues.expenseTitle;
          const currentExpenseCategory = currentFormValues.expenseCategory;

          const shouldBeMandatory = (currentExpenseTitle === "Staff" && (currentExpenseCategory === "Afternoon Snacks" || currentExpenseCategory === "Iftar")) ||
                                   (currentExpenseTitle === "Teacher" && (currentExpenseCategory === "Breakfast" || currentExpenseCategory === "Afternoon Snacks"));

          currentFieldSchema = z.array(z.string());
          if (shouldBeMandatory) {
            currentFieldSchema = (currentFieldSchema as z.ZodArray<z.ZodString>).min(1, { message: `${field.label} আবশ্যক` });
          } else {
            currentFieldSchema = (currentFieldSchema as z.ZodArray<z.ZodString>).optional();
          }
        } else {
          currentFieldSchema = z.array(z.string());
          if (field.mandatory) {
            currentFieldSchema = (currentFieldSchema as z.ZodArray<z.ZodString>).min(1, { message: `${field.label} আবশ্যক` });
          } else {
            currentFieldSchema = (currentFieldSchema as z.ZodArray<z.ZodString>).optional();
          }
        }
        break;
      case "quantity-unit":
        // Special validation logic for 'quantityUnit' fields in 'entertainment' voucher
        if (voucherTypeId === "entertainment" && (field.name === "quantityUnitTea" || field.name === "quantityUnitWater" || field.name === "quantityUnitOthers")) {
          const currentExpenseTitle = currentFormValues.expenseTitle;
          const currentExpenseCategory = currentFormValues.expenseCategory;

          let shouldBeMandatory = false;
          if (field.name === "quantityUnitTea") {
            shouldBeMandatory = currentExpenseTitle === "Tea & Tea Materials" && (currentExpenseCategory === "Tea Bag" || currentExpenseCategory === "Sugar" || currentExpenseCategory === "Ginger" || currentExpenseCategory === "Lemon");
          } else if (field.name === "quantityUnitWater") {
            shouldBeMandatory = currentExpenseTitle === "Drinking Water" && (currentExpenseCategory === "Safe International" || currentExpenseCategory === "Ma Enterprise" || currentExpenseCategory === "Others");
          } else if (field.name === "quantityUnitOthers") {
            shouldBeMandatory = currentExpenseTitle === "Others" && currentExpenseCategory === "Gas for Cooking";
          }

          currentFieldSchema = z.object({
            quantity: z.string().min(1, "পরিমান আবশ্যক"),
            unit: z.string().min(1, "ইউনিট আবশ্যক"),
          });
          if (shouldBeMandatory) {
            currentFieldSchema = (currentFieldSchema as z.ZodObject<{ quantity: z.ZodString, unit: z.ZodString }>).refine(
              (val) => val.quantity !== "" && val.unit !== "",
              { message: `${field.label} এর পরিমান ও ইউনিট উভয়ই আবশ্যক` }
            );
          } else {
            currentFieldSchema = (currentFieldSchema as z.ZodObject<{ quantity: z.ZodString, unit: z.ZodString }>).optional();
          }
        } else {
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
        }
        break;
      default:
        // Special validation logic for 'guestName', 'studentName', 'guardianName' in 'entertainment' voucher
        if (voucherTypeId === "entertainment" && (field.name === "guestName" || field.name === "studentName" || field.name === "guardianName")) {
          const currentExpenseTitle = currentFormValues.expenseTitle;
          const currentExpenseCategory = currentFormValues.expenseCategory;

          let shouldBeMandatory = false;
          if (field.name === "guestName") {
            shouldBeMandatory = currentExpenseTitle === "Director & Guest" && currentExpenseCategory === "Guest";
          } else if (field.name === "studentName") {
            shouldBeMandatory = currentExpenseTitle === "Student & Guardian" && currentExpenseCategory === "Student";
          } else if (field.name === "guardianName") {
            shouldBeMandatory = currentExpenseTitle === "Student & Guardian" && currentExpenseCategory === "Guardian";
          }

          currentFieldSchema = z.string();
          if (shouldBeMandatory) {
            currentFieldSchema = (currentFieldSchema as z.ZodString).min(1, { message: `${field.label} আবশ্যক` });
          } else {
            currentFieldSchema = (currentFieldSchema as z.ZodString).optional().or(z.literal(""));
          }
        } else {
          currentFieldSchema = z.any().optional();
        }
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
        dateNeeded: initialData.dateNeeded ? new Date(initialData.dateNeeded) : null, // Handle dateNeeded
        monthName: initialData.monthName ? new Date(initialData.monthName) : null, // Handle monthName
      } : defaultFormValues,
      resolver: (values, context, options) => {
        const dynamicSchema = createSchema(voucherDetails.formFields, values, voucherTypeId);
        return zodResolver(dynamicSchema)(values, context, options);
      },
    });

    // Reset form when voucherTypeId changes or initialData changes (for edit mode)
    useEffect(() => {
      form.reset(initialData ? {
        ...defaultFormValues,
        ...initialData,
        date: initialData.date ? new Date(initialData.date) : null,
        dateNeeded: initialData.dateNeeded ? new Date(initialData.dateNeeded) : null, // Handle dateNeeded
        monthName: initialData.monthName ? new Date(initialData.monthName) : null, // Handle monthName
      } : defaultFormValues);
    }, [voucherTypeId, initialData, defaultFormValues]);


    // Expose form methods to parent via ref
    useImperativeHandle(ref, () => ({
      getValues: form.getValues,
      trigger: form.trigger,
      reset: form.reset,
      control: form.control,
    }));

    const selectedInstitutionId = form.watch("institutionId");
    const selectedExpenseTitle = form.watch("expenseTitle"); // Watch expenseTitle for dynamic options
    const selectedExpenseCategory = form.watch("expenseCategory"); // Watch expenseCategory for conditional fields

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

    const expenseCategoryOptions = useMemo(() => {
      if (!selectedExpenseTitle) {
        return [];
      }
      if (voucherTypeId === "rental-utility") {
        return RENTAL_UTILITY_EXPENSE_CATEGORIES[selectedExpenseTitle] || [];
      } else if (voucherTypeId === "entertainment") {
        if (selectedExpenseTitle === "Myself") {
          return [
            { value: "Breakfast", label: "Breakfast (সকালের নাস্তা)" },
            { value: "Lunch", label: "Lunch (দুপুরের খাবার)" },
            { value: "Afternoon Snacks", label: "Afternoon Snacks (বিকালের নাস্তা)" },
            { value: "Dinner", label: "Dinner (রাতের খাবার)" },
            { value: "Iftar", label: "Iftar (ইফতার)" },
            { value: "Sehri", label: "Sehri (সেহরি)" },
          ];
        } else if (selectedExpenseTitle === "Staff") {
          return [
            { value: "Afternoon Snacks", label: "Afternoon Snacks (বিকালের নাস্তা)" },
            { value: "Special Occasion", label: "Special Occasion (বিশেষ উপলক্ষ)" },
            { value: "Iftar", label: "Iftar (ইফতার)" },
          ];
        } else if (selectedExpenseTitle === "Teacher") {
          return [
            { value: "Breakfast", label: "Breakfast (সকালের নাস্তা)" },
            { value: "Afternoon Snacks", label: "Afternoon Snacks (বিকালের নাস্তা)" },
            { value: "Regular Lunch & Dinner", label: "Regular Lunch & Dinner (দুপুর ও রাতের প্রতিদিনের খাবার)" },
            { value: "Special Lunch & Dinner", label: "Special Lunch & Dinner (দুপুর ও রাতের বিশেষ খাবার)" },
            { value: "Special Occasion", label: "Special Occasion (বিশেষ উপলক্ষ)" },
          ];
        } else if (selectedExpenseTitle === "Director & Guest") {
          return [
            { value: "Director", label: "Director (পরিচালক)" },
            { value: "Guest", label: "Guest (অতিথি)" },
          ];
        } else if (selectedExpenseTitle === "Student & Guardian") {
          return [
            { value: "Student", label: "Student (শিক্ষার্থী)" },
            { value: "Guardian", label: "Guardian (অভিভাবক)" },
          ];
        } else if (selectedExpenseTitle === "Tea & Tea Materials") {
          return [
            { value: "Tea Bag", label: "Tea Bag (টি ব্যাগ)" },
            { value: "Sugar", label: "Sugar (চিনি)" },
            { value: "Ginger", label: "Ginger (আদা)" },
            { value: "Lemon", label: "Lemon (লেবু)" },
            { value: "Spice", label: "Spice (মসলা)" },
          ];
        } else if (selectedExpenseTitle === "Drinking Water") {
          return [
            { value: "Safe International", label: "Safe International" },
            { value: "Ma Enterprise", label: "Ma Enterprise" },
            { value: "Others", label: "Others" },
          ];
        } else if (selectedExpenseTitle === "Others") {
          return [
            { value: "Gas for Cooking", label: "Gas for Cooking (রান্নার গ্যাস)" },
            { value: "Meeting", label: "Meeting (আলোচনা সভা)" },
            { value: "Tablighi Jamat", label: "Tablighi Jamat (তাবলীগ জামাত)" },
          ];
        }
      }
      return [];
    }, [voucherTypeId, selectedExpenseTitle]);


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
          voucherNumber: undefined, // Explicitly pass undefined to let CartContext generate
        });
        toast.success(`${voucherDetails.heading} কার্টে যোগ করা হয়েছে!`);
        form.reset(defaultFormValues); // Only reset if this component handles addToCart
      }
    };

    const onError = (errors: any) => {
      console.error("Form validation errors:", errors);
      toast.error("ফর্ম পূরণে ত্রুটি আছে। অনুগ্রহ করে সকল আবশ্যক ফিল্ড পূরণ করুন।");
    };

    // Helper to render a single FormField component (the actual input/select/etc.)
    const renderSingleFormFieldComponent = (field: FormFieldType) => {
      return (
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
                        onChange={(e) => {
                          const value = e.target.value;
                          formHookField.onChange(value === "" ? null : parseFloat(value)); // Set to null if empty
                        }}
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
                    } else if (voucherTypeId === "office-supplies-stationery" && field.name === "itemName") {
                      optionsToRender = selectedExpenseTitle ? OFFICE_SUPPLIES_ITEM_OPTIONS[selectedExpenseTitle] || [] : [];
                    } else if (voucherTypeId === "cleaning-supplies" && field.name === "itemName") {
                      optionsToRender = selectedExpenseTitle ? CLEANING_SUPPLIES_ITEM_OPTIONS[selectedExpenseTitle] || [] : [];
                    } else if (voucherTypeId === "kitchen-household-items" && field.name === "itemName") {
                      optionsToRender = selectedExpenseTitle ? KITCHEN_HOUSEHOLD_ITEM_OPTIONS[selectedExpenseTitle] || [] : [];
                    } else if (voucherTypeId === "repair" && field.name === "itemName") {
                      optionsToRender = selectedExpenseTitle ? REPAIR_ITEM_OPTIONS[selectedExpenseTitle] || [] : [];
                    } else if (field.name === "expenseCategory") { // Dynamic options for expenseCategory
                      optionsToRender = expenseCategoryOptions;
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
                  if (field.type === "month-picker") { // Render for month-picker
                    return (
                      <MonthPicker
                        value={formHookField.value as Date | null | undefined}
                        onChange={formHookField.onChange}
                        placeholder="মাস নির্বাচন করুন"
                        className="border-blue-300 focus:border-blue-500 focus:ring-blue-500"
                      />
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
                        onChange={(e) => formHookField.onChange(e.target.files ? e.target.files[0]?.name : undefined)} // Store filename
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
      );
    };

    // This is the main rendering function for a field, including its container and conditional children
    const renderField = (field: FormFieldType, index: number, array: FormFieldType[]) => {
      let isVisible = !field.dependency || (form.watch(field.dependency.field) === field.dependency.value || field.dependency.value === "*");

      // Special visibility logic for 'entertainment' voucher's conditional fields
      if (voucherTypeId === "entertainment") {
        const currentExpenseTitle = form.watch("expenseTitle");
        const currentExpenseCategory = form.watch("expenseCategory");

        if (field.name === "guestName") {
          isVisible = currentExpenseTitle === "Director & Guest" && currentExpenseCategory === "Guest";
        } else if (field.name === "studentName") {
          isVisible = currentExpenseTitle === "Student & Guardian" && currentExpenseCategory === "Student";
        } else if (field.name === "guardianName") {
          isVisible = currentExpenseTitle === "Student & Guardian" && currentExpenseCategory === "Guardian";
        } else if (field.name === "quantityUnitTea") {
          isVisible = currentExpenseTitle === "Tea & Tea Materials" && (currentExpenseCategory === "Tea Bag" || currentExpenseCategory === "Sugar" || currentExpenseCategory === "Ginger" || currentExpenseCategory === "Lemon");
        } else if (field.name === "quantityUnitWater") {
          isVisible = currentExpenseTitle === "Drinking Water" && (currentExpenseCategory === "Safe International" || currentExpenseCategory === "Ma Enterprise" || currentExpenseCategory === "Others");
        } else if (field.name === "quantityUnitOthers") {
          isVisible = currentExpenseTitle === "Others" && currentExpenseCategory === "Gas for Cooking";
        } else if (field.name === "selectedPins") {
          isVisible = (currentExpenseTitle === "Staff" && (currentExpenseCategory === "Afternoon Snacks" || currentExpenseCategory === "Iftar")) ||
                      (currentExpenseTitle === "Teacher" && (currentExpenseCategory === "Breakfast" || currentExpenseCategory === "Afternoon Snacks"));
        }
      }

      if (!isVisible) return null;

      // Special handling for "publicityLocation" followed by "startTime" and "endTime"
      if (field.name === "publicityLocation" && array[index + 1]?.name === "startTime" && array[index + 2]?.name === "endTime") {
        const startTimeField = array[index + 1];
        const endTimeField = array[index + 2];

        const isStartTimeVisible = !startTimeField.dependency || (form.watch(startTimeField.dependency?.field || "") === startTimeField.dependency?.value || startTimeField.dependency?.value === "*");
        const isEndTimeVisible = !endTimeField.dependency || (form.watch(endTimeField.dependency?.field || "") === endTimeField.dependency?.value || endTimeField.dependency?.value === "*");

        return (
          <>
            {/* Publicity Location field */}
            <div key={field.name} className="md:col-span-1">
              {renderSingleFormFieldComponent(field)}
              {field.conditionalFields &&
                field.conditionalFields.map((cond) =>
                  form.watch(field.name) === cond.value
                    ? cond.fields.map((nestedCondField) => (
                        <div key={nestedCondField.name} className="mt-4">
                          {renderField(nestedCondField, -1, [])} {/* Recursive call for nested fields, use dummy index/array */}
                        </div>
                      ))
                    : null
                )}
            </div>

            {/* Publicity Time Period group */}
            <div key="publicity-time-group" className="md:col-span-1 flex flex-col">
              <FormLabel className="text-gray-700 font-semibold">প্রচারণা সময়কাল {startTimeField.mandatory && <span className="text-red-500">*</span>}</FormLabel>
              <div className="flex gap-2 mt-2"> {/* Added mt-2 for spacing from label */}
                {isStartTimeVisible && (
                  <div className="flex-1">
                    <FormField
                      control={form.control}
                      name={startTimeField.name as Path<z.infer<z.ZodObject<any>>>}
                      render={({ field: formHookField }) => (
                        <FormItem className="flex flex-col space-y-0"> {/* space-y-0 to reduce vertical gap */}
                          <FormControl>
                            <Input
                              type="time"
                              placeholder="শুরু"
                              {...formHookField}
                              value={formHookField.value || ""}
                              className="border-blue-300 focus:border-blue-500 focus:ring-blue-500"
                            />
                          </FormControl>
                          <FormMessage className="pt-1" /> {/* pt-1 to give a little space */}
                        </FormItem>
                      )}
                    />
                  </div>
                )}
                {isEndTimeVisible && (
                  <div className="flex-1">
                    <FormField
                      control={form.control}
                      name={endTimeField.name as Path<z.infer<z.ZodObject<any>>>}
                      render={({ field: formHookField }) => (
                        <FormItem className="flex flex-col space-y-0">
                          <FormControl>
                            <Input
                              type="time"
                              placeholder="শেষ"
                              {...formHookField}
                              value={formHookField.value || ""}
                              className="border-blue-300 focus:border-blue-500 focus:ring-blue-500"
                            />
                          </FormControl>
                          <FormMessage className="pt-1" />
                        </FormItem>
                      )}
                    />
                  </div>
                )}
              </div>
            </div>
          </>
        );
      }

      // If it's startTime or endTime and it was already handled by publicityLocation, skip
      if (field.name === "startTime" || field.name === "endTime") {
        // Check if the previous field was publicityLocation and this is part of the handled group
        if (index > 0 && array[index - 1]?.name === "publicityLocation") {
            return null; // Already rendered as part of the group
        }
        // Also check if it's endTime and startTime was handled
        if (index > 1 && array[index - 2]?.name === "publicityLocation" && array[index - 1]?.name === "startTime") {
            return null; // Already rendered as part of the group
        }
      }

      // For all other fields, or if the special handling didn't apply
      const shouldSpanTwoColumns = field.type === "textarea" || field.type === "file";
      const colSpanClass = shouldSpanTwoColumns ? "md:col-span-2" : "md:col-span-1";

      return (
        <div key={field.name} className={colSpanClass}>
          {renderSingleFormFieldComponent(field)}
          {field.conditionalFields &&
            field.conditionalFields.map((cond) =>
              form.watch(field.name) === cond.value
                ? cond.fields.map((nestedCondField) => (
                    <div key={nestedCondField.name} className="mt-4">
                      {renderField(nestedCondField, -1, [])} {/* Recursive call for nested fields */}
                    </div>
                  ))
                : null
            )}
        </div>
      );
    };

    return (
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit, onError)} className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6 bg-white rounded-lg shadow-lg border border-blue-200">
          <h2 className="text-3xl font-bold text-blue-800 mb-6 text-center md:col-span-2">{voucherDetails.heading}</h2>
          {voucherDetails.formFields.map((field, index, array) =>
            renderField(field, index, array)
          )}
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