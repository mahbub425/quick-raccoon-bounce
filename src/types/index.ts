export type UserProfile = {
  pin: string;
  name: string;
  username: string; // Added username for login
  mobileNumber: string;
  department: string;
  designation: string;
  password: string;
  role: 'user' | 'mentor' | 'payment' | 'audit'; // Added role
};

export type Institution = {
  id: string;
  name: string;
  branches: Branch[];
};

export type Branch = {
  id: string;
  name: string;
};

export type ProgramSession = {
  id: string;
  name: string;
};

export type ExpenseCategory = {
  id: string;
  name: string;
  subCategories?: ExpenseSubCategory[];
};

export type ExpenseSubCategory = {
  id: string;
  name: string;
  fields?: {
    type: 'text' | 'number' | 'dropdown' | 'checkbox';
    label: string;
    options?: string[];
    conditionalField?: {
      value: string;
      field: {
        type: 'text' | 'number' | 'dropdown';
        label: string;
        options?: string[];
      };
    };
  }[];
};

// New type for defining form fields dynamically
export type FormField = {
  name: string; // Unique name for the field
  label: string; // Label to display
  type: 'text' | 'number' | 'dropdown' | 'textarea' | 'date' | 'time' | 'file' | 'checkbox' | 'pin-selector' | 'quantity-unit';
  placeholder?: string;
  mandatory?: boolean;
  options?: { value: string; label: string; }[]; // For dropdowns
  dependency?: {
    field: string; // Name of the field this one depends on
    value: string; // Value of the dependent field that makes this one visible/active
  };
  conditionalFields?: {
    value: string; // Value of this field that triggers conditional sub-fields
    fields: FormField[];
  }[];
  // Specific properties for certain field types
  unitOptions?: { value: string; label: string; }[]; // For 'quantity-unit' type
  maxAmountRules?: {
    [key: string]: number; // e.g., { "সকাল": 220, "দুপুর": 220 } for 'number' type with 'shift' dependency
  };
  allowMultiplePins?: boolean; // For 'pin-selector' type
};

export type VoucherType = {
  id: string;
  heading: string;
  shortDescription: string;
  type: 'single' | 'multi';
  subTypes?: VoucherType[];
  formFields?: FormField[]; // Detailed form fields for this voucher type
};

export type CartItem = {
  id: string; // Unique ID for the cart item
  voucherTypeId: string; // ID of the voucher type (e.g., 'entertainment', 'conveyance')
  voucherHeading: string; // Heading of the voucher type
  voucherNumber: string; // Auto-generated unique voucher number
  data: any; // The actual form data for this item
  createdAt: string; // Timestamp for when it was added
  originalVoucherId?: string; // NEW: ID of the voucher this one is a correction of
};

export type VoucherStatus = 'pending' | 'approved' | 'sent_back' | 'rejected' | 'paid' | 'corrected_by_user'; // Added 'corrected_by_user' status

export type SubmittedVoucher = CartItem & {
  status: VoucherStatus;
  comment?: string; // For send back/reject reasons
  submittedByPin: string; // To link to the user who submitted it
  submittedByName: string;
  submittedByMobile: string;
  submittedByDepartment: string;
  submittedByDesignation: string;
  submittedByRole: UserProfile['role']; // Added submittedByRole
  // originalVoucherId is now part of CartItem
};

// Specific form data types for better type safety (optional, can be inferred from FormField definitions)
export type EntertainmentVoucherFormData = {
  date: Date;
  institutionId: string;
  branchId: string;
  expenseTitle: string; // 'Myself' | 'Staff' | 'Teacher' | 'Director & Guest' | 'Student & Guardian' | 'Tea & Tea Materials' | 'Drinking Water' | 'Others';
  expenseCategory: string;
  selectedPins?: UserProfile['pin'][];
  guestName?: string;
  studentName?: string;
  guardianName?: string;
  quantity?: string;
  unit?: string;
  amount: number;
  description: string;
  attachment?: File;
};

export type ConveyanceVoucherFormData = {
  date: Date;
  institutionId: string;
  branchId: string;
  applicableFor: string; // 'Myself' | 'Teacher' | 'Others';
  teacherPins?: UserProfile['pin'][];
  otherPins?: UserProfile['pin'][];
  from: string;
  to: string;
  vehicleName: string; // 'Bus (Non-AC)' | 'Bus (AC)' | 'CNG' | 'Rickshaw' | 'Metro Rail';
  specialApproverPin?: UserProfile['pin'];
  amount: number;
  purpose: string;
  attachment?: File;
};

export type PublicityVoucherFormData = {
  date: Date;
  institutionId: string;
  branchId: string;
  programSessionId: string;
  publicityLocation: string;
  startTime: string; // HH:mm
  endTime: string; // HH:mm
  // Sub-forms will have their own data, handled separately or nested
};

export type PublicityConveyanceFormData = {
  from: string;
  to: string;
  vehicleName: string; // 'Bus (Non-AC)' | 'Bus (AC)' | 'CNG' | 'Rickshaw' | 'Metro Rail';
  specialApproverPin?: UserProfile['pin'];
  numberOfPersons: number;
  amount: number;
  description: string;
  attachment?: File;
};

export type PublicityEntertainmentFormData = {
  applicableFor: string; // 'Regular Staff' | 'Irregular Staff';
  pin?: UserProfile['pin'];
  name?: string;
  type: string; // 'Breakfast' | 'Lunch' | 'Afternoon Snacks' | 'Dinner' | 'Iftar' | 'Publicity Snacks';
  amount: number;
};

export type PublicityPublicistBillFormData = {
  publicistName: string;
  mobileNumber: string;
  shift: string; // 'সকাল' | 'দুপুর' | 'বিকাল' | ...
  amount: number;
  attachment?: File;
};

export type RentalUtilityVoucherFormData = {
  date: Date;
  institutionId: string;
  branchId: string;
  amount: number;
  description: string;
  attachment?: File;
};

export type MobileBillVoucherFormData = {
  date: Date;
  institutionId: string;
  branchId: string;
  amount: number;
  description: string;
  attachment?: File;
};

export type RepairVoucherFormData = {
  date: Date;
  institutionId: string;
  branchId: string;
  amount: number;
  description: string;
  attachment?: File;
};

export type PettyCashVoucherFormData = {
  date: Date;
  institutionId: string;
  branchId: string;
  amount: number;
  description: string;
  attachment?: File;
};