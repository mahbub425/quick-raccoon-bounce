export type UserProfile = {
  pin: string;
  name: string;
  mobileNumber: string;
  department: string;
  designation: string;
  password: string;
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

export type VoucherType = {
  id: string;
  heading: string;
  shortDescription: string;
  type: 'single' | 'multi';
  subTypes?: VoucherType[];
  formFields?: any[]; // This will be detailed later
};

export type CartItem = {
  id: string;
  voucherType: string;
  data: any;
};