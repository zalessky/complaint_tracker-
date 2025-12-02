
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
    id: 't-new-1',
    telegramUserId: '445566',
    telegramUsername: '@ivan_citizen',
    contactPhone: '+79170001122',
    category: 'Дороги',
    subCategory: 'Яма на дороге',
    location: 'ул. Коммунистическая, 12',
    originalMessage: "Огромная яма на выезде со двора. Машины бьются днищем.",
    status: 'new',
    priority: 'high',
    createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
    attachments: [
        { id: 'm1', type: 'image', url: 'https://picsum.photos/seed/pothole/800/600', name: 'road.jpg' }
    ],
    history: []
  },
  {
    id: 't-new-2',
    telegramUserId: '556677',
    telegramUsername: '@anna_park',
    contactPhone: '+79053334455',
    category: 'Благоустройство',
    subCategory: 'Сломаны лавочки',
    location: 'Парк "Покровский"',
    originalMessage: "Вандалы сломали две скамейки возле фонтана. Торчат гвозди, опасно для детей.",
    status: 'new',
    priority: 'medium',
    createdAt: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
    attachments: [
        { id: 'm2', type: 'image', url: 'https://picsum.photos/seed/bench/800/600', name: 'bench.jpg' }
    ],
    history: []
  },
  {
    id: 't-new-3',
    telegramUserId: '998811',
    telegramUsername: '@bus_user_77',
    contactPhone: '',
    category: 'Транспорт',
    subCategory: 'Грязный салон',
    location: 'Маршрут 284Б',
    originalMessage: "В салоне автобуса невыносимая грязь, сиденья пыльные, кондуктор хамит.",
    extraData: { routeNumber: '284Б', vehicleNumber: 'А 123 АА 164' },
    status: 'in_work',
    priority: 'low',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString(),
    attachments: [
        { id: 'm3', type: 'image', url: 'https://picsum.photos/seed/bus_dirty/800/600', name: 'bus.jpg' }
    ],
    history: []
  },
  {
    id: 't-new-4',
    telegramUserId: '112233',
    telegramUsername: '@svetlana_jkh',
    contactPhone: '+79270009988',
    category: 'ЖКХ',
    subCategory: 'Открытый люк',
    location: 'ул. Тельмана, напротив школы 1',
    originalMessage: "Люк открыт уже неделю! Дети идут в школу и могут упасть.",
    status: 'resolved',
    priority: 'critical',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
    attachments: [
        { id: 'm4', type: 'image', url: 'https://picsum.photos/seed/manhole/800/600', name: 'hole.jpg' }
    ],
    history: [
        { id: 'h1', sender: 'operator', text: 'Заявка передана в Водоканал.', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 23).toISOString() },
        { id: 'h2', sender: 'operator', text: 'Люк закрыт. Спасибо за сигнал.', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 20).toISOString() }
    ]
  },
  {
    id: 't-new-5',
    telegramUserId: '777888',
    telegramUsername: '@dog_help',
    contactPhone: '',
    category: 'Животные',
    subCategory: 'Стая бездомных собак',
    location: 'Летка, возле магазина Магнит',
    originalMessage: "Агрессивная стая собак, 6-7 особей. Лают на прохожих.",
    status: 'measures_taken',
    priority: 'high',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(),
    attachments: [
        { id: 'm5', type: 'image', url: 'https://picsum.photos/seed/dogs/800/600', name: 'dogs.jpg' }
    ],
    history: []
  },
  {
    id: 't-new-6',
    telegramUserId: '333444',
    telegramUsername: '@night_city',
    contactPhone: '',
    category: 'Освещение',
    subCategory: 'Не горит фонарь',
    location: 'Набережная, 2 ярус',
    originalMessage: "Не горят три фонаря подряд. Очень темно гулять.",
    status: 'new',
    priority: 'medium',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
    attachments: [
        { id: 'm6', type: 'image', url: 'https://picsum.photos/seed/nightlight/800/600', name: 'light.jpg' }
    ],
    history: []
  },
  {
    id: 't-new-7',
    telegramUserId: '222111',
    telegramUsername: '@trash_monitor',
    contactPhone: '+79008887766',
    category: 'Мусор',
    subCategory: 'Невывоз мусора',
    location: 'Волоха, 15',
    originalMessage: "Мусор не вывозят уже 4 дня. Баки переполнены, запах на весь двор.",
    status: 'clarification_needed',
    priority: 'high',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 6).toISOString(),
    attachments: [
        { id: 'm7', type: 'image', url: 'https://picsum.photos/seed/garbage/800/600', name: 'trash.jpg' }
    ],
    history: [
        { id: 'h3', sender: 'operator', text: 'Уточните, пожалуйста, доступ к площадке не перекрыт припаркованными авто?', timestamp: new Date(Date.now() - 1000 * 60 * 60 * 5).toISOString() }
    ]
  },
  {
    id: 't-new-8',
    telegramUserId: '555444',
    telegramUsername: '@graffiti_hater',
    contactPhone: '',
    category: 'Фасады и крыши',
    subCategory: 'Граффити',
    location: 'Стена гимназии №8',
    originalMessage: "Вандалы разрисовали фасад школы рекламой наркотиков. Срочно закрасьте!",
    status: 'new',
    priority: 'critical',
    createdAt: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
    attachments: [
        { id: 'm8', type: 'image', url: 'https://picsum.photos/seed/wall/800/600', name: 'graffiti.jpg' }
    ],
    history: []
  },
  {
    id: 't-new-9',
    telegramUserId: '666999',
    telegramUsername: '@water_leak_2',
    contactPhone: '',
    category: 'Водоснабжение',
    subCategory: 'Прорыв трубы',
    location: 'Петровская, 55',
    originalMessage: "Течет вода из колодца, заливает тротуар.",
    status: 'in_work',
    priority: 'high',
    createdAt: new Date(Date.now() - 1000 * 60 * 60 * 10).toISOString(),
    attachments: [
        { id: 'm9', type: 'image', url: 'https://picsum.photos/seed/water_leak/800/600', name: 'water.jpg' }
    ],
    history: []
  }
];