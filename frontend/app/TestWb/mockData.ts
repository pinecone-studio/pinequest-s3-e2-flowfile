import type { QuestionItem } from "./types";

export const questionItems: QuestionItem[] = [
  {
    id: "mongol-essay",
    badge: "Богино хариулт",
    prompt:
      "Эх оронч үзэл гэж юу болохыг өөрийн ойлгосноор 2-3 өгүүлбэрээр тайлбарлана уу.",
    helperText: "Товч бөгөөд тодорхой хариулт бичээрэй.",
    kind: "text",
    placeholder: "Хариултаа энд бичнэ үү...",
  },
  {
    id: "geography",
    badge: "Богино хариулт",
    prompt:
      "Монгол орны уур амьсгал эрс тэс байдаг шалтгаанаас хоёрыг нэрлэнэ үү.",
    helperText: "Шалтгаан бүрийг нэг мөрөөр бичиж болно.",
    kind: "text",
    placeholder: "Хариултаа энд бичнэ үү...",
  },
  {
    id: "history",
    badge: "Дэлгэрэнгүй хариулт",
    prompt:
      "1921 оны Ардын хувьсгал Монголын түүхэнд ямар ач холбогдолтой байсан талаар 150-200 үгт багтаан бичнэ үү.",
    helperText: "Түүхэн ач холбогдлыг жишээтэйгээр тайлбарлаарай.",
    kind: "essay",
    placeholder: "Эссэгээ энд бичнэ үү...",
  },
  {
    id: "math",
    badge: "Сонгох даалгавар",
    prompt: "Дараах тэгшитгэлийн системийг бодоорой.",
    helperText: "Зөв хариултыг сонгоно уу.",
    kind: "choice",
    mathLines: ["x + y = 12", "x - y = 4"],
    placeholder: "",
    choices: [
      { id: "a", label: "A", text: "x = 6, y = 6" },
      { id: "b", label: "B", text: "x = 7, y = 5" },
      { id: "c", label: "C", text: "x = 8, y = 4", isCorrect: true },
      { id: "d", label: "D", text: "x = 9, y = 3" },
    ],
  },
  {
    id: "biology",
    badge: "Зурагтай асуулт",
    prompt: "Атомын бүтцийг энгийнээр тайлбарлана уу.",
    helperText: "Цөм, электрон гэсэн ойлголтыг заавал дурдана уу.",
    kind: "text",
    visual: "atom",
    placeholder: "Хариултаа энд бичнэ үү...",
  },
];
