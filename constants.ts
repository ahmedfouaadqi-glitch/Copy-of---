import {
  Camera,
  UtensilsCrossed,
  Pill,
  NotebookText,
  MessageCircle,
  Sparkles as BeautyIcon,
  Home,
  Calendar,
  Search,
  BrainCircuit,
  Dumbbell,
  Gamepad2,
  Briefcase,
  Car,
  ShoppingCart,
  Trophy,
  Users
} from 'lucide-react';
import { Feature, PageType, Challenge } from './types';

export const PERSONAL_ADVISOR_BEAUTY_SUB_FEATURES = {
    title: 'العناية بالجمال',
    subCategories: [
      {
        id: 'skincare',
        name: 'العناية بالبشرة',
        icon: '🧴',
        subCategories: [
          {
            id: 'product_analysis',
            name: 'تحليل مكونات منتج',
            icon: '🧪',
            requiresImage: true,
            prompt: `**مهمتك: الرد باللغة العربية الفصحى فقط.** أنت خبير كيميائي في مكونات مستحضرات التجميل. حلل قائمة المكونات في هذه الصورة. حدد أهم المكونات الفعالة واشرح فائدتها، وأشر إلى أي مكونات قد تكون ضارة أو مثيرة للتحسس. في النهاية، قدم حكماً نهائياً حول ما إذا كان المنتج جيداً ومناسباً لنوع البشرة المحدد.`,
          },
          {
            id: 'skin-type',
            name: 'بشرة جافة',
            icon: '🏜️',
            prompt: "للبشرة الجافة",
             subCategories: [
              // Next level of questions for dry skin
             ]
          },
          {
            id: 'skin-oily',
            name: 'بشرة دهنية',
            icon: '💧',
            prompt: "للبشرة الدهنية",
            subCategories: [
               {
                id: 'acne',
                name: 'حب الشباب والمسامات',
                icon: '🌋',
                prompt: "التي تعاني من حب الشباب والمسامات الواسعة",
                 subCategories: [
                   // Routine types
                 ]
              },
               {
                id: 'shine',
                name: 'اللمعان الزائد',
                icon: '✨',
                prompt: "التي تعاني من اللمعان الزائد",
                 subCategories: [
                   // Routine types
                 ]
              },
               {
                id: 'general-oily',
                name: 'روتين عام',
                icon: '📚',
                prompt: "",
                 subCategories: [
                   // Routine types
                 ]
              }
            ]
          },
          {
            id: 'skin-combo',
            name: 'بشرة مختلطة',
            icon: '🌗',
            prompt: "للبشرة المختلطة",
            subCategories: [
              // Next level of questions for combo skin
            ]
          },
        ],
      },
      {
        id: 'haircare',
        name: 'العناية بالشعر',
        icon: '💆‍♀️',
        subCategories: [
          {
            id: 'hair-oily',
            name: 'شعر دهني',
            icon: '💧',
            prompt: "للشعر الدهني",
            subCategories: [
              { id: 'dandruff', name: 'القشرة', icon: '❄️', prompt: "الذي يعاني من القشرة", subCategories: [] },
              { id: 'hair-loss-oily', name: 'التساقط', icon: '🍂', prompt: "الذي يعاني من التساقط", subCategories: [] },
              { id: 'general-oily-hair', name: 'روتين عام', icon: '📚', prompt: "", subCategories: [] }
            ]
          },
          {
            id: 'hair-dry',
            name: 'شعر جاف',
            icon: '🏜️',
            prompt: "للشعر الجاف",
            subCategories: [
              { id: 'split-ends', name: 'التقصف', icon: '✂️', prompt: "الذي يعاني من التقصف", subCategories: [] },
              { id: 'frizz', name: 'الهيشان', icon: '💨', prompt: "الذي يعاني من الهيشان", subCategories: [] },
              { id: 'general-dry-hair', name: 'روتين عام', icon: '📚', prompt: "", subCategories: [] }
            ]
          },
          {
            id: 'hair-normal',
            name: 'شعر عادي',
            icon: '🌿',
            prompt: "للشعر العادي",
            subCategories: []
          },
          {
            id: 'hair-color',
            name: 'لون الشعر',
            icon: '🎨',
            subCategories: [
              {
                id: 'new-color-consultation',
                name: 'استشارة لاختيار لون جديد',
                icon: '✨',
                prompt: 'بناءً على المعطيات التالية: ',
                subCategories: [
                  {
                    id: 'skin-tone',
                    name: 'ما هو لون بشرتك؟',
                    icon: '👩',
                    prompt: '', // This level is just a question
                    subCategories: [
                      { id: 'fair', name: 'بشرة فاتحة', icon: '⚪', prompt: 'لون البشرة فاتح. ', subCategories: [] },
                      { id: 'medium', name: 'بشرة حنطية/متوسطة', icon: '🟠', prompt: 'لون البشرة متوسط/حنطي. ', subCategories: [] },
                      { id: 'dark', name: 'بشرة داكنة', icon: '🟤', prompt: 'لون البشرة داكن. ', subCategories: [] },
                    ]
                  },
                  {
                    id: 'color-goal',
                    name: 'ما هو هدفك من التغيير؟',
                    icon: '🎯',
                    prompt: '', // This level is just a question
                    subCategories: [
                      { id: 'drastic', name: 'تغيير جذري', icon: '💥', prompt: 'الهدف هو تغيير جذري. اقترح ألواناً جريئة ومناسبة.', subCategories: [] },
                      { id: 'subtle', name: 'تغيير طفيف', icon: '🍃', prompt: 'الهدف هو تغيير طفيف وطبيعي. اقترح درجات لونية قريبة من الطبيعي.', subCategories: [] },
                      { id: 'gray-coverage', name: 'تغطية الشيب', icon: '👵', prompt: 'الهدف هو تغطية الشعر الأبيض. اقترح أفضل الألوان والتقنيات لذلك.', subCategories: [] },
                    ]
                  }
                ]
              },
              {
                id: 'current-color-care',
                name: 'العناية باللون الحالي',
                icon: '🛡️',
                prompt: 'للعناية بالشعر المصبوغ ',
                subCategories: [
                  { id: 'color-fade', name: 'بهتان اللون', icon: '🌫️', prompt: "الذي يعاني من بهتان اللون", subCategories: [] },
                  { id: 'dryness-colored', name: 'الجفاف والتلف', icon: '🏜️', prompt: "الذي يعاني من الجفاف والتلف بسبب الصبغة", subCategories: [] },
                  { id: 'general-colored-hair', name: 'روتين عام', icon: '📚', prompt: "", subCategories: [] }
                ]
              },
              {
                id: 'unify-color',
                name: 'توحيد لون الشعر',
                icon: '🖌️',
                prompt: '**مهمتك: الرد باللغة العربية الفصحى فقط.** أنت خبير صبغات شعر. قدم نصائح مفصلة وخطوات عملية لتوحيد لون الشعر في المنزل، سواء كان السبب هو اختلاف الألوان أو نمو الجذور. اذكر الاحتياطات اللازمة والمواد التي قد تحتاجها المستخدمة.',
                subCategories: []
              },
            ]
          }
        ]
      },
      {
        id: 'makeup',
        name: 'المكياج',
        icon: '💋',
        subCategories: [
          {
            id: 'inspiration_analysis',
            name: 'تحليل إطلالة من صورة',
            icon: '📸',
            requiresImage: true,
            prompt: '**مهمتك: الرد باللغة العربية الفصحى فقط.** أنت خبير مكياج عالمي. حلل إطلالة المكياج في هذه الصورة. قم بتفكيك الإطلالة إلى مكوناتها الأساسية (مكياج العيون، الشفاه، الوجه)، استخلص لوحة الألوان المستخدمة، وقدم نصائح حول كيفية تطبيق هذا المكياج ولمن يناسب من ألوان البشرة والمناسبات.',
            subCategories: []
          },
          {
            id: 'personalized_recommendations',
            name: 'توصيات مكياج مخصصة',
            icon: '✨',
            prompt: 'أريد توصية مكياج مخصصة. ',
            subCategories: [
              {
                id: 'occasion',
                name: 'اختر المناسبة',
                icon: '🎉',
                prompt: '', // Just a question
                subCategories: [
                  { id: 'daily', name: 'يومي', icon: '☀️', prompt: 'لمناسبة يومية. ', subCategories: [] },
                  { id: 'evening', name: 'سهرة', icon: '🌙', prompt: 'لمناسبة مسائية أو سهرة. ', subCategories: [] },
                  { id: 'work', name: 'عمل', icon: '💼', prompt: 'لمناسبة عمل رسمية. ', subCategories: [] },
                  { id: 'special', name: 'مناسبة خاصة', icon: '💍', prompt: 'لمناسبة خاصة جداً. ', subCategories: [] }
                ]
              },
              {
                id: 'makeup-focus',
                name: 'اختر التركيز',
                icon: '🎯',
                prompt: '', // Just a question
                subCategories: [
                  { id: 'eyes', name: 'إبراز العيون', icon: '👁️', prompt: 'مع التركيز على إبراز جمال العيون. ', subCategories: [] },
                  { id: 'lips', name: 'إبراز الشفاه', icon: '👄', prompt: 'مع التركيز على إبراز الشفاه. ', subCategories: [] },
                  { id: 'natural', name: 'مكياج طبيعي', icon: '🍃', prompt: 'لإطلالة طبيعية وغير متكلفة. ', subCategories: [] }
                ]
              }
            ]
          },
          {
            id: 'makeup_doctor',
            name: 'طبيب المكياج',
            icon: '🩺',
            subCategories: [
              {
                id: 'foundation-caking',
                name: 'تكتل كريم الأساس',
                icon: '🎂',
                prompt: '**مهمتك: الرد باللغة العربية الفصحى فقط.** أنت خبير مكياج. اشرح بالتفصيل أسباب تكتل كريم الأساس وقدم حلولاً عملية وخطوات واضحة لمنع حدوث ذلك.',
                subCategories: []
              },
              {
                id: 'dark-circles',
                name: 'إخفاء الهالات السوداء',
                icon: '🐼',
                prompt: '**مهمتك: الرد باللغة العربية الفصحى فقط.** أنت خبير مكياج. قدم تقنية احترافية خطوة بخطوة لإخفاء الهالات السوداء باستخدام مصحح الألوان والكونسيلر.',
                subCategories: []
              },
              {
                id: 'long-lasting-lipstick',
                name: 'تثبيت أحمر الشفاه',
                icon: '💄',
                prompt: '**مهمتك: الرد باللغة العربية الفصحى فقط.** أنت خبير مكياج. قدم 3 حيل احترافية لجعل أحمر الشفاه يدوم طويلاً دون أن يتلطخ.',
                subCategories: []
              },
              {
                id: 'visual-doctor',
                name: 'لماذا يبدو مكياجي هكذا؟',
                icon: '🤔',
                requiresImage: true,
                prompt: '**مهمتك: الرد باللغة العربية الفصحى فقط.** أنت خبير مكياج. حلل الصورة المقدمة التي تظهر مشكلة في المكياج. شخص السبب المحتمل (مثال: لون كونسيلر خاطئ، دمج غير كافٍ للظلال) وقدم حلاً واضحاً ومباشراً للمشكلة.',
                subCategories: []
              }
            ]
          },
          {
            id: 'makeup_product_analysis',
            name: 'تحليل منتج مكياج',
            icon: '🧪',
            requiresImage: true,
            prompt: '**مهمتك: الرد باللغة العربية الفصحى فقط.** أنت خبير كيميائي في مكونات مستحضرات التجميل. حلل قائمة مكونات منتج المكياج في هذه الصورة. حدد المكونات الرئيسية، اشرح فائدتها، وأشر إلى أي مكونات قد تسد المسام أو تسبب حساسية. قدم حكماً نهائياً حول المنتج ولمن يناسب.',
            subCategories: []
          }
        ]
      },
      {
        id: 'diet-plan',
        name: 'خطط غذائية',
        icon: '🥗',
        page: { type: 'dietPlan' }
      },
      {
        id: 'lifestyle',
        name: 'نمط الحياة',
        icon: '🏃‍♀️',
         // ... subcategories for lifestyle
      },
      {
        id: 'men-care',
        name: 'العناية للرجال',
        icon: '🧔',
        subCategories: [
            {
                id: 'beard-care',
                name: 'العناية باللحية',
                icon: '🧔‍♂️',
                prompt: '**مهمتك: الرد باللغة العربية الفصحى فقط.** أنت خبير عناية بالرجال. قدم روتين عناية متكامل باللحية للحصول على لحية صحية ومهندمة، مع ذكر أنواع المنتجات الأساسية (زيت، بلسم، شامبو). في نهاية ردك، ضع قائمة بأنواع المنتجات المقترحة تحت عنوان "🛍️ منتجات مقترحة", كل نوع في سطر منفصل.',
            },
            {
                id: 'men-skincare',
                name: 'روتين بشرة للرجال',
                icon: '👨‍🔬',
                prompt: '**مهمتك: الرد باللغة العربية الفصحى فقط.** أنت خبير بشرة. قدم روتين عناية بالبشرة بسيط وفعال للرجال من 3 خطوات أساسية (تنظيف، ترطيب، حماية) مع الأخذ في الاعتبار طبيعة بشرة الرجال. في نهاية ردك، ضع قائمة بأنواع المنتجات المقترحة تحت عنوان "🛍️ منتجات مقترحة", كل نوع في سطر منفصل.',
            }
        ]
      },
       {
        id: 'fashion-analysis',
        name: 'تحليل الموضة',
        icon: '👕',
        requiresImage: true,
        prompt: `**مهمتك: الرد باللغة العربية الفصحى فقط.** أنت خبير موضة وأزياء. حلل قطعة الملابس في الصورة. اقترح 3 طرق مختلفة لتنسيقها لمناسبات مختلفة (مثلاً: عمل، سهرة، كاجوال). كن محدداً في اقتراحاتك للألوان والقطع المكملة.`
      },
    ]
};

// Common routine types to be dynamically inserted for skin
const SKIN_ROUTINE_TYPES = [
    { id: 'morning', name: 'روتين صباحي', icon: '☀️', prompt: "أريد روتين عناية صباحي يركز على الحماية والترطيب. اقترح مكونات فعالة للبحث عنها في المنتجات. في نهاية ردك، ضع قائمة بأنواع المنتجات المقترحة (مثل: غسول، سيروم، مرطب) تحت عنوان \"🛍️ منتجات مقترحة\", كل نوع في سطر منفصل." },
    { id: 'evening', name: 'روتين مسائي', icon: '🌙', prompt: "أريد روتين عناية مسائي يركز على التنظيف العميق والعلاج. اقترح مكونات فعالة للبحث عنها في المنتجات. في نهاية ردك، ضع قائمة بأنواع المنتجات المقترحة (مثل: غسول، سيروم، مرطب) تحت عنوان \"🛍️ منتجات مقترحة\", كل نوع في سطر منفصل." },
    { id: 'weekly', name: 'روتين أسبوعي', icon: '✨', prompt: "أريد روتين عناية أسبوعي يركز على الماسكات والعناية الخاصة. اقترح مكونات فعالة للبحث عنها في المنتجات. في نهاية ردك، ضع قائمة بأنواع المنتجات المقترحة (مثل: قناع طيني، مقشر) تحت عنوان \"🛍️ منتجات مقترحة\", كل نوع في سطر منفصل." },
];

// Common routine types for hair
const HAIR_ROUTINE_TYPES = [
    { id: 'daily-hair', name: 'روتين يومي', icon: '📅', prompt: "أريد روتين عناية يومي. اقترح مكونات فعالة للبحث عنها في المنتجات. في نهاية ردك، ضع قائمة بأنواع المنتجات المقترحة (مثل: شامبو، بلسم، زيت) تحت عنوان \"🛍️ منتجات مقترحة\", كل نوع في سطر منفصل." },
    { id: 'weekly-hair', name: 'روتين أسبوعي', icon: '✨', prompt: "أريد روتين عناية أسبوعي يركز على الماسكات والعناية الخاصة. اقترح مكونات فعالة للبحث عنها في المنتجات. في نهاية ردك، ضع قائمة بأنواع المنتجات المقترحة (مثل: حمام زيت، ماسك ترطيب) تحت عنوان \"🛍️ منتجات مقترحة\", كل نوع في سطر منفصل." },
];

// This is a helper function to recursively find and inject routines
const injectRoutines = (categories: any[], routineTypes: any[]) => {
    categories.forEach(category => {
        if (category.subCategories) {
            // If the subcategories lead to a final choice (no more sub-sub-categories), inject routines
            const isFinalBranch = category.subCategories.every((sub: any) => !sub.subCategories || sub.subCategories.length === 0);
            if (isFinalBranch && category.subCategories.length > 0) {
                 category.subCategories.forEach((sub: any) => {
                    if (!sub.subCategories || sub.subCategories.length === 0) {
                        sub.subCategories = routineTypes;
                    }
                 });
            } else if (category.subCategories.length === 0 && category.prompt) {
                // This handles cases like "شعر عادي"
                category.subCategories = routineTypes;
            }
            else {
                injectRoutines(category.subCategories, routineTypes);
            }
        }
    });
};

const skinCare = PERSONAL_ADVISOR_BEAUTY_SUB_FEATURES.subCategories.find(c => c.id === 'skincare');
if (skinCare?.subCategories) {
    injectRoutines(skinCare.subCategories, SKIN_ROUTINE_TYPES);
}

const hairCare = PERSONAL_ADVISOR_BEAUTY_SUB_FEATURES.subCategories.find(c => c.id === 'haircare');
if (hairCare?.subCategories) {
    // We handle the new 'hair-color' structure differently
    hairCare.subCategories.forEach(hairType => {
        if (hairType.id !== 'hair-color' && hairType.subCategories) {
             injectRoutines([hairType], HAIR_ROUTINE_TYPES);
        }
        // For hair color, inject routines into the 'current-color-care' branch
        if (hairType.id === 'hair-color' && hairType.subCategories) {
            const currentColorCare = hairType.subCategories.find(sc => sc.id === 'current-color-care');
            if (currentColorCare) {
                injectRoutines([currentColorCare], HAIR_ROUTINE_TYPES);
            }
        }
    });
}


export const DECORATIONS_SUB_FEATURES = {
    title: 'الديكور والنباتات',
    subCategories: [
        { id: 'bedroom', name: 'غرفة نوم صحية', icon: '🛏️', prompt: 'نصائح لتصميم غرفة نوم صحية تعزز الاسترخاء والنوم الجيد' },
        { id: 'office', name: 'مكتب منزلي منتج', icon: '💼', prompt: 'نصائح لتصميم مكتب منزلي يساعد على التركيز والإنتاجية' },
        { id: 'plants-general', name: 'نصائح نباتات عامة', icon: '🌿', prompt: 'قائمة بأفضل النباتات المنزلية لتنقية الهواء وتحسين المزاج' },
        { id: 'plant-doctor', name: 'طبيب النباتات', icon: '🩺', requiresImage: true, prompt: '**مهمتك: الرد باللغة العربية الفصحى فقط.** أنت "طبيب نباتات". حلل صورة النبتة المريضة هذه. شخص المشكلة (مثال: زيادة الري، نقص الضوء، آفة) وقدم خطة علاج واضحة ومفصلة.' },
        { id: 'my-plants', name: 'مجموعتي النباتية', icon: '🪴', page: { type: 'myPlants' } },
        { id: 'color-palette', name: 'مولّد لوحة الألوان', icon: '🎨', requiresImage: true, prompt: '**مهمتك: الرد باللغة العربية الفصحى فقط.** أنت خبير تصميم داخلي. استخلص لوحة ألوان متناسقة من الصورة الملهمة هذه. اقترح 3-5 ألوان مع أكواد HEX الخاصة بها، وقدم نصيحة موجزة حول كيفية استخدام هذه اللوحة في ديكور المنزل.' },
    ]
};

export const SCHEDULE_SUB_FEATURES = {
    title: 'منظم الجداول الذكي',
    subCategories: [
        { id: 'health-goal', name: 'تحقيق هدف صحي', icon: '🎯', prompt: 'أريد تحقيق هدف صحي. أنشئ لي خطة عمل مفصلة ومقسمة على الأسبوع لتحقيق هذا الهدف. كن محدداً في المهام اليومية.' },
        { id: 'daily-routine', name: 'تنظيم روتين يومي', icon: '🔄', prompt: 'أريد تنظيم روتين يومي أكثر صحة وإنتاجية. أنشئ لي جدولاً مقترحاً من الصباح إلى المساء.' },
    ]
};

const MOVIE_PROMPT_SUFFIX = `قدم ملخصاً له وسنة الإنتاج وأهم الممثلين. في بداية ردك، اكتب السطر التالي تماماً وبدون أي إضافات قبله: "اسم الفيلم: [اسم الفيلم هنا]"`;

export const GAMING_ADVISOR_SUB_FEATURES = {
    title: 'مركز مستشار الألعاب والترفيه الرقمي',
    subCategories: [
        {
            id: 'gamerPerformance',
            name: 'محسن أداء اللاعبين',
            icon: '🚀',
            subCategories: [
                {
                    id: 'gamer-physical-health',
                    name: 'الصحة البدنية للاعبين',
                    icon: '💪',
                    prompt: `**مهمتك: الرد باللغة العربية الفصحى فقط.** أنت مدرب أداء متخصص للاعبي الرياضات الإلكترونية. قدم 3 تمارين بسيطة وفعالة يمكن للاعب القيام بها أثناء فترات الراحة القصيرة لتحسين صحة المعصم والرقبة والظهر. واقترح وجبة خفيفة واحدة مثالية للحفاظ على الطاقة والتركيز.`
                },
                {
                    id: 'gamer-mental-health',
                    name: 'الصحة الذهنية والتركيز',
                    icon: '🧠',
                    prompt: `**مهمتك: الرد باللغة العربية الفصحى فقط.** أنت خبير في علم النفس الرياضي للاعبين. قدم تقنية تنفس بسيطة وفعالة لتقليل التوتر وزيادة التركيز قبل المباريات المهمة. واشرح كيف يمكن للاعب أن يحافظ على عقلية إيجابية بعد الخسارة.`
                }
            ]
        },
        {
            id: 'smartCameraGaming',
            name: 'الكاميرا الذكية لعالم الألعاب',
            icon: '📸',
            subCategories: [
                {
                    id: 'game-analysis',
                    name: 'تحليل غلاف اللعبة',
                    icon: '🎮',
                    requiresImage: true,
                    prompt: `**مهمتك: الرد باللغة العربية الفصحى فقط.** أنت خبير ومراجع ألعاب فيديو. تعرف على اللعبة من الصورة المقدمة (قد تكون غلافاً أو لقطة شاشة). قدم ملخصاً قصيراً عن اللعبة، نوعها، وأهم ميزاتها. ثم قدم 3 نصائح أساسية للمبتدئين فيها.`
                },
                {
                    id: 'hardware-guru',
                    name: 'مرشد العتاد',
                    icon: '🖥️',
                    requiresImage: true,
                    prompt: `**مهمتك: الرد باللغة العربية الفصحى فقط.** أنت خبير في عتاد الكمبيوتر. تعرف على قطعة الهاردوير في الصورة (كرت شاشة، معالج، لوحة أم، إلخ). قدم اسمها، لمحة عن أدائها، ولمن هي مناسبة (مثلاً: للاعبين المحترفين، للمبتدئين، لمصممي الجرافيك).`
                }
            ]
        },
        {
            id: 'movies',
            name: 'خدمات الأفلام',
            icon: '🎬',
            subCategories: [
                {
                    id: 'movie-suggestion-today',
                    name: 'اقتراح فيلم لليوم',
                    icon: '💡',
                    prompt: 'special_case_movie_suggestion' // This is a special key for the logic
                },
                {
                    id: 'movie-search-by-genre',
                    name: 'ابحث عن فيلم حسب النوع',
                    icon: '🔍',
                    subCategories: [
                        { id: 'action', name: 'أكشن', icon: '💥', prompt: `اقترح فيلم أكشن مشهور ومميز. ${MOVIE_PROMPT_SUFFIX}` },
                        { id: 'comedy', name: 'كوميدي', icon: '😂', prompt: `اقترح فيلم كوميدي مشهور ومميز. ${MOVIE_PROMPT_SUFFIX}` },
                        { id: 'drama', name: 'دراما', icon: '🎭', prompt: `اقترح فيلم دراما مشهور ومميز. ${MOVIE_PROMPT_SUFFIX}` },
                        { id: 'sci-fi', name: 'خيال علمي', icon: '🚀', prompt: `اقترح فيلم خيال علمي مشهور ومميز. ${MOVIE_PROMPT_SUFFIX}` }
                    ]
                },
                {
                    id: 'my-favorite-movies',
                    name: 'أفلامي المفضلة',
                    icon: '❤️',
                    page: { type: 'favoriteMovies' }
                }
            ]
        }
    ]
};

export const FINANCIAL_ADVISOR_SUB_FEATURES = {
    title: 'مركز المستشار المالي والمهني',
    subCategories: [
        {
            id: 'interview-coach',
            name: 'مدرب المقابلات الوظيفية',
            icon: '👔',
            prompt: '**مهمتك: الرد باللغة العربية الفصحى فقط.** أنت خبير توظيف ومستشار مهني. قدم للمستخدم دليلاً شاملاً للاستعداد لمقابلة وظيفية ناجحة. اذكر 5 أسئلة من أكثر أسئلة المقابلات شيوعاً، مع تقديم نصائح تفصيلية حول كيفية الإجابة على كل سؤال بشكل احترافي ومؤثر.'
        },
        {
            id: 'cv-analyzer',
            name: 'محلل السيرة الذاتية',
            icon: '📄',
            prompt: '**مهمتك: الرد باللغة العربية الفصحى فقط.** أنت خبير توظيف ومحلل سير ذاتية. قدم للمستخدم دليلاً مفصلاً حول كيفية كتابة سيرة ذاتية احترافية ومؤثرة. قسم الدليل إلى أقسام (المعلومات الشخصية، الملخص الاحترافي، الخبرة العملية، التعليم، المهارات). في كل قسم، اشرح ما يجب كتابته وقدم مثالاً واضحاً.'
        },
        {
            id: 'budget-planner',
            name: 'مخطط الميزانية الذكي',
            icon: '💰',
            prompt: '**مهمتك: الرد باللغة العربية الفصحى فقط.** أنت مستشار مالي شخصي. قدم خطة ميزانية بسيطة وفعالة تعتمد على قاعدة 50/30/20 (50% للاحتياجات، 30% للرغبات، 20% للادخار). اشرح كل فئة بوضوح وقدم أمثلة عملية لمساعدة المستخدم على تقسيم دخله الشهري.'
        }
    ]
};

export const AUTO_TECH_ADVISOR_SUB_FEATURES = {
    title: 'مركز مستشار السيارات والتكنولوجيا',
    subCategories: [
        {
            id: 'car-doctor',
            name: 'طبيب السيارات',
            icon: '🩺',
            requiresImage: true,
            prompt: '**مهمتك: الرد باللغة العربية الفصحى فقط.** أنت ميكانيكي سيارات خبير. حلل صورة ضوء التحذير في لوحة قيادة السيارة. تعرف على معنى هذا الضوء، حدد مدى خطورته (مثلاً: "تنبيه بسيط"، "تحقق قريباً"، "توقف فوراً!"), وقدم الخطوات التالية المقترحة التي يجب على السائق اتخاذها.'
        },
        {
            id: 'tech-guru',
            name: 'مرشد التكنولوجيا',
            icon: '💻',
            prompt: '**مهمتك: الرد باللغة العربية الفصحى فقط.** أنت خبير تقني. اشرح للمستخدم كيفية اختيار الجهاز التقني المناسب (لابتوب، هاتف، سماعات). اذكر 3 عوامل رئيسية يجب مراعاتها (مثل: الاستخدام، الميزانية، المواصفات الأساسية) وقدم مثالاً على كيفية تطبيق هذه العوامل عند البحث عن لابتوب للألعاب.'
        }
    ]
};



export const FEATURES: Feature[] = [
    {
        title: 'مركز الروح التقنية للأستشارة',
        description: 'ابحث في التطبيق والويب، واحصل على إجابات شاملة',
        Icon: Search,
        color: 'indigo',
        page: { type: 'globalSearch' },
        pageType: 'globalSearch',
    },
    {
        title: 'الكامرة الذكية',
        description: 'تحليل بصري فوري لكل ما يحيط بك',
        Icon: Camera,
        color: 'red',
        page: { type: 'imageAnalysis' },
        pageType: 'imageAnalysis',
    },
    {
        title: 'مركز المستشار الشخصي',
        description: 'استشارات مخصصة للجمال، الموضة، والصحة',
        Icon: BeautyIcon,
        color: 'pink',
        page: { type: 'smartHealth', pageType: 'beauty' },
        pageType: 'beauty',
    },
    {
        title: 'مركز مستشار الطهي والسعرات الحرارية',
        description: 'ابتكر وصفات من مكوناتك وحلل قيمتها الغذائية',
        Icon: UtensilsCrossed,
        color: 'orange',
        page: { type: 'calorieCounter' },
        pageType: 'calorieCounter',
    },
     {
        title: 'مركز المستشار الرياضي الذكي',
        description: 'خطط تمارين مخصصة وحلل أدائك الرياضي',
        Icon: Dumbbell,
        color: 'cyan',
        page: { type: 'sportsTrainer' },
        pageType: 'sportsTrainer',
    },
    {
        title: 'مركز مستشار الألعاب والترفيه الرقمي',
        description: 'حسن أداءك في الألعاب واكتشف أحدث الأفلام',
        Icon: Gamepad2,
        color: 'blue',
        page: { type: 'smartHealth', pageType: 'gaming' },
        pageType: 'gaming',
    },
    {
        title: 'مركز مستشار الصيدلاني الذكي',
        description: 'تعرف على معلومات الأدوية عبر الكاميرا',
        Icon: Pill,
        color: 'green',
        page: { type: 'pharmacy' },
        pageType: 'pharmacy',
    },
     {
        title: 'مركز المستشار المالي والمهني',
        description: 'أدوات ذكية لإدارة أموالك ومسارك المهني',
        Icon: Briefcase,
        color: 'amber',
        page: { type: 'smartHealth', pageType: 'financial' },
        pageType: 'financial',
    },
    {
        title: 'مركز مستشار السيارات والتكنولوجيا',
        description: 'حلول لمشاكل السيارات والأجهزة اليومية',
        Icon: Car,
        color: 'blue', // Re-using blue color
        page: { type: 'smartHealth', pageType: 'auto' },
        pageType: 'auto',
    },
    {
        title: 'مركز المستشار للديكور والنباتات',
        description: 'أفكار لتحسين منزلك وإدارة نباتاتك',
        Icon: Home,
        color: 'red', // Re-using red color
        page: { type: 'smartHealth', pageType: 'decorations' },
        pageType: 'decorations',
    },
    {
        title: 'مركز مستشار يومياتي',
        description: 'سجل أنشطتك وتتبع تقدمك اليومي',
        Icon: NotebookText,
        color: 'purple',
        page: { type: 'healthDiary' },
        pageType: 'healthDiary',
    },
    {
        title: 'مركز مستشار منظم الجداول الذكي',
        description: 'خطط أهدافك ونظم روتينك اليومي',
        Icon: Calendar,
        color: 'purple',
        page: { type: 'smartHealth', pageType: 'schedule' },
        pageType: 'schedule',
    },
    {
        title: 'عقل الروح التقنية (الدردشة)',
        description: 'تحدث مع مساعدك الذكي واحصل على إجابات فورية',
        Icon: BrainCircuit,
        color: 'teal',
        page: { type: 'chat' },
        pageType: 'chat',
    },
    {
        title: 'قائمة التسوق الذكية',
        description: 'أضف المكونات والمنتجات من استشاراتك',
        Icon: ShoppingCart,
        color: 'green',
        page: { type: 'shoppingList' },
        pageType: 'shoppingList',
    },
    {
        title: 'التحديات المجتمعية',
        description: 'انضم إلى تحديات صحية وحفز نفسك',
        Icon: Trophy,
        color: 'orange',
        page: { type: 'challenges' },
        pageType: 'challenges',
    },
    {
        title: 'الإلهام المجتمعي',
        description: 'شارك وتصفح وصفات وخطط من المجتمع',
        Icon: Users,
        color: 'pink',
        page: { type: 'communityInspirations' },
        pageType: 'communityInspirations',
    },
];

export const SEARCH_SUGGESTIONS: Partial<Record<PageType, string[]>> = {
    beauty: [
        'روتين للعناية بالبشرة الدهنية',
        'أفضل لون شعر للبشرة الحنطية',
        'كيفية إخفاء الهالات السوداء بالمكياج'
    ],
    calorieCounter: [
        'كم سعرة حرارية في الموز؟',
        'وصفة دجاج صحية بالفرن',
        'ما هي فوائد الشوفان؟'
    ],
    sportsTrainer: [
        'خطة تمارين لإنقاص الوزن',
        'أفضل التمارين لتقوية الظهر',
        'تمارين لشد البطن في المنزل'
    ],
    gaming: [
        'مراجعة فيلم The Matrix',
        'متطلبات تشغيل Cyberpunk 2077',
        'أفضل كرسي ألعاب مريح'
    ],
    pharmacy: [
        'ما هو دواء بانادول؟',
        'الآثار الجانبية لدواء أوميبرازول',
        'استخدامات فيتامين د'
    ],
    financial: [
        'كيف أبدأ الاستثمار في الأسهم؟',
        'طريقة عمل ميزانية شهرية',
        'أسئلة شائعة في مقابلات العمل'
    ],
    auto: [
        'معنى ضوء تحذير البطارية في السيارة',
        'أفضل سيارة عائلية اقتصادية 2024',
        'كم مرة يجب تغيير زيت السيارة؟'
    ],
    decorations: [
        'أفكار ديكور لغرفة نوم صغيرة',
        'نباتات منزلية لا تحتاج للشمس',
        'كيف أعتني بنبتة الأوركيد؟'
    ],
    chat: [
        'اكتب لي قصة قصيرة عن الفضاء',
        'لخص لي مقالاً عن الذكاء الاصطناعي',
        'ارسم صورة قطة ترتدي قبعة'
    ],
    globalSearch: [
        'ما هي عاصمة أستراليا؟',
        'آخر أخبار التكنولوجيا',
        'من هو مخترع الإنترنت؟'
    ]
};

export const CHALLENGES: Challenge[] = [
    { 
        id: 'water-7', 
        title: 'تحدي شرب الماء', 
        description: 'اشرب كوب ماء وسجله في يومياتك يومياً لمدة 7 أيام متتالية.', 
        icon: '💧', 
        goal: 7, 
        unit: 'أيام', 
        relatedDiaryType: 'note', 
        relatedDiaryTitle: 'شرب الماء' 
    },
    { 
        id: 'walk-5', 
        title: 'تحدي المشي اليومي', 
        description: 'امشِ لمدة 15 دقيقة على الأقل وسجلها كنشاط لمدة 5 أيام هذا الأسبوع.', 
        icon: '🚶', 
        goal: 5, 
        unit: 'أيام', 
        relatedDiaryType: 'activity', 
        relatedDiaryTitle: 'نشاط بدني'
    },
    { 
        id: 'meditate-3', 
        title: 'تحدي الاسترخاء', 
        description: 'قم بجلسة تأمل لمدة 5 دقائق وسجلها 3 مرات هذا الأسبوع.', 
        icon: '🧘', 
        goal: 3, 
        unit: 'مرات', 
        relatedDiaryType: 'activity',
        relatedDiaryTitle: 'استرخاء'
    },
     { 
        id: 'healthy-snack-7', 
        title: 'تحدي الوجبة الخفيفة', 
        description: 'تناول وجبة خفيفة صحية مثل التفاح وسجلها في يومياتك لمدة 7 أيام.', 
        icon: '🍎', 
        goal: 7, 
        unit: 'أيام', 
        relatedDiaryType: 'food',
        relatedDiaryTitle: 'وجبة خفيفة'
    }
];