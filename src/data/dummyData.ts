import { UserProfile, Institution, VoucherType } from "@/types";

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
  },
  {
    id: "mobile-bill",
    heading: "মোবাইল বিল",
    shortDescription: "মোবাইল বিল সম্পর্কিত ভাউচার।",
    type: "single",
  },
  {
    id: "repair",
    heading: "রিপেয়ার",
    shortDescription: "মেরামত খরচ সম্পর্কিত ভাউচার।",
    type: "single",
  },
  {
    id: "petty-cash",
    heading: "পেটি ক্যাশ",
    shortDescription: "দৈনন্দিন খরচ সম্পাদনের জন্য প্রদান।",
    type: "single",
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
      },
      {
        id: "conveyance",
        heading: "কনভেয়েন্স",
        shortDescription: "যাতায়াত বা পরিবহন খরচ সম্পর্কিত ভাউচার।",
        type: "single",
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
      },
      {
        id: "publicity-students-inspiration",
        heading: "পাবলিসিটি ও স্টুডেন্টস ইন্সপাইরেশন",
        shortDescription: "পাবলিসিটি ও স্টুডেন্টস ইন্সপাইরেশন খরচ সম্পর্কিত ভাউচার।",
        type: "single",
      },
    ],
  },
];