import { UserProfile, Institution, VoucherType, FormField } from "@/types";

export const DUMMY_USERS: UserProfile[] = [
  {
    pin: "203",
    name: "Tanzir",
    mobileNumber: "01713236989",
    department: "Finance & Accounts",
    designation: "Deputy Manager",
    password: "123456",
  },
  {
    pin: "204",
    name: "Rahim",
    mobileNumber: "01712345678",
    department: "HR",
    designation: "Manager",
    password: "password",
  },
];

export const DUMMY_INSTITUTIONS: Institution[] = [
  {
    id: "udvash",
    name: "Udvash (উদ্ভাস)",
    branches: [{ id: "bogura", name: "Bogura (বগুড়া)" }],
  },
  {
    id: "unmesh",
    name: "Unmesh (উন্মেষ)",
    branches: [{ id: "bogura", name: "Bogura (বগুড়া)" }],
  },
  {
    id: "uttoron",
    name: "Uttoron (উত্তরণ)",
    branches: [{ id: "bogura", name: "Bogura (বগুড়া)" }],
  },
  {
    id: "online-care",
    name: "Online Care (অনলাইন কেয়ার)",
    branches: [{ id: "bogura", name: "Bogura (বগুড়া)" }],
  },
];

export const DUMMY_PROGRAM_SESSIONS: { [key: string]: { id: string; name: string }[] } = {
  udvash: [
    { id: "eap-2025", name: "EAP-2025" },
    { id: "vap-ka-2025", name: "VAP KA-2025" },
  ],
  unmesh: [{ id: "map-2025", name: "MAP-2025" }],
  uttoron: [
    { id: "bcs-preli-47th", name: "BCS Preli- 47th" },
    { id: "bcs-written-47th", name: "BCS written- 47th" },
  ],
  "online-care": [
    { id: "eapo-2025", name: "EAPO-2025" },
    { id: "vap-kao-2025", name: "VAP KAO-2025" },
    { id: "mapo-2025", name: "MAPO-2025" },
  ],
};

export const DUMMY_PUBLICITY_LOCATIONS = [
  "বনানী বিদ্যা নিকেতন",
  "খিলগাঁও মডেল কলেজ",
  "মিরপুর বাংলা কলেজ",
  "উত্তরা রাজউক কলেজ",
  "সিটি কলেজ",
];

export const DUMMY_PINS = [
  { sl: 1, pin: "101", name: "User One" },
  { sl: 2, pin: "102", name: "User Two" },
  { sl: 3, pin: "103", name: "User Three" },
  { sl: 4, pin: "104", name: "User Four" },
  { sl: 5, pin: "105", name: "User Five" },
];

export const DUMMY_VOUCHER_TYPES: VoucherType[] = [
  {
    id: "rental-utility",
    heading: "রেন্টাল ও ইউটিলিটি বিল",
    shortDescription: "ভাড়া এবং ইউটিলিটি বিল সম্পর্কিত ভাউচার।",
    type: "single",
    formFields: [
      { name: "date", label: "তারিখ", type: "date", mandatory: true },
      {
        name: "institutionId",
        label: "প্রতিষ্ঠানের নাম",
        type: "dropdown",
        mandatory: true,
        options: DUMMY_INSTITUTIONS.map((inst) => ({ value: inst.id, label: inst.name })),
      },
      {
        name: "branchId",
        label: "শাখার নাম",
        type: "dropdown",
        mandatory: true,
        options: [{ value: "bogura", label: "Bogura (বগুড়া)" }],
        dependency: { field: "institutionId", value: "*" }, // Always show if institution is selected
      },
      { name: "amount", label: "টাকার পরিমাণ", type: "number", mandatory: true, placeholder: "টাকার পরিমাণ লিখুন" },
      { name: "description", label: "বর্ণনা", type: "textarea", mandatory: true, placeholder: "বর্ণনা লিখুন" },
      { name: "attachment", label: "সংযুক্তি", type: "file", mandatory: false },
    ],
  },
  {
    id: "mobile-bill",
    heading: "মোবাইল বিল",
    shortDescription: "মোবাইল বিল সম্পর্কিত ভাউচার।",
    type: "single",
    formFields: [
      { name: "date", label: "তারিখ", type: "date", mandatory: true },
      {
        name: "institutionId",
        label: "প্রতিষ্ঠানের নাম",
        type: "dropdown",
        mandatory: true,
        options: DUMMY_INSTITUTIONS.map((inst) => ({ value: inst.id, label: inst.name })),
      },
      {
        name: "branchId",
        label: "শাখার নাম",
        type: "dropdown",
        mandatory: true,
        options: [{ value: "bogura", label: "Bogura (বগুড়া)" }],
        dependency: { field: "institutionId", value: "*" },
      },
      { name: "amount", label: "টাকার পরিমাণ", type: "number", mandatory: true, placeholder: "টাকার পরিমাণ লিখুন" },
      { name: "description", label: "বর্ণনা", type: "textarea", mandatory: true, placeholder: "বর্ণনা লিখুন" },
      { name: "attachment", label: "সংযুক্তি", type: "file", mandatory: false },
    ],
  },
  {
    id: "repair",
    heading: "রিপেয়ার",
    shortDescription: "মেরামত খরচ সম্পর্কিত ভাউচার।",
    type: "single",
    formFields: [
      { name: "date", label: "তারিখ", type: "date", mandatory: true },
      {
        name: "institutionId",
        label: "প্রতিষ্ঠানের নাম",
        type: "dropdown",
        mandatory: true,
        options: DUMMY_INSTITUTIONS.map((inst) => ({ value: inst.id, label: inst.name })),
      },
      {
        name: "branchId",
        label: "শাখার নাম",
        type: "dropdown",
        mandatory: true,
        options: [{ value: "bogura", label: "Bogura (বগুড়া)" }],
        dependency: { field: "institutionId", value: "*" },
      },
      { name: "amount", label: "টাকার পরিমাণ", type: "number", mandatory: true, placeholder: "টাকার পরিমাণ লিখুন" },
      { name: "description", label: "বর্ণনা", type: "textarea", mandatory: true, placeholder: "বর্ণনা লিখুন" },
      { name: "attachment", label: "সংযুক্তি", type: "file", mandatory: false },
    ],
  },
  {
    id: "petty-cash",
    heading: "পেটি ক্যাশ",
    shortDescription: "দৈনন্দিন খরচ সম্পাদনের জন্য প্রদান।",
    type: "single",
    formFields: [
      { name: "date", label: "তারিখ", type: "date", mandatory: true },
      {
        name: "institutionId",
        label: "প্রতিষ্ঠানের নাম",
        type: "dropdown",
        mandatory: true,
        options: DUMMY_INSTITUTIONS.map((inst) => ({ value: inst.id, label: inst.name })),
      },
      {
        name: "branchId",
        label: "শাখার নাম",
        type: "dropdown",
        mandatory: true,
        options: [{ value: "bogura", label: "Bogura (বগুড়া)" }],
        dependency: { field: "institutionId", value: "*" },
      },
      { name: "amount", label: "টাকার পরিমাণ", type: "number", mandatory: true, placeholder: "টাকার পরিমাণ লিখুন" },
      { name: "description", label: "বর্ণনা", type: "textarea", mandatory: true, placeholder: "বর্ণনা লিখুন" },
      { name: "attachment", label: "সংযুক্তি", type: "file", mandatory: false },
    ],
  },
  {
    id: "entertainment-conveyance-multi",
    heading: "এন্টারটেইনমেন্ট ও কনভেয়েন্স ভাউচার",
    shortDescription: "আপ্যায়ন এবং যাতায়াত বা পরিবহন খরচ সম্পর্কিত ভাউচার।",
    type: "multi",
    subTypes: [
      {
        id: "entertainment",
        heading: "এন্টারটেইনমেন্ট",
        shortDescription: "আপ্যায়নের খরচ সম্পর্কিত ভাউচার।",
        type: "single",
        formFields: [
          { name: "date", label: "তারিখ", type: "date", mandatory: true },
          {
            name: "institutionId",
            label: "প্রতিষ্ঠানের নাম",
            type: "dropdown",
            mandatory: true,
            options: DUMMY_INSTITUTIONS.map((inst) => ({ value: inst.id, label: inst.name })),
          },
          {
            name: "branchId",
            label: "শাখার নাম",
            type: "dropdown",
            mandatory: true,
            options: [{ value: "bogura", label: "Bogura (বগুড়া)" }],
            dependency: { field: "institutionId", value: "*" },
          },
          {
            name: "expenseTitle",
            label: "ব্যয়ের শিরোনাম",
            type: "dropdown",
            mandatory: true,
            options: [
              { value: "Myself", label: "Myself (নিজ)" },
              { value: "Staff", label: "Staff (স্টাফ)" },
              { value: "Teacher", label: "Teacher (শিক্ষক)" },
              { value: "Director & Guest", label: "Director & Guest (পরিচালক ও অতিথি)" },
              { value: "Student & Guardian", label: "Student & Guardian (শিক্ষার্থী এবং অভিভাবক)" },
              { value: "Tea & Tea Materials", label: "Tea & Tea Materials (চা ও চা তৈরির উপকরণ)" },
              { value: "Drinking Water", label: "Drinking Water (খাবার পানি)" },
              { value: "Others", label: "Others (অন্যান্য)" },
            ],
            conditionalFields: [
              {
                value: "Myself",
                fields: [
                  {
                    name: "expenseCategory",
                    label: "ব্যয়ের খাত",
                    type: "dropdown",
                    mandatory: true,
                    options: [
                      { value: "Breakfast", label: "Breakfast (সকালের নাস্তা)" },
                      { value: "Lunch", label: "Lunch (দুপুরের খাবার)" },
                      { value: "Afternoon Snacks", label: "Afternoon Snacks (বিকালের নাস্তা)" },
                      { value: "Dinner", label: "Dinner (রাতের খাবার)" },
                      { value: "Iftar", label: "Iftar (ইফতার)" },
                      { value: "Sehri", label: "Sehri (সেহরি)" },
                    ],
                  },
                ],
              },
              {
                value: "Staff",
                fields: [
                  {
                    name: "expenseCategory",
                    label: "ব্যয়ের খাত",
                    type: "dropdown",
                    mandatory: true,
                    options: [
                      { value: "Afternoon Snacks", label: "Afternoon Snacks (বিকালের নাস্তা)" },
                      { value: "Special Occasion", label: "Special Occasion (বিশেষ উপলক্ষ)" },
                      { value: "Iftar", label: "Iftar (ইফতার)" },
                    ],
                    conditionalFields: [
                      {
                        value: "Afternoon Snacks",
                        fields: [
                          {
                            name: "selectedPins",
                            label: "পিন নম্বর সংযুক্ত করুন",
                            type: "pin-selector",
                            mandatory: true,
                            allowMultiplePins: true,
                          },
                        ],
                      },
                      {
                        value: "Iftar",
                        fields: [
                          {
                            name: "selectedPins",
                            label: "পিন নম্বর সংযুক্ত করুন",
                            type: "pin-selector",
                            mandatory: true,
                            allowMultiplePins: true,
                          },
                        ],
                      },
                    ],
                  },
                ],
              },
              {
                value: "Teacher",
                fields: [
                  {
                    name: "expenseCategory",
                    label: "ব্যয়ের খাত",
                    type: "dropdown",
                    mandatory: true,
                    options: [
                      { value: "Breakfast", label: "Breakfast (সকালের নাস্তা)" },
                      { value: "Afternoon Snacks", label: "Afternoon Snacks (বিকালের নাস্তা)" },
                      { value: "Regular Lunch & Dinner", label: "Regular Lunch & Dinner (দুপুর ও রাতের প্রতিদিনের খাবার)" },
                      { value: "Special Lunch & Dinner", label: "Special Lunch & Dinner (দুপুর ও রাতের বিশেষ খাবার)" },
                      { value: "Special Occasion", label: "Special Occasion (বিশেষ উপলক্ষ)" },
                    ],
                    conditionalFields: [
                      {
                        value: "Breakfast",
                        fields: [
                          {
                            name: "selectedPins",
                            label: "পিন নম্বর সংযুক্ত করুন",
                            type: "pin-selector",
                            mandatory: true,
                            allowMultiplePins: true,
                          },
                        ],
                      },
                      {
                        value: "Afternoon Snacks",
                        fields: [
                          {
                            name: "selectedPins",
                            label: "পিন নম্বর সংযুক্ত করুন",
                            type: "pin-selector",
                            mandatory: true,
                            allowMultiplePins: true,
                          },
                        ],
                      },
                    ],
                  },
                ],
              },
              {
                value: "Director & Guest",
                fields: [
                  {
                    name: "expenseCategory",
                    label: "ব্যয়ের খাত",
                    type: "dropdown",
                    mandatory: true,
                    options: [
                      { value: "Director", label: "Director (পরিচালক)" },
                      { value: "Guest", label: "Guest (অতিথি)" },
                    ],
                    conditionalFields: [
                      {
                        value: "Guest",
                        fields: [
                          { name: "guestName", label: "Guest Name (অতিথির নাম)", type: "text", mandatory: true, placeholder: "অতিথির নাম লিখুন" },
                        ],
                      },
                    ],
                  },
                ],
              },
              {
                value: "Student & Guardian",
                fields: [
                  {
                    name: "expenseCategory",
                    label: "ব্যয়ের খাত",
                    type: "dropdown",
                    mandatory: true,
                    options: [
                      { value: "Student", label: "Student (শিক্ষার্থী)" },
                      { value: "Guardian", label: "Guardian (অভিভাবক)" },
                    ],
                    conditionalFields: [
                      {
                        value: "Student",
                        fields: [
                          { name: "studentName", label: "Student Name (শিক্ষার্থীর নাম)", type: "text", mandatory: true, placeholder: "শিক্ষার্থীর নাম লিখুন" },
                        ],
                      },
                      {
                        value: "Guardian",
                        fields: [
                          { name: "guardianName", label: "Guardian Name (অভিভাবকের নাম)", type: "text", mandatory: true, placeholder: "অভিভাবকের নাম লিখুন" },
                        ],
                      },
                    ],
                  },
                ],
              },
              {
                value: "Tea & Tea Materials",
                fields: [
                  {
                    name: "expenseCategory",
                    label: "ব্যয়ের খাত",
                    type: "dropdown",
                    mandatory: true,
                    options: [
                      { value: "Tea Bag", label: "Tea Bag (টি ব্যাগ)" },
                      { value: "Sugar", label: "Sugar (চিনি)" },
                      { value: "Ginger", label: "Ginger (আদা)" },
                      { value: "Lemon", label: "Lemon (লেবু)" },
                      { value: "Spice", label: "Spice (মসলা)" },
                    ],
                    conditionalFields: [
                      {
                        value: "Tea Bag",
                        fields: [
                          {
                            name: "quantityUnit",
                            label: "পরিমান এবং ইউনিট",
                            type: "quantity-unit",
                            mandatory: true,
                            unitOptions: [
                              { value: "piece", label: "পিস" },
                              { value: "kg", label: "কেজি" },
                              { value: "gram", label: "গ্রাম" },
                              { value: "liter", label: "লিটার" },
                              { value: "box", label: "বক্স" },
                            ],
                          },
                        ],
                      },
                      {
                        value: "Sugar",
                        fields: [
                          {
                            name: "quantityUnit",
                            label: "পরিমান এবং ইউনিট",
                            type: "quantity-unit",
                            mandatory: true,
                            unitOptions: [
                              { value: "piece", label: "পিস" },
                              { value: "kg", label: "কেজি" },
                              { value: "gram", label: "গ্রাম" },
                              { value: "liter", label: "লিটার" },
                              { value: "box", label: "বক্স" },
                            ],
                          },
                        ],
                      },
                      {
                        value: "Ginger",
                        fields: [
                          {
                            name: "quantityUnit",
                            label: "পরিমান এবং ইউনিট",
                            type: "quantity-unit",
                            mandatory: true,
                            unitOptions: [
                              { value: "piece", label: "পিস" },
                              { value: "kg", label: "কেজি" },
                              { value: "gram", label: "গ্রাম" },
                              { value: "liter", label: "লিটার" },
                              { value: "box", label: "বক্স" },
                            ],
                          },
                        ],
                      },
                      {
                        value: "Lemon",
                        fields: [
                          {
                            name: "quantityUnit",
                            label: "পরিমান এবং ইউনিট",
                            type: "quantity-unit",
                            mandatory: true,
                            unitOptions: [
                              { value: "piece", label: "পিস" },
                              { value: "kg", label: "কেজি" },
                              { value: "gram", label: "গ্রাম" },
                              { value: "liter", label: "লিটার" },
                              { value: "box", label: "বক্স" },
                            ],
                          },
                        ],
                      },
                    ],
                  },
                ],
              },
              {
                value: "Drinking Water",
                fields: [
                  {
                    name: "expenseCategory",
                    label: "ব্যয়ের খাত",
                    type: "dropdown",
                    mandatory: true,
                    options: [
                      { value: "Safe International", label: "Safe International" },
                      { value: "Ma Enterprise", label: "Ma Enterprise" },
                      { value: "Others", label: "Others" },
                    ],
                    conditionalFields: [
                      {
                        value: "Safe International",
                        fields: [
                          {
                            name: "quantityUnit",
                            label: "পরিমান এবং ইউনিট",
                            type: "quantity-unit",
                            mandatory: true,
                            unitOptions: [
                              { value: "piece", label: "পিস" },
                              { value: "kg", label: "কেজি" },
                              { value: "gram", label: "গ্রাম" },
                              { value: "liter", label: "লিটার" },
                              { value: "box", label: "বক্স" },
                            ],
                          },
                        ],
                      },
                      {
                        value: "Ma Enterprise",
                        fields: [
                          {
                            name: "quantityUnit",
                            label: "পরিমান এবং ইউনিট",
                            type: "quantity-unit",
                            mandatory: true,
                            unitOptions: [
                              { value: "piece", label: "পিস" },
                              { value: "kg", label: "কেজি" },
                              { value: "gram", label: "গ্রাম" },
                              { value: "liter", label: "লিটার" },
                              { value: "box", label: "বক্স" },
                            ],
                          },
                        ],
                      },
                      {
                        value: "Others",
                        fields: [
                          {
                            name: "quantityUnit",
                            label: "পরিমান এবং ইউনিট",
                            type: "quantity-unit",
                            mandatory: true,
                            unitOptions: [
                              { value: "piece", label: "পিস" },
                              { value: "kg", label: "কেজি" },
                              { value: "gram", label: "গ্রাম" },
                              { value: "liter", label: "লিটার" },
                              { value: "box", label: "বক্স" },
                            ],
                          },
                        ],
                      },
                    ],
                  },
                ],
              },
              {
                value: "Others",
                fields: [
                  {
                    name: "expenseCategory",
                    label: "ব্যয়ের খাত",
                    type: "dropdown",
                    mandatory: true,
                    options: [
                      { value: "Gas for Cooking", label: "Gas for Cooking (রান্নার গ্যাস)" },
                      { value: "Meeting", label: "Meeting (আলোচনা সভা)" },
                      { value: "Tablighi Jamat", label: "Tablighi Jamat (তাবলীগ জামাত)" },
                    ],
                    conditionalFields: [
                      {
                        value: "Gas for Cooking",
                        fields: [
                          {
                            name: "quantityUnit",
                            label: "পরিমান এবং ইউনিট",
                            type: "quantity-unit",
                            mandatory: true,
                            unitOptions: [
                              { value: "piece", label: "পিস" },
                              { value: "kg", label: "কেজি" },
                              { value: "gram", label: "গ্রাম" },
                              { value: "liter", label: "লিটার" },
                              { value: "box", label: "বক্স" },
                            ],
                          },
                        ],
                      },
                    ],
                  },
                ],
              },
            ],
          },
          { name: "amount", label: "টাকার পরিমাণ", type: "number", mandatory: true, placeholder: "টাকার পরিমাণ লিখুন" },
          { name: "description", label: "বর্ণনা", type: "textarea", mandatory: true, placeholder: "বর্ণনা লিখুন" },
          { name: "attachment", label: "সংযুক্তি", type: "file", mandatory: false },
        ],
      },
      {
        id: "conveyance",
        heading: "কনভেয়েন্স",
        shortDescription: "যাতায়াত বা পরিবহন খরচ সম্পর্কিত ভাউচার।",
        type: "single",
        formFields: [
          { name: "date", label: "তারিখ", type: "date", mandatory: true },
          {
            name: "institutionId",
            label: "প্রতিষ্ঠানের নাম",
            type: "dropdown",
            mandatory: true,
            options: DUMMY_INSTITUTIONS.map((inst) => ({ value: inst.id, label: inst.name })),
          },
          {
            name: "branchId",
            label: "শাখার নাম",
            type: "dropdown",
            mandatory: true,
            options: [{ value: "bogura", label: "Bogura (বগুড়া)" }],
            dependency: { field: "institutionId", value: "*" },
          },
          {
            name: "applicableFor",
            label: "যাহার জন্য প্রযোজ্য",
            type: "dropdown",
            mandatory: true,
            options: [
              { value: "Myself", label: "Myself (নিজ)" },
              { value: "Teacher", label: "Teacher (শিক্ষক)" },
              { value: "Others", label: "Others (অন্যান্য)" },
            ],
            conditionalFields: [
              {
                value: "Teacher",
                fields: [
                  { name: "teacherPins", label: "টিচার পিন", type: "pin-selector", mandatory: true, allowMultiplePins: true },
                ],
              },
              {
                value: "Others",
                fields: [
                  { name: "otherPins", label: "পিন", type: "pin-selector", mandatory: true, allowMultiplePins: true },
                ],
              },
            ],
          },
          { name: "from", label: "হইতে", type: "text", mandatory: true, placeholder: "কোথা থেকে" },
          { name: "to", label: "পর্যন্ত", type: "text", mandatory: true, placeholder: "কোথা পর্যন্ত" },
          {
            name: "vehicleName",
            label: "বাহনের নাম",
            type: "dropdown",
            mandatory: true,
            options: [
              { value: "Bus (Non-AC)", label: "Bus (নন এসি)" },
              { value: "Bus (AC)", label: "Bus (এসি)" },
              { value: "CNG", label: "CNG" },
              { value: "Rickshaw", label: "Rickshaw" },
              { value: "Metro Rail", label: "Metro Rail" },
            ],
            conditionalFields: [
              {
                value: "Bus (AC)",
                fields: [
                  { name: "specialApproverPin", label: "বিশেষ ক্ষেত্রে অনুমোদনকারী পিন", type: "number", mandatory: true, placeholder: "অনুমোদনকারীর পিন" },
                ],
              },
            ],
          },
          { name: "amount", label: "টাকার পরিমাণ", type: "number", mandatory: true, placeholder: "টাকার পরিমাণ লিখুন" },
          { name: "purpose", label: "উদ্দেশ্য", type: "textarea", mandatory: true, placeholder: "উদ্দেশ্য লিখুন" },
          { name: "attachment", label: "সংযুক্তি", type: "file", mandatory: false },
        ],
      },
    ],
  },
  {
    id: "publicity-students-inspiration-multi",
    heading: "পাবলিসিটি ও স্টুডেন্টস ইন্সপাইরেশন ভাউচার",
    shortDescription: "প্রচারণা, বিজ্ঞাপন এবং শিক্ষার্থীদের অনুপ্রেরণার খরচ সম্পর্কিত ভাউচার।",
    type: "multi",
    subTypes: [
      {
        id: "publicity",
        heading: "প্রচারণা",
        shortDescription: "প্রচারণা বা ক্যাম্পেইন খরচ সম্পর্কিত ভাউচার।",
        type: "single",
        formFields: [
          { name: "date", label: "তারিখ", type: "date", mandatory: true },
          {
            name: "institutionId",
            label: "প্রতিষ্ঠানের নাম",
            type: "dropdown",
            mandatory: true,
            options: DUMMY_INSTITUTIONS.map((inst) => ({ value: inst.id, label: inst.name })),
          },
          {
            name: "branchId",
            label: "শাখার নাম",
            type: "dropdown",
            mandatory: true,
            options: [{ value: "bogura", label: "Bogura (বগুড়া)" }],
            dependency: { field: "institutionId", value: "*" },
          },
          {
            name: "programSessionId",
            label: "প্রোগ্রাম ও সেশন",
            type: "dropdown",
            mandatory: true,
            dependency: { field: "institutionId", value: "udvash" }, // Example, will need dynamic options based on institutionId
            options: [], // This will be dynamically populated in the form component
          },
          {
            name: "publicityLocation",
            label: "প্রচারণার স্থান",
            type: "text", // Should be an autosuggestion field
            mandatory: true,
            placeholder: "প্রচারণার স্থান লিখুন",
            options: DUMMY_PUBLICITY_LOCATIONS.map(loc => ({ value: loc, label: loc })), // For autosuggestion
          },
          { name: "startTime", label: "শুরু", type: "time", mandatory: true },
          { name: "endTime", label: "শেষ", type: "time", mandatory: true },
        ],
      },
      {
        id: "publicity-students-inspiration",
        heading: "পাবলিসিটি ও স্টুডেন্টস ইন্সপাইরেশন",
        shortDescription: "পাবলিসিটি ও স্টুডেন্টস ইন্সপাইরেশন খরচ সম্পর্কিত ভাউচার।",
        type: "single",
        formFields: [
          // This will have its own form fields based on further requirements
        ],
      },
    ],
  },
];