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

export const OFFICE_SUPPLIES_ITEM_OPTIONS: { [key: string]: { value: string; label: string }[] } = {
  "Writing & Drawing Supplies": [
    { value: "Marker", label: "Marker (মার্কার)" },
    { value: "Duster", label: "Duster (ডাস্টার)" },
    { value: "Highlight Marker", label: "Highlight Marker (হাইলাইট মার্কার)" },
    { value: "Fluid Pen", label: "Fluid Pen (ফ্লুইড পেন)" },
    { value: "Pen", label: "Pen (কলম)" },
    { value: "Pencil", label: "Pencil (পেন্সিল)" },
    { value: "Sharpener", label: "Sharpener (শার্পনার)" },
    { value: "Eraser", label: "Eraser (ইরেজার)" },
    { value: "Compass", label: "Compass (কম্পাস)" },
    { value: "Smart Board Pen", label: "Smart Board Pen (স্মার্ট বোর্ড পেন)" },
    { value: "Geometry Box", label: "Geometry Box (জ্যামিতি বক্স)" },
    { value: "Practical Study Materials", label: "Practical Study Materials (ব্যবহারিক অধ্যয়নের উপকরণ)" },
  ],
  "File & Filing Accessories": [
    { value: "File", label: "File (ফাইল)" },
    { value: "File Stand", label: "File Stand (ফাইল স্ট্যান্ড)" },
    { value: "Pen Holder", label: "Pen Holder (কলম দানি)" },
    { value: "Clip", label: "Clip (ক্লিপ)" },
    { value: "Card Holder", label: "Card Holder (কার্ড হোল্ডার)" },
    { value: "Document Box", label: "Document Box (ডকুমেন্ট বক্স)" },
  ],
  "Paper & Printing Supplies": [
    { value: "Paper (Question Printing)", label: "Paper (Question Printing) (প্রশ্ন প্রিন্টিং পেপার)" },
    { value: "Paper (Regular Printing)", label: "Paper (Regular Printing) (রেগুলার প্রিন্টিং পেপার)" },
    { value: "Slip Paper", label: "Slip Paper (স্লিপ পেপার)" },
    { value: "Envelope", label: "Envelope (খাম)" },
    { value: "Carbon Paper", label: "Carbon Paper (কার্বন পেপার)" },
    { value: "Color Paper", label: "Color Paper (কালার পেপার)" },
    { value: "ID Card", label: "ID Card (আইডি কার্ড)" },
    { value: "Laminating Paper", label: "Laminating Paper (ল্যামিনেটিং পেপার)" },
    { value: "Wrapping Paper", label: "Wrapping Paper (র‍্যাপিং পেপার)" },
    { value: "POS Roll", label: "POS Roll (পজ রোল)" },
    { value: "Toner (Question Printing)", label: "Toner (Question Printing) (প্রশ্ন প্রিন্টিং টোনার)" },
    { value: "Toner (Regular Printing)", label: "Toner (Regular Printing) (রেগুলার প্রিন্টিং টোনার)" },
  ],
  "Binding & Stationery Tools": [
    { value: "Calculator", label: "Calculator (ক্যালকুলেটর)" },
    { value: "Costape", label: "Costape (কসটেপ)" },
    { value: "Anti Cutter", label: "Anti Cutter (অ্যান্টি কাটার)" },
    { value: "Gum", label: "Gum (আঠা)" },
    { value: "Pin", label: "Pin (পিন)" },
    { value: "Pin Remover", label: "Pin Remover (পিন রিমুভার)" },
    { value: "Punch Machine", label: "Punch Machine (পাঞ্চ মেশিন)" },
    { value: "Ribbon", label: "Ribbon (রিবন)" },
    { value: "Rope", label: "Rope (রশি/সুতা)" },
    { value: "Scissors", label: "Scissors (কাঁচি)" },
    { value: "Stapler Machine", label: "Stapler Machine (স্ট্যাপলার মেশিন)" },
    { value: "Costape Cutter Machine", label: "Costape Cutter Machine (কসটেপ কাটার মেশিন)" },
    { value: "Paper Weight", label: "Paper Weight (পেপার ওয়েট)" },
  ],
  "Miscellaneous": [
    { value: "Laser Light", label: "Laser Light (লেজার লাইট)" },
    { value: "Map", label: "Map (মানচিত্র)" },
    { value: "Money Sponge", label: "Money Sponge (মানি স্পঞ্জ)" },
    { value: "Register Book", label: "Register Book (রেজিস্টার বুক)" },
    { value: "Seal", label: "Seal (সিল)" },
    { value: "Stamp Pad", label: "Stamp Pad (স্ট্যাম্প প্যাড)" },
    { value: "Ink", label: "Ink (কালি)" },
    { value: "Exam Board", label: "Exam Board (পরীক্ষার বোর্ড)" },
    { value: "Glycerin", label: "Glycerin (গ্লিসারিন)" },
  ],
};

export const CLEANING_SUPPLIES_ITEM_OPTIONS: { [key: string]: { value: string; label: string }[] } = {
  "Hygiene & Personal Cleaners": [
    { value: "Hand Wash", label: "Hand Wash (হ্যান্ড ওয়াশ)" },
    { value: "Hand Sanitizer", label: "Hand Sanitizer (হ্যান্ড স্যানিটাইজার)" },
    { value: "Tissue Facial", label: "Tissue Facial (ফেসিয়াল টিস্যু)" },
    { value: "Tissue Napkin", label: "Tissue Napkin (ন্যাপকিন টিস্যু)" },
    { value: "Tissue Toilet", label: "Tissue Toilet (টয়লেট টিস্যু)" },
    { value: "Soap", label: "Soap (সাবান)" },
    { value: "Shampoo", label: "Shampoo (শ্যাম্পু)" },
    { value: "Tooth Brush", label: "Tooth Brush (টুথব্রাশ)" },
    { value: "Tooth Paste", label: "Tooth Paste (টুথপেস্ট)" },
    { value: "Sandle", label: "Sandle (সেন্ডেল)" },
    { value: "Mirror", label: "Mirror (আয়না)" },
    { value: "Comb", label: "Comb (চিরুনি)" },
    { value: "Nail Cutter", label: "Nail Cutter (নেল কাটার)" },
    { value: "Cotton Bar", label: "Cotton Bar (কটন বার)" },
    { value: "Oil", label: "Oil (তেল)" },
  ],
  "Air Fresheners & Pest Control": [
    { value: "Aerosol", label: "Aerosol (অ্যারোসল)" },
    { value: "Air Freshener", label: "Air Freshener (এয়ার ফ্রেশনার)" },
    { value: "Mosquito Coil", label: "Mosquito Coil (মশার কয়েল)" },
    { value: "Naphthalene", label: "Naphthalene (ন্যাফথলিন)" },
    { value: "Odonil", label: "Odonil (ওডোনিল)" },
    { value: "Insect Killer Medecine", label: "Insect Killer Medecine (পোকা মারার ঔষধ)" },
  ],
  "Cleaning Tools & Equipment": [
    { value: "Belcha", label: "Belcha (বেলচা)" },
    { value: "Cloth Duster", label: "Cloth Duster (কাপড়ের ডাস্টার)" },
    { value: "Dustbin", label: "Dustbin (ডাস্টবিন)" },
    { value: "Jharu", label: "Jharu (ঝাড়ু)" },
    { value: "Mop", label: "Mop (মপ)" },
    { value: "Polythene", label: "Polythene (পলিথিন)" },
    { value: "Toilet Brush", label: "Toilet Brush (টয়লেট ব্রাশ)" },
    { value: "Bucket", label: "Bucket (বালতি)" },
    { value: "Basket", label: "Basket (ঝুড়ি)" },
    { value: "Foam", label: "Foam (ফোম)" },
  ],
  "Floor, Toilet & Other Cleaners": [
    { value: "Floor Cleaner", label: "Floor Cleaner (ফ্লোর ক্লিনার)" },
    { value: "Glass Cleaner", label: "Glass Cleaner (গ্লাস ক্লিনার)" },
    { value: "Dish Wash", label: "Dish Wash (ডিশ ওয়াশ)" },
    { value: "Smart Board Cleaner", label: "Smart Board Cleaner (স্মার্ট বোর্ড ক্লিনার)" },
    { value: "Toilet Cleaner", label: "Toilet Cleaner (টয়লেট ক্লিনার)" },
    { value: "Washing Powder", label: "Washing Powder (ওয়াশিং পাউডার)" },
    { value: "Majoni", label: "Majoni (মাজনী)" },
    { value: "Bleaching Powder", label: "Bleaching Powder (ব্লিচিং পাউডার)" },
    { value: "Hand Gloves", label: "Hand Gloves (হ্যান্ড গ্লাভস)" },
  ],
};

export const KITCHEN_HOUSEHOLD_ITEM_OPTIONS: { [key: string]: { value: string; label: string }[] } = {
  "Food Serving Items": [
    { value: "Bowl", label: "Bowl (বাটি)" },
    { value: "Cup", label: "Cup (কাপ)" },
    { value: "Dinner Set", label: "Dinner Set (ডিনার সেট)" },
    { value: "Glass", label: "Glass (গ্লাস)" },
    { value: "Jug", label: "Jug (জগ)" },
    { value: "Plate", label: "Plate (প্লেট)" },
    { value: "Soup Set", label: "Soup Set (স্যুপ সেট)" },
    { value: "Spoon", label: "Spoon (চামচ)" },
    { value: "Tray", label: "Tray (ট্রে)" },
  ],
  "Cooking & Preparation Tools": [
    { value: "Chopping Board", label: "Chopping Board (চপিং বোর্ড)" },
    { value: "Fry Pan", label: "Fry Pan (ফ্রাই প্যান)" },
    { value: "Humble Dista", label: "Humble Dista (হাম্বল দিস্তা)" },
    { value: "Hari Patil", label: "Hari Patil (হরি পাতিল)" },
    { value: "Knife", label: "Knife (ছুরি)" },
    { value: "Lemon Pressure Machine", label: "Lemon Pressure Machine (লেবু চাপার মেশিন)" },
    { value: "Lid", label: "Lid (ঢাকনা)" },
    { value: "Lusni", label: "Lusni (লুসনি)" },
    { value: "Pata Puta", label: "Pata Puta (পাটা পুতা)" },
    { value: "Peeler", label: "Peeler (খোসা ছাড়ানোর যন্ত্র)" },
    { value: "Pressure Cooker", label: "Pressure Cooker (প্রেশার কুকার)" },
    { value: "Rice Cooker", label: "Rice Cooker (রাইস কুকার)" },
    { value: "Sauce Pan", label: "Sauce Pan (সস প্যান)" },
    { value: "Kettle", label: "Kettle (কেটলি)" },
    { value: "Rice Starch Galoni", label: "Rice Starch Galoni (ভাতের মাড় গালুনি)" },
  ],
  "Storage & Carrying Items": [
    { value: "Tiffin Box", label: "Tiffin Box (টিফিন বক্স)" },
    { value: "Tiffin Carrier", label: "Tiffin Carrier (টিফিন ক্যারিয়ার)" },
    { value: "Water Pot", label: "Water Pot (পানির পাত্র)" },
    { value: "Rack", label: "Rack (র‍্যাক)" },
    { value: "Flask", label: "Flask (ফ্লাস্ক)" },
    { value: "Glass Stand", label: "Glass Stand (গ্লাস স্ট্যান্ড)" },
    { value: "Hotpot", label: "Hotpot (হটপট)" },
    { value: "Container", label: "Container (কন্টেইনার)" },
  ],
  "Bedding & Household Items": [
    { value: "Bed Sheet", label: "Bed Sheet (বেড শীট)" },
    { value: "Blanket & Cover", label: "Blanket & Cover (কম্বল ও কভার)" },
    { value: "Lungi", label: "Lungi (লুঙ্গি)" },
    { value: "Towel", label: "Towel (গামছা/তোয়ালে)" },
    { value: "Jaynamaj", label: "Jaynamaj (জায়নামাজ)" },
    { value: "Carpet", label: "Carpet (কার্পেট)" },
    { value: "Curtain", label: "Curtain (পর্দা)" },
    { value: "Hanger", label: "Hanger (হ্যাংগার)" },
    { value: "Match", label: "Match (দেশলাই/ফায়ার বক্স)" },
    { value: "Candle", label: "Candle (মোমবাতি)" },
    { value: "Bosta", label: "Bosta (বস্তা)" },
    { value: "Cartoon", label: "Cartoon (কার্টুন/বক্স)" },
    { value: "Key", label: "Key (চাবি)" },
    { value: "Bag", label: "Bag (ব্যাগ)" },
  ],
  "Miscellaneous": [
    { value: "Miscellaneous Kitchen Item", label: "Miscellaneous Kitchen Item (অন্যান্য কিচেন আইটেম)" },
  ],
};

export const DUMMY_VOUCHER_TYPES: VoucherType[] = [
  // Multi-type vouchers (top rows in screenshot)
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
                              { value: "ream", label: "রিম" },
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
                              { value: "ream", label: "রিম" },
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
                              { value: "ream", label: "রিম" },
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
                              { value: "ream", label: "রিম" },
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
                              { value: "ream", label: "রিম" },
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
                              { value: "ream", label: "রিম" },
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
                              { value: "ream", label: "রিম" },
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
                              { value: "ream", label: "রিম" },
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
            options: [], // Dynamically populated in form component
            dependency: { field: "institutionId", value: "*" },
          },
          {
            name: "publicityLocation",
            label: "প্রচারণার স্থান",
            type: "text", // Will use AutosuggestInput
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
  {
    id: "stationery-maintenance-multi",
    heading: "স্টেশনারি ও রক্ষণাবেক্ষণ সম্পর্কিত ভাউচার",
    shortDescription: "স্টেশনারি, ক্রোকারিজ ও রক্ষণাবেক্ষণ সম্পর্কিত খরচের ভাউচার।",
    type: "multi",
    subTypes: [
      {
        id: "office-supplies-stationery",
        heading: "অফিস সাপ্লাইস ও স্টেশনারি",
        shortDescription: "অফিস স্টেশনারি ও সরবরাহের খরচ সম্পর্কিত ভাউচার।",
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
              { value: "Writing & Drawing Supplies", label: "Writing & Drawing Supplies (লেখার ও অঙ্কনের সামগ্রী)" },
              { value: "File & Filing Accessories", label: "File & Filing Accessories (ফাইল এবং ফাইলিং আনুষাঙ্গিক)" },
              { value: "Paper & Printing Supplies", label: "Paper & Printing Supplies (কাগজ ও মুদ্রণ সামগ্রী)" },
              { value: "Binding & Stationery Tools", label: "Binding & Stationery Tools (বাঁধাই ও স্টেশনারি সরঞ্জাম)" },
              { value: "Miscellaneous", label: "Miscellaneous (অন্যান্য)" },
            ],
          },
          {
            name: "itemName",
            label: "আইটেমের নাম",
            type: "dropdown",
            mandatory: true,
            options: [], // Options will be dynamically set in DynamicVoucherForm
          },
          {
            name: "quantityUnit",
            label: "সংখ্যা",
            type: "quantity-unit",
            mandatory: true,
            unitOptions: [
              { value: "piece", label: "পিস" },
              { value: "kg", label: "কেজি" },
              { value: "gram", label: "গ্রাম" },
              { value: "liter", label: "লিটার" },
              { value: "box", label: "বক্স" },
              { value: "ream", label: "রিম" },
            ],
          },
          { name: "amount", label: "টাকার পরিমাণ", type: "number", mandatory: true, placeholder: "টাকার পরিমাণ লিখুন" },
          { name: "description", label: "বর্ণনা", type: "textarea", mandatory: true, placeholder: "বর্ণনা লিখুন" },
          { name: "attachment", label: "সংযুক্তি", type: "file", mandatory: false },
        ],
      },
      {
        id: "cleaning-supplies",
        heading: "পরিষ্কার-পরিচ্ছন্নতা সামগ্রী",
        shortDescription: "পরিষ্কার-পরিচ্ছন্নতার জন্য ব্যবহৃত সামগ্রীর খরচের ভাউচার।",
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
              { value: "Hygiene & Personal Cleaners", label: "Hygiene & Personal Cleaners (স্বাস্থ্যবিধি ও ব্যক্তিগত পরিষ্কারক)" },
              { value: "Air Fresheners & Pest Control", label: "Air Fresheners & Pest Control (সুগন্ধনাশক ও কীটপতঙ্গ নিয়ন্ত্রণ)" },
              { value: "Cleaning Tools & Equipment", label: "Cleaning Tools & Equipment (পরিষ্কারের সরঞ্জাম)" },
              { value: "Floor, Toilet & Other Cleaners", label: "Floor, Toilet & Other Cleaners (ফ্লোর, টয়লেট ও অন্যান্য পরিষ্কারক)" },
            ],
          },
          {
            name: "itemName",
            label: "আইটেমের নাম",
            type: "dropdown",
            mandatory: true,
            options: [], // Dynamically populated
          },
          {
            name: "quantityUnit",
            label: "সংখ্যা",
            type: "quantity-unit",
            mandatory: true,
            unitOptions: [
              { value: "piece", label: "পিস" },
              { value: "kg", label: "কেজি" },
              { value: "gram", label: "গ্রাম" },
              { value: "liter", label: "লিটার" },
              { value: "box", label: "বক্স" },
              { value: "ream", label: "রিম" },
            ],
          },
          { name: "amount", label: "টাকার পরিমাণ", type: "number", mandatory: true, placeholder: "টাকার পরিমাণ লিখুন" },
          { name: "description", label: "বর্ণনা", type: "textarea", mandatory: true, placeholder: "বর্ণনা লিখুন" },
          { name: "attachment", label: "সংযুক্তি", type: "file", mandatory: false },
        ],
      },
      {
        id: "kitchen-household-items",
        heading: "কিচেন ও গৃহস্থালি সামগ্রী",
        shortDescription: "থালাবাসন ও আনুষঙ্গিক খরচ সম্পর্কিত ভাউচার।",
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
              { value: "Food Serving Items", label: "Food Serving Items (খাবার পরিবেশন সামগ্রী)" },
              { value: "Cooking & Preparation Tools", label: "Cooking & Preparation Tools (রান্না ও প্রস্তুতি সহায়ক সরঞ্জাম)" },
              { value: "Storage & Carrying Items", label: "Storage & Carrying Items (সংরক্ষণ ও বহন সামগ্রী)" },
              { value: "Bedding & Household Items", label: "Bedding & Household Items (বিছানাপত্র ও গৃহস্থালি সামগ্রী)" },
              { value: "Miscellaneous", label: "Miscellaneous (অন্যান্য)" },
            ],
          },
          {
            name: "itemName",
            label: "আইটেমের নাম",
            type: "dropdown",
            mandatory: true,
            options: [], // Dynamically populated
          },
          {
            name: "quantityUnit",
            label: "সংখ্যা",
            type: "quantity-unit",
            mandatory: true,
            unitOptions: [
              { value: "piece", label: "পিস" },
              { value: "kg", label: "কেজি" },
              { value: "gram", label: "গ্রাম" },
              { value: "liter", label: "লিটার" },
              { value: "box", label: "বক্স" },
              { value: "ream", label: "রিম" },
            ],
          },
          { name: "amount", label: "টাকার পরিমাণ", type: "number", mandatory: true, placeholder: "টাকার পরিমাণ লিখুন" },
          { name: "description", label: "বর্ণনা", type: "textarea", mandatory: true, placeholder: "বর্ণনা লিখুন" },
          { name: "attachment", label: "সংযুক্তি", type: "file", mandatory: false },
        ],
      },
    ],
  },
  {
    id: "debit-credit-journal-multi", // New multi-type voucher
    heading: "ডেবিট, ক্রেডিট ও জার্নাল",
    shortDescription: "ডেবিট, ক্রেডিট এবং জার্নাল সম্পর্কিত ভাউচার।",
    type: "multi",
    subTypes: [
      // No sub-types defined yet, as per "don't do more than what the user asks for"
    ],
  },

  // Single-type vouchers (bottom rows in screenshot)
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

  // Publicity sub-vouchers (these should NOT appear in VoucherEntry.tsx main list)
  {
    id: "publicity-conveyance",
    heading: "প্রচারণা (কনভেয়েন্স)",
    shortDescription: "প্রচারণা সম্পর্কিত যাতায়াত বা পরিবহন খরচ।",
    type: "single",
    formFields: [
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
      { name: "numberOfPersons", label: "ব্যক্তির সংখ্যা", type: "number", mandatory: true, placeholder: "ব্যক্তির সংখ্যা লিখুন" },
      { name: "amount", label: "টাকার পরিমাণ", type: "number", mandatory: true, placeholder: "টাকার পরিমাণ লিখুন" },
      { name: "description", label: "বর্ণনা", type: "textarea", mandatory: true, placeholder: "বর্ণনা লিখুন" },
      { name: "attachment", label: "সংযুক্তি", type: "file", mandatory: false },
    ],
  },
  {
    id: "publicity-entertainment",
    heading: "প্রচারণা (এন্টারটেইনমেন্ট)",
    shortDescription: "প্রচারণা সম্পর্কিত আপ্যায়ন খরচ।",
    type: "single",
    formFields: [
      {
        name: "applicableFor",
        label: "যাহার জন্য প্রযোজ্য",
        type: "dropdown",
        mandatory: true,
        options: [
          { value: "Regular Staff", label: "Regular Staff (নিয়মিত কর্মী)" },
          { value: "Irregular Staff", label: "Irregular Staff (অনিয়মিত কর্মী)" },
        ],
        conditionalFields: [
          {
            value: "Regular Staff",
            fields: [
              { name: "pin", label: "পিন", type: "pin-selector", mandatory: true, allowMultiplePins: false }, // Assuming single pin for regular staff
            ],
          },
          {
            value: "Irregular Staff",
            fields: [
              { name: "name", label: "নাম", type: "text", mandatory: true, placeholder: "নাম লিখুন" },
            ],
          },
        ],
      },
      {
        name: "type",
        label: "ধরণ",
        type: "dropdown",
        mandatory: true,
        options: [
          { value: "Breakfast", label: "Breakfast (সকালের নাস্তা)" },
          { value: "Lunch", label: "Lunch (দুপুরের খাবার)" },
          { value: "Afternoon Snacks", label: "Afternoon Snacks (বিকালের নাস্তা)" },
          { value: "Dinner", label: "Dinner (রাতের খাবার)" },
          { value: "Iftar", label: "Iftar (ইফতার)" },
          { value: "Publicity Snacks", label: "Publicity Snacks (প্রচারণাকালিন নাস্তা)" },
        ],
      },
      { name: "amount", label: "টাকার পরিমাণ", type: "number", mandatory: true, placeholder: "টাকার পরিমাণ লিখুন" },
    ],
  },
  {
    id: "publicity-publicist-bill",
    heading: "প্রচারণা (প্রচারণাকারীর বিল)",
    shortDescription: "প্রচারণাকারীর বিল সম্পর্কিত ভাউচার।",
    type: "single",
    formFields: [
      { name: "publicistName", label: "প্রচারণাকরীর নাম", type: "text", mandatory: true, placeholder: "প্রচারণাকরীর নাম লিখুন" },
      { name: "mobileNumber", label: "মোবাইল নম্বর", type: "text", mandatory: true, placeholder: "মোবাইল নম্বর লিখুন" }, // Changed to text for now, can be number with pattern later
      {
        name: "shift",
        label: "সিফট",
        type: "dropdown",
        mandatory: true,
        options: [
          { value: "সকাল", label: "সকাল" },
          { value: "দুপুর", label: "দুপুর" },
          { value: "বিকাল", label: "বিকাল" },
          { value: "সকাল ও দুপুর", label: "সকাল ও দুপুর" },
          { value: "দুপুর ও বিকাল", label: "দুপুর ও বিকাল" },
          { value: "সকাল ও বিকাল", label: "সকাল ও বিকাল" },
          { value: "সকাল, দুপুর ও বিকাল", label: "সকাল, দুপুর ও বিকাল" },
          { value: "বোর্ড ও চাকরি পরীক্ষা", label: "বোর্ড ও চাকরি পরীক্ষা" },
          { value: "অন্য থানা", label: "অন্য থানা" },
        ],
      },
      {
        name: "amount",
        label: "টাকার পরিমাণ",
        type: "number",
        mandatory: true,
        placeholder: "টাকার পরিমাণ লিখুন",
        maxAmountRules: {
          "সকাল": 220,
          "দুপুর": 220,
          "বিকাল": 220,
          "সকাল ও দুপুর": 270,
          "দুপুর ও বিকাল": 270,
          "সকাল ও বিকাল": 320,
          "সকাল, দুপুর ও বিকাল": 380,
          "বোর্ড ও চাকরি পরীক্ষা": 270,
          "অন্য থানা": 360,
        },
      },
      { name: "attachment", label: "সংযুক্তি", type: "file", mandatory: false },
    ],
  },
];