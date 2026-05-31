import { NextResponse } from "next/server";
import { GoogleGenAI } from "@google/genai";
import { prisma } from "@/lib/prisma";

type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};

type KnowledgeItem = {
  priority?: number;
  keywords: string[];
  answer: string;
  suggestions?: string[];
};

type ReplyResult = {
  reply: string;
  needsContact: boolean;
  contactUrl: string | null;
  source: "fallback-knowledge-base" | "database-knowledge-base" | "gemini" | "missing-gemini-key" | "gemini-error";
};

const KNOWLEDGE_BASE: KnowledgeItem[] = [
  {
    keywords: ["bao hanh", "bảo hành", "loi", "lỗi", "hong", "hỏng", "sua", "sửa"],
    answer:
      "Sản phẩm tại TMDT Shop được bảo hành theo thời hạn ghi trên trang chi tiết sản phẩm. Bảo hành áp dụng cho lỗi kỹ thuật từ nhà sản xuất và cần có mã đơn hàng hoặc thông tin mua hàng để kiểm tra.",
    suggestions: ["Bạn có mã đơn hàng chưa?", "Sản phẩm đang gặp lỗi gì?"],
  },
  {
    keywords: ["doi tra", "đổi trả", "tra hang", "trả hàng", "hoan", "hoàn", "refund"],
    answer:
      "Shop hỗ trợ đổi trả trong 7 ngày nếu sản phẩm còn nguyên hộp, tem, phụ kiện và không có dấu hiệu sử dụng sai cách. Trường hợp giao sai hoặc lỗi khi nhận hàng sẽ được ưu tiên xử lý.",
    suggestions: ["Bạn nhận hàng ngày nào?", "Sản phẩm còn đủ hộp và phụ kiện không?"],
  },
  {
    keywords: ["thanh toan", "thanh toán", "cod", "chuyen khoan", "chuyển khoản", "tra tien", "trả tiền"],
    answer:
      "TMDT Shop hỗ trợ thanh toán khi nhận hàng và chuyển khoản/demo. Trạng thái thanh toán sẽ hiển thị trong chi tiết đơn hàng sau khi đơn được tạo.",
    suggestions: ["Bạn muốn thanh toán COD hay chuyển khoản?", "Bạn cần kiểm tra trạng thái thanh toán của đơn nào?"],
  },
  {
    keywords: ["giao hang", "giao hàng", "van chuyen", "vận chuyển", "ship", "phi ship", "phí ship"],
    answer:
      "Đơn hàng sẽ được xác nhận, đóng gói và bàn giao cho đơn vị vận chuyển. Bạn có thể theo dõi trạng thái trong mục Tài khoản > Đơn hàng.",
    suggestions: ["Bạn đang cần kiểm tra đơn hàng nào?", "Địa chỉ giao hàng của bạn ở tỉnh/thành nào?"],
  },
  {
    keywords: ["don hang", "đơn hàng", "ma don", "mã đơn", "trang thai", "trạng thái", "huy don", "hủy đơn"],
    answer:
      "Bạn có thể xem đơn hàng tại Tài khoản > Đơn hàng. Nếu cần admin kiểm tra trực tiếp, hãy cung cấp mã đơn, số điện thoại đặt hàng và nội dung cần hỗ trợ.",
    suggestions: ["Mã đơn hàng của bạn là gì?", "Bạn muốn kiểm tra trạng thái hay hủy đơn?"],
  },
  {
    keywords: ["san pham", "sản phẩm", "tu van", "tư vấn", "mua", "laptop", "dien thoai", "điện thoại"],
    answer:
      "Mình có thể hỗ trợ tư vấn cơ bản theo nhu cầu sử dụng, ngân sách và loại sản phẩm bạn quan tâm. Bạn hãy cho mình biết bạn cần mua sản phẩm cho công việc, học tập, chơi game hay dùng hằng ngày.",
    suggestions: ["Ngân sách của bạn khoảng bao nhiêu?", "Bạn ưu tiên hiệu năng, pin hay camera/màn hình?"],
  },
  {
    keywords: ["lien he", "liên hệ", "admin", "nhan vien", "nhân viên", "ho tro", "hỗ trợ"],
    answer:
      "Bạn có thể gửi yêu cầu cho admin tại trang Liên hệ. Để được xử lý nhanh, hãy để lại họ tên, email, số điện thoại, mã đơn nếu có và mô tả vấn đề thật cụ thể.",
    suggestions: ["Bạn muốn mình hướng dẫn cách gửi yêu cầu không?"],
  },
];

function normalizeVietnamese(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d");
}

function scoreKnowledgeItem(message: string, item: KnowledgeItem) {
  const normalizedMessage = normalizeVietnamese(message);

  const keywordScore = item.keywords.reduce((score, keyword) => {
    const normalizedKeyword = normalizeVietnamese(keyword);
    return normalizedMessage.includes(normalizedKeyword) ? score + normalizedKeyword.length : score;
  }, 0);

  return keywordScore + (keywordScore > 0 ? item.priority ?? 0 : 0);
}

function findBestAnswer(message: string, knowledgeBase: KnowledgeItem[]) {
  const ranked = knowledgeBase
    .map((item) => ({ item, score: scoreKnowledgeItem(message, item) }))
    .sort((a, b) => b.score - a.score);

  return ranked[0]?.score > 0 ? ranked[0].item : null;
}

function parseKeywords(value: string) {
  return value
    .split(/[\n,;|]+/)
    .map((keyword) => keyword.trim())
    .filter(Boolean);
}

async function loadKnowledgeBase() {
  try {
    const rows = await prisma.aiKnowledgeItem.findMany({
      where: { isActive: true },
      orderBy: [{ priority: "desc" }, { updatedAt: "desc" }],
    });

    if (rows.length === 0) return KNOWLEDGE_BASE;

    const databaseItems = rows.map((row) => ({
      priority: row.priority,
      keywords: parseKeywords(`${row.title}\n${row.keywords}`),
      answer: row.answer,
    }));

    return [...databaseItems, ...KNOWLEDGE_BASE];
  } catch {
    return KNOWLEDGE_BASE;
  }
}

function buildContactUrl(message: string) {
  const params = new URLSearchParams({
    subject: "Câu hỏi từ chatbox",
    message,
  });

  return `/contact?${params.toString()}`;
}

function buildTrainingReply(message: string, history: ChatMessage[], knowledgeBase: KnowledgeItem[]) {
  const matched = findBestAnswer(message, knowledgeBase);

  if (!matched) {
    return null;
  }

  const recentAskedForAdmin = history
    .slice(-4)
    .some((item) => normalizeVietnamese(item.content).includes("admin") || normalizeVietnamese(item.content).includes("nhan vien"));

  const nextStep = recentAskedForAdmin
    ? "Nếu vấn đề cần người xử lý, bạn bấm “Gửi yêu cầu” bên dưới chatbox để admin tiếp nhận."
    : "Nếu bạn muốn admin xử lý trực tiếp, hãy gửi yêu cầu kèm thông tin liên hệ và mã đơn nếu có.";

  const suggestions = matched.suggestions?.length ? `\n\nMình cần thêm: ${matched.suggestions.join(" ")}` : "";

  return {
    reply: `${matched.answer}${suggestions}\n\n${nextStep}`,
    needsContact: false,
    contactUrl: null,
  };
}

function buildTrainingContext(knowledgeBase: KnowledgeItem[]) {
  return knowledgeBase
    .slice(0, 30)
    .map((item, index) => {
      const keywords = item.keywords.slice(0, 12).join(", ");
      return `${index + 1}. Từ khóa: ${keywords}\nCâu trả lời shop duyệt: ${item.answer}`;
    })
    .join("\n\n");
}

function buildGeminiPrompt(message: string, history: ChatMessage[], knowledgeBase: KnowledgeItem[]) {
  const recentHistory = history
    .slice(-6)
    .map((item) => `${item.role === "user" ? "Khách" : "Trợ lý"}: ${item.content}`)
    .join("\n");

  return `
Bạn là trợ lý tư vấn khách hàng của TMDT Shop.

Quy tắc bắt buộc:
- Chỉ trả lời bằng tiếng Việt, giọng thân thiện, ngắn gọn.
- Chỉ hỗ trợ các nội dung liên quan đến shop, sản phẩm, đơn hàng, giao hàng, thanh toán, đổi trả, bảo hành và liên hệ admin.
- Ưu tiên tuyệt đối chính sách/dữ liệu training bên dưới. Không tự bịa chính sách, giá, thời gian, số điện thoại, email hoặc cam kết ngoài dữ liệu được cung cấp.
- Nếu câu hỏi cần kiểm tra đơn hàng hoặc thông tin cá nhân, hãy yêu cầu khách cung cấp mã đơn/số điện thoại và khuyên gửi yêu cầu cho admin.
- Nếu không chắc, nói rõ cần admin kiểm tra thêm.
- Không nhắc rằng bạn là Gemini hoặc mô hình AI.

Dữ liệu training đã duyệt:
${buildTrainingContext(knowledgeBase)}

Lịch sử gần đây:
${recentHistory || "Chưa có."}

Câu hỏi mới của khách:
${message}
`.trim();
}

async function generateGeminiReply(message: string, history: ChatMessage[], knowledgeBase: KnowledgeItem[]): Promise<ReplyResult> {
  const apiKey = process.env.GEMINI_API_KEY?.trim();

  if (!apiKey) {
    return {
      reply:
        "Mình chưa có dữ liệu training phù hợp để trả lời chính xác câu này. Bạn vui lòng gửi câu hỏi và ý kiến cho shop để admin tiếp nhận và phản hồi.",
      needsContact: true,
      contactUrl: buildContactUrl(message),
      source: "missing-gemini-key",
    };
  }

  try {
    const ai = new GoogleGenAI({ apiKey });
    const response = await ai.models.generateContent({
      model: process.env.GEMINI_MODEL?.trim() || "gemini-2.5-flash",
      contents: buildGeminiPrompt(message, history, knowledgeBase),
      config: {
        temperature: 0.35,
        maxOutputTokens: 420,
      },
    });
    const reply = typeof response.text === "string" ? response.text.trim() : "";

    if (!reply) {
      throw new Error("Gemini returned an empty response.");
    }

    return {
      reply,
      needsContact: false,
      contactUrl: null,
      source: "gemini",
    };
  } catch {
    return {
      reply:
        "Mình chưa thể gọi AI để trả lời câu này ngay lúc này. Bạn vui lòng gửi câu hỏi cho shop để admin kiểm tra và phản hồi chính xác hơn.",
      needsContact: true,
      contactUrl: buildContactUrl(message),
      source: "gemini-error",
    };
  }
}

export async function POST(request: Request) {
  const body = await request.json();
  const message = String(body.message ?? "").trim();
  const messages: unknown[] = Array.isArray(body.messages) ? body.messages : [];
  const history = messages.filter((item): item is ChatMessage => {
    return (
      typeof item === "object" &&
      item !== null &&
      ((item as ChatMessage).role === "user" || (item as ChatMessage).role === "assistant") &&
      typeof (item as ChatMessage).content === "string"
    );
  });

  if (!message) {
    return NextResponse.json({ message: "Vui lòng nhập nội dung cần hỗ trợ." }, { status: 400 });
  }

  if (message.length > 1000) {
    return NextResponse.json({ message: "Nội dung hỗ trợ tối đa 1000 ký tự." }, { status: 400 });
  }

  const knowledgeBase = await loadKnowledgeBase();
  const trainingReply = buildTrainingReply(message, history, knowledgeBase);
  const source = knowledgeBase === KNOWLEDGE_BASE ? "fallback-knowledge-base" : "database-knowledge-base";
  const result: ReplyResult = trainingReply
    ? { ...trainingReply, source }
    : await generateGeminiReply(message, history, knowledgeBase);

  return NextResponse.json({
    reply: result.reply,
    needsContact: result.needsContact,
    contactUrl: result.contactUrl,
    source: result.source,
  });
}
