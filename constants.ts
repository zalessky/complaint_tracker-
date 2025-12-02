
import { Ticket, Priority } from './types';

export const PRIORITY_LABELS: Record<Priority, string> = {
    low: 'Низкий',
    medium: 'Средний',
    high: 'Высокий',
    critical: 'Критический'
};

// Full Specification including Feedback and Gratitude
export const CATEGORIES = {
  'roads': { 
      name: 'Дороги', 
      emoji: '🛣', 
      subs: ['Яма на дороге', 'Стертая разметка', 'Отсутствует знак', 'Не работает светофор', 'Открытый люк'],
      reqGeo: true 
  },
  'trash': { 
      name: 'Мусор', 
      emoji: '🗑', 
      subs: ['Невывоз мусора', 'Переполненная урна', 'Свалка', 'Грязь на контейнерной площадке'],
      reqGeo: true 
  },
  'transport': { 
      name: 'Транспорт', 
      emoji: '🚌', 
      subs: ['Нарушение графика', 'Хамство водителя', 'Грязный салон', 'Проезд остановки', 'Неисправность ТС'],
      reqExtra: true 
  },
  'light': { 
      name: 'Освещение', 
      emoji: '💡', 
      subs: ['Не горит фонарь', 'Мигает свет', 'Поврежден столб', 'Оголенные провода'] 
  },
  'green': { 
      name: 'Зеленые насаждения', 
      emoji: '🌳', 
      subs: ['Упавшее дерево', 'Необходим покос травы', 'Сухостой', 'Сломаны ветки'] 
  },
  'facades': { 
      name: 'Фасады и крыши', 
      emoji: '🏢', 
      subs: ['Граффити/Надписи', 'Осыпается фасад', 'Сосульки/Снег на крыше', 'Незаконная реклама'] 
  },
  'cleaning': { 
      name: 'Уборка снега', 
      emoji: '❄️', 
      subs: ['Нечищеный двор', 'Гололед', 'Снежный вал', 'Нечищеный тротуар'] 
  },
  'kids': { 
      name: 'Детские площадки', 
      emoji: '🧸', 
      subs: ['Сломаны качели/горка', 'Мусор на площадке', 'Нет песка', 'Повреждено покрытие'] 
  },
  'animals': { 
      name: 'Животные', 
      emoji: '🐕', 
      subs: ['Стая бездомных собак', 'Агрессивное животное', 'Заявка на биркование'],
      reqGeo: true
  },
  'water': { 
      name: 'Водоснабжение', 
      emoji: '🚿', 
      subs: ['Нет холодной воды', 'Нет горячей воды', 'Ржавая вода', 'Слабый напор'] 
  },
  'heating': { 
      name: 'Отопление', 
      emoji: '🌡', 
      subs: ['Холодно в квартире', 'Слишком жарко (перетоп)', 'Течь батареи'] 
  },
  'electricity': { 
      name: 'Электричество', 
      emoji: '🔌', 
      subs: ['Отключение света', 'Искрит щиток', 'Открыт щиток в подъезде'] 
  },
  'sport': { 
      name: 'Спортплощадки', 
      emoji: '🏃', 
      subs: ['Сломан инвентарь', 'Повреждено покрытие', 'Мусор'] 
  },
  'ads': { 
      name: 'Реклама', 
      emoji: '📢', 
      subs: ['Незаконная вывеска', 'Расклейка листовок', 'Штендер на тротуаре'] 
  },
  'feedback': {
      name: 'Обратная связь',
      emoji: '📢',
      subs: ['💬 Предложение по улучшению', '🗣️ Сообщить об ошибке в боте']
  },
  'gratitude': {
      name: 'Благодарность',
      emoji: '✅',
      subs: ['✅ Благодарность']
  },
  'other': { 
      name: 'Прочее', 
      emoji: '❓', 
      subs: ['Иное'] 
  }
};

export const STATUS_CONFIG = {
    'new': { label: 'Новая', color: 'bg-red-100 text-red-800 border-red-200' },
    'in_work': { label: 'В работе', color: 'bg-blue-100 text-blue-800 border-blue-200' },
    'clarification_needed': { label: 'На уточнении', color: 'bg-amber-100 text-amber-800 border-amber-200' },
    'resolved': { label: 'Решено', color: 'bg-emerald-100 text-emerald-800 border-emerald-200' },
    'measures_taken': { label: 'Приняты меры', color: 'bg-teal-100 text-teal-800 border-teal-200' },
    'not_confirmed': { label: 'Не подтвердилось', color: 'bg-slate-100 text-slate-800 border-slate-200' },
    'rejected': { label: 'Отклонено', color: 'bg-gray-100 text-gray-800 border-gray-200' }
};

export const MOCK_TICKETS: Ticket[] = [
  {
    id: 't-mock-1',
    telegramUserId: '445566',
    telegramUsername: '@citizen_one',
    contactPhone: '+79001234567',
    category: 'Дороги',
    subCategory: 'Яма на дороге',
    location: 'ул. Тельмана, д. 45',
    originalMessage: "Глубокая яма прямо на пешеходном переходе. Можно ноги переломать! Асфальт провалился после дождя.",
    status: 'new',
    priority: 'high',
    createdAt: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
    attachments: [
        { id: 'm1', type: 'image', url: 'https://picsum.photos/seed/road/800/600', name: 'construction.jpg' }
    ],
    history: []
  },
  {
    id: 't-mock-2',
    telegramUserId: '998877',
    telegramUsername: '@bus_rider',
    contactPhone: '+79051112233',
    category: 'Транспорт',
    subCategory: 'Нарушение графика',
    location: 'Остановка "Ярмарка"',
    originalMessage: "Автобус 284 не пришел по расписанию в 8:15. Следующий был битком, не влезть. Люди мерзнут!",
    extraData: { routeNumber: '284', vehicleNumber: '?' },
    status: 'in_work',
    priority: 'medium',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(),
    attachments: [
        { id: 'm2', type: 'image', url: 'https://picsum.photos/seed/bus/800/600', name: 'bus.jpg' }
    ],
    history: [
        { id: 'h1', sender: 'operator', text: 'Запрос отправлен диспетчеру МУП "Энгельсэлектротранс".', timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString() }
    ]
  },
  {
    id: 't-mock-3',
    telegramUserId: '112233',
    telegramUsername: '@eco_guard',
    contactPhone: '+79990001122',
    category: 'Мусор',
    subCategory: 'Свалка',
    location: 'За гаражами на Степной',
    originalMessage: "Стихийная свалка строительного мусора. Кто-то вывалил целую газель старых окон и кирпичей.",
    status: 'new',
    priority: 'critical',
    createdAt: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
    attachments: [
        { id: 'm3', type: 'image', url: 'https://picsum.photos/seed/trash/800/600', name: 'trash.jpg' }
    ],
    history: []
  },
  {
    id: 't-mock-4',
    telegramUserId: '334455',
    telegramUsername: '@warm_home',
    contactPhone: '89170000000',
    category: 'Отопление',
    subCategory: 'Холодно в квартире',
    location: 'Полтавская 32, кв 15',
    originalMessage: "Батареи чуть теплые, дома +18. УК заявку игнорирует уже третий день.",
    status: 'clarification_needed',
    priority: 'high',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
    attachments: [],
    history: [
         { id: 'h2', sender: 'operator', text: 'Укажите, пожалуйста, проводили ли вы замеры температуры воздуха в помещении?', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 20).toISOString() }
    ]
  },
  {
    id: 't-mock-5',
    telegramUserId: '777111',
    telegramUsername: '@driver_pro',
    contactPhone: '',
    category: 'ЖКХ',
    subCategory: 'Открытый люк',
    location: 'Перекресток Тельмана и Волоха',
    originalMessage: "Открытый колодец прямо на проезжей части! Воткнул ветку, но ночью не видно. Срочно примите меры!",
    status: 'resolved',
    priority: 'critical',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
    attachments: [
        { id: 'm5', type: 'image', url: 'https://picsum.photos/seed/hole/800/600', name: 'manhole.jpg' }
    ],
    history: [
         { id: 'h3', sender: 'operator', text: 'Передано аварийной бригаде Водоканала.', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 47).toISOString() },
         { id: 'h4', sender: 'operator', text: 'Люк закрыт. Спасибо за обращение.', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 40).toISOString() }
    ]
  },
  {
    id: 't-mock-6',
    telegramUserId: '555000',
    telegramUsername: '@dog_lover',
    contactPhone: '',
    category: 'Животные',
    subCategory: 'Стая бездомных собак',
    location: 'Детская площадка во дворе школы №1',
    originalMessage: "Агрессивные собаки (5-6 штук) пугают детей. Одна с биркой, остальные без.",
    status: 'measures_taken',
    priority: 'medium',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
    attachments: [
         { id: 'm6', type: 'image', url: 'https://picsum.photos/seed/dogs/800/600', name: 'dog.jpg' }
    ],
    history: [],
    notes: 'Передано в службу отлова. Выезд запланирован на 20.10.'
  },
  {
    id: 't-mock-7',
    telegramUserId: '888000',
    telegramUsername: '@angry_citizen',
    contactPhone: '+79270009988',
    category: 'Фасады и крыши',
    subCategory: 'Сосульки/Снег на крыше',
    location: 'ул. Горького, 14',
    originalMessage: "Огромные сосульки висят прямо над входом в подъезд! Ждем беды?",
    status: 'new',
    priority: 'high',
    createdAt: new Date(Date.now() - 1000 * 60 * 10).toISOString(),
    attachments: [
         { id: 'm7', type: 'image', url: 'https://picsum.photos/seed/snow/800/600', name: 'snow.jpg' }
    ],
    history: []
  },
  {
    id: 't-mock-9',
    telegramUserId: '121212',
    telegramUsername: '@night_walker',
    contactPhone: '',
    category: 'Освещение',
    subCategory: 'Не горит фонарь',
    location: 'Аллея Героев',
    originalMessage: "Половина фонарей не работает уже неделю. Темно ходить.",
    status: 'new',
    priority: 'medium',
    createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
    attachments: [
        { id: 'm9', type: 'image', url: 'https://picsum.photos/seed/light/800/600', name: 'light.jpg' }
    ],
    history: []
  },
  {
    id: 't-mock-10',
    telegramUserId: '333999',
    telegramUsername: '@water_leak',
    contactPhone: '+79033334444',
    category: 'Водоснабжение',
    subCategory: 'Прорыв трубы',
    location: 'Коломенская, 5',
    originalMessage: "Из под земли бьет фонтан воды! Заливает двор.",
    status: 'new',
    priority: 'critical',
    createdAt: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
    attachments: [
        { id: 'm10', type: 'image', url: 'https://picsum.photos/seed/leak/800/600', name: 'leak.jpg' }
    ],
    history: []
  },
  {
    id: 't-mock-11',
    telegramUserId: '424242',
    telegramUsername: '@grateful_user',
    contactPhone: '',
    category: 'Благодарность',
    subCategory: '✅ Благодарность',
    location: '',
    originalMessage: "Хочу сказать спасибо бригаде, которая вчера быстро починила свет на Ленина! Очень оперативно.",
    status: 'resolved',
    priority: 'low',
    createdAt: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
    attachments: [],
    history: []
  }
];