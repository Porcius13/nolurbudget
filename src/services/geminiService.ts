import { GoogleGenAI, Type } from "@google/genai";

const getAI = () => {
  const key = (import.meta as any).env?.VITE_GEMINI_API_KEY || (process as any)?.env?.GEMINI_API_KEY || "";
  if (!key) {
    console.warn("GEMINI_API_KEY is missing. AI features will be disabled.");
    return null;
  }
  return new GoogleGenAI({ apiKey: key });
};

export const analyzeStatement = async (fileData: string, mimeType: string) => {
  const ai = getAI();
  if (!ai) throw new Error("AI functionality is currently unavailable - API Key missing.");

  const response = await ai.models.generateContent({
    model: "gemini-2.0-flash",
    contents: [
      {
        parts: [
          {
            inlineData: {
              data: fileData.split(',')[1],
              mimeType: mimeType,
            },
          },
          {
            text: `Bu bir kredi kartı ekstresi dosyasıdır (görsel veya PDF). Lütfen bu dosyadaki harcamaları analiz et ve JSON formatında döndür. 
            Her harcama için şu bilgileri çıkar:
            - amount (sayısal değer)
            - description (harcama yeri/açıklama)
            - date (YYYY-MM-DD formatında)
            - category_suggestion (harcamanın türüne göre şu kategorilerden biri: Gıda, Kira, Ulaşım, Eğlence, Sağlık, Alışveriş, Faturalar, Diğer)
            
            Sadece JSON dizisi döndür.`,
          },
        ],
      },
    ],
    config: {
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.ARRAY,
        items: {
          type: Type.OBJECT,
          properties: {
            amount: { type: Type.NUMBER },
            description: { type: Type.STRING },
            date: { type: Type.STRING },
            category_suggestion: { type: Type.STRING },
          },
          required: ["amount", "description", "date", "category_suggestion"],
        },
      },
    },
  });

  return JSON.parse(response.text || "[]");
};
