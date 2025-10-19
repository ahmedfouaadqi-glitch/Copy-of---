import { FunctionDeclaration, Type } from '@google/genai';

export const TOOLS: FunctionDeclaration[] = [
  {
    name: 'addToDiary',
    description: 'يضيف إدخالاً جديداً إلى يوميات المستخدم الصحية. استخدم هذا عندما يطلب المستخدم صراحة تسجيل شيء ما، مثل نشاط، طعام، أو ملاحظة.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        entry: {
          type: Type.STRING,
          description: 'النص الكامل للملاحظة أو النشاط المراد إضافته إلى اليوميات. إذا لم يقدم المستخدم المحتوى، اتركه فارغاً.',
        },
      },
    },
  },
  {
    name: 'navigateToPage',
    description: 'ينتقل إلى صفحة محددة داخل التطبيق. استخدم هذا عندما يطلب المستخدم صراحة فتح قسم معين.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        page: {
          type: Type.STRING,
          description: 'اسم الصفحة المراد الانتقال إليها. القيم المحتملة: home, imageAnalysis, calorieCounter, smartHealth, pharmacy, healthDiary, chat, myPlants, globalSearch, schedule, beauty, decorations.',
          enum: ['home', 'imageAnalysis', 'calorieCounter', 'smartHealth', 'pharmacy', 'healthDiary', 'chat', 'myPlants', 'globalSearch', 'schedule', 'beauty', 'decorations']
        },
      },
      required: ['page'],
    },
  },
  {
    name: 'generateImage',
    description: 'ينشئ صورة بناءً على وصف نصي. استخدم هذا عندما يطلب المستخدم "ارسم"، "صمم"، "أنشئ"، أو "تخيل" صورة.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        prompt: {
          type: Type.STRING,
          description: 'الوصف التفصيلي للصورة المراد إنشاؤها.',
        },
      },
      required: ['prompt'],
    },
  },
  {
    name: 'analyzeCaloriesForVoice',
    description: 'يحلل السعرات الحرارية لعنصر طعام معين ويقدم معلومات غذائية. استخدم هذا عندما يسأل المستخدم عن السعرات الحرارية في طعام معين.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        foodName: {
          type: Type.STRING,
          description: 'اسم الطعام المراد تحليل سعراته الحرارية.',
        },
      },
      required: ['foodName'],
    },
  },
];
