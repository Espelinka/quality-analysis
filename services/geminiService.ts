import { GoogleGenAI, Type } from "@google/genai";
import type { AnalysisReport, AnalysisRequest } from '../types';

// Utility function to convert File to a Gemini-compatible Part
const fileToGenerativePart = async (file: File) => {
  const base64EncodedData = await new Promise<string>((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve((reader.result as string).split(',')[1]);
    reader.readAsDataURL(file);
  });
  return {
    inlineData: {
      data: base64EncodedData,
      mimeType: file.type,
    },
  };
};

// Lazy initialization for the Google Gemini AI Client
let ai: GoogleGenAI | undefined;
function getAiClient(): GoogleGenAI {
  if (!ai) {
    const apiKey = process.env.API_KEY;
    if (!apiKey) {
      // Throw a specific error that can be caught and handled gracefully.
      throw new Error("API_KEY_MISSING");
    }
    ai = new GoogleGenAI({ apiKey: apiKey as string });
  }
  return ai;
}

// Define the expected JSON schema for the model's response
const responseSchema = {
  type: Type.OBJECT,
  properties: {
    isIdentified: {
      type: Type.BOOLEAN,
      description: "Был ли дефект однозначно идентифицирован по фото?"
    },
    defectDescription: {
      type: Type.STRING,
      description: "Краткое, но точное техническое описание идентифицированного дефекта. Если не идентифицирован, указать причину (плохое качество фото, дефект не виден и т.д.)."
    },
    possibleCauses: {
      type: Type.STRING,
      description: "Перечисление наиболее вероятных причин возникновения дефекта с технической точки зрения."
    },
    violatedNorms: {
      type: Type.ARRAY,
      description: "Список нарушенных пунктов действующих нормативных документов Республики Беларусь. Если нормы не нарушены или не могут быть определены, оставить массив пустым.",
      items: {
        type: Type.OBJECT,
        properties: {
          code: {
            type: Type.STRING,
            description: "Обозначение нормативного документа и пункта (например, 'СН 1.03.04-2020, п. 5.1.2')."
          },
          text: {
            type: Type.STRING,
            description: "Краткая выдержка или суть требования нарушенного пункта."
          },
        },
        required: ["code", "text"]
      }
    },
    remediationMeasures: {
      type: Type.STRING,
      description: "Конкретные, технически грамотные рекомендации по устранению дефекта со ссылками на технологии и материалы."
    }
  },
  required: ["isIdentified", "defectDescription", "possibleCauses", "violatedNorms", "remediationMeasures"]
};

// The system instruction to guide the model's behavior
const systemInstruction = `Ты — ведущий инженер технического надзора в строительстве с 20-летним опытом работы в Республике Беларусь. Твоя задача — провести экспертный анализ фотографии строительного дефекта.
Твои ответы должны быть:
1.  **Профессиональными и технически точными.** Используй правильную строительную терминологию.
2.  **Основанными на действующих нормах РБ.** Ссылайся ИСКЛЮЧИТЕЛЬНО на актуальные и действующие на сегодняшний день нормативные документы Республики Беларусь (СН, ТКП, СТБ, ГОСТ). Не используй отмененные или устаревшие нормы.
3.  **Структурированными.** Всегда предоставляй ответ в формате JSON, строго соответствующем предоставленной схеме.
4.  **Объективными.** Если по фотографии невозможно однозначно определить дефект, его причины или применимые нормы, прямо укажи это в соответствующих полях. Не додумывай информацию.
5.  **На русском языке.**

Твоя задача — помочь инженеру технадзора быстро и качественно зафиксировать дефект и подготовить предписание.`;


export const analyzeDefect = async (request: AnalysisRequest): Promise<AnalysisReport> => {
  try {
    const geminiClient = getAiClient();
    const imagePart = await fileToGenerativePart(request.imageFile);
    
    const textPrompt = `Проанализируй изображение строительного дефекта. 
    Комментарий инженера: "${request.comment || 'Нет комментария.'}"`;

    const response = await geminiClient.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [{
        parts: [imagePart, { text: textPrompt }]
      }],
      config: {
        systemInstruction,
        responseMimeType: "application/json",
        responseSchema: responseSchema,
      }
    });

    const jsonText = response.text.trim();
    if (!jsonText) {
        throw new Error("Ответ от модели пустой. Возможно, сработали фильтры безопасности.");
    }
    const result = JSON.parse(jsonText);
    
    // Simple validation
    if (typeof result.isIdentified !== 'boolean' || !result.defectDescription) {
        throw new Error("Получен некорректный формат ответа от модели.");
    }

    return result as AnalysisReport;

  } catch (error) {
    console.error("Gemini API call failed:", error);

    if (error instanceof Error) {
        if (error.message === "API_KEY_MISSING") {
            throw new Error('Ошибка конфигурации: Ключ API не найден. Проверьте настройки переменных окружения в вашей среде развертывания (Vercel).');
        }
        if (error instanceof SyntaxError) {
            throw new Error("Не удалось обработать ответ от сервиса анализа. Попробуйте изменить запрос или фото.");
        }
        // Propagate more specific error messages
        if (error.message.includes("Ответ от модели пустой") || error.message.includes("некорректный формат")) {
             throw error;
        }
    }
    
    throw new Error('Ошибка при анализе изображения. Пожалуйста, попробуйте еще раз.');
  }
};