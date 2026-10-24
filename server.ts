import express from 'express';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI, Type } from '@google/genai';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

app.use(express.json());

// Initialize Gemini Client
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
  httpOptions: {
    headers: {
      'User-Agent': 'aistudio-build',
    },
  },
});

// AI Weekly Review API Route
app.post('/api/ai-review', async (req, res) => {
  try {
    const {
      weekLabel,
      tasksTotal,
      tasksCompleted,
      taskCompletionRate,
      completedTaskTitles,
      pendingTaskTitles,
      habitBreakdown,
      focusMinutesTotal,
      focusSessionsCount,
      journalEntriesCount,
      calculatedScore,
    } = req.body;

    if (!process.env.GEMINI_API_KEY) {
      return res.status(200).json({
        summaryText: `در هفته ${weekLabel}، مجموعاً ${tasksCompleted} از ${tasksTotal} تسک با نرخ موفقیت ${taskCompletionRate}٪ تکمیل شد و ${focusMinutesTotal} دقیقه تمرکز کاری ثبت گردید.`,
        highlights: completedTaskTitles?.length
          ? [`انجام موفقیت‌آمیز: ${completedTaskTitles.slice(0, 3).join('، ')}.`]
          : ['شروع گام‌های منظم برای پیوستگی در تسک‌ها.'],
        improvements: pendingTaskTitles?.length
          ? [`پیگیری تسک‌های معوقه: ${pendingTaskTitles.slice(0, 2).join('، ')}.`]
          : ['حفظ تمرکز و زمان‌بندی پایدار.'],
      });
    }

    const prompt = `
شما تحلیلگر هوشمند سیستم عامل شخصی LifeOS هستید. وظیفه شما بررسی گزارش واقعی عملکرد کاربر در طول یک هفته بر اساس ارقام واقعی زیر است:

- برچسب هفته: ${weekLabel}
- نمره محاسبه‌شده عملکرد: ${calculatedScore} از ۱۰۰٪
- آمار تسک‌ها: ${tasksCompleted} تسک انجام‌شده از کل ${tasksTotal} تسک (${taskCompletionRate}٪)
- تسک‌های انجام‌شده: ${JSON.stringify(completedTaskTitles || [])}
- تسک‌های در انتظار / معوقه: ${JSON.stringify(pendingTaskTitles || [])}
- روتین‌ها و عادات هفتگی: ${JSON.stringify(habitBreakdown || [])}
- کل زمان تمرکز ثبت‌شده با زمان‌سنج: ${focusMinutesTotal} دقیقه در ${focusSessionsCount} جلسه
- تعداد روزهای دارای یادداشت روزانه: ${journalEntriesCount} روز

قوانین سخت‌گیرانه:
۱. تنها بر اساس داده‌های واقعی بالا تحلیل کنید و هرگز داده، تسک یا عدد ساختگی اضافه نکنید.
۲. زبان پاسخ باید کاملاً فارسی، محترمانه، آرام، بدون قضاوت و کاربردی باشد.
۳. خروجی باید شامل ۳ بخش باشد:
   - summaryText: توضیح ۱ تا ۲ جمله‌ای از نتایج کلیدی هفته و نمره عملکرد.
   - highlights: آرایه‌ای از ۲ تا ۳ دستاورد واقعی (تسک‌ها یا عاداتی که انجام شدند).
   - improvements: آرایه‌ای از ۲ تا ۳ پیشنهاد عملی بر اساس تسک‌های معوقه یا عادات کمتر انجام‌شده.
`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            summaryText: {
              type: Type.STRING,
              description: 'خلاصه عملکرد و ارزیابی کلی هفته',
            },
            highlights: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: 'دستاوردهای واقعی کسب‌شده در طول هفته',
            },
            improvements: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: 'پیشنهادات و راهکارهای عملی برای هفته آینده',
            },
          },
          required: ['summaryText', 'highlights', 'improvements'],
        },
      },
    });

    const parsed = JSON.parse(response.text || '{}');
    return res.json(parsed);
  } catch (error) {
    console.error('Gemini review generation error:', error);
    return res.status(500).json({ error: 'Failed to generate review' });
  }
});

// Development or Production handler
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(__dirname, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`LifeOS running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
