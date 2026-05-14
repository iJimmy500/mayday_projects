export const LAYOUTS = [
  { id: 'single', slots: 1, cols: '1fr', rows: '1fr' },
  { id: 'split-h', slots: 2, cols: '1fr', rows: '1fr 1fr' },
  { id: 'split-v', slots: 2, cols: '1fr 1fr', rows: '1fr' },
  { id: 'split-v-uneven', slots: 2, cols: '2fr 1fr', rows: '1fr' },
  { id: 'split-h-uneven', slots: 2, cols: '1fr', rows: '2fr 1fr' },
  { id: 'triple-h', slots: 3, cols: '1fr', rows: '1fr 1fr 1fr' },
  { id: 'triple-v', slots: 3, cols: '1fr 1fr 1fr', rows: '1fr' },
  { id: 'hero-left', slots: 3, cols: '2fr 1fr', rows: '1fr 1fr', spans: { 0: { gridRow: 'span 2' } } },
  { id: 'hero-right', slots: 3, cols: '1fr 2fr', rows: '1fr 1fr', spans: { 1: { gridRow: 'span 2' } } },
  { id: 'hero-top', slots: 3, cols: '1fr 1fr', rows: '2fr 1fr', spans: { 0: { gridColumn: 'span 2' } } },
  { id: 'hero-bottom', slots: 3, cols: '1fr 1fr', rows: '1fr 2fr', spans: { 2: { gridColumn: 'span 2' } } },
  { id: 'grid-4', slots: 4, cols: '1fr 1fr', rows: '1fr 1fr' },
  { id: 'grid-4-h', slots: 4, cols: '1fr 1fr 1fr 1fr', rows: '1fr' },
  { id: 'grid-4-v', slots: 4, cols: '1fr', rows: '1fr 1fr 1fr 1fr' },
  { id: 'hero-left-4', slots: 4, cols: '2fr 1fr', rows: '1fr 1fr 1fr', spans: { 0: { gridRow: 'span 3' } } },
  { id: 'hero-top-4', slots: 4, cols: '1fr 1fr 1fr', rows: '2fr 1fr', spans: { 0: { gridColumn: 'span 3' } } },
  { id: 'grid-5-top2', slots: 5, cols: 'repeat(6, 1fr)', rows: '1fr 1fr', spans: { 0: { gridColumn: 'span 3'}, 1: { gridColumn: 'span 3'}, 2: { gridColumn: 'span 2'}, 3: { gridColumn: 'span 2'}, 4: { gridColumn: 'span 2'} } },
  { id: 'grid-6', slots: 6, cols: '1fr 1fr', rows: '1fr 1fr 1fr' },
  { id: 'grid-6-h', slots: 6, cols: '1fr 1fr 1fr', rows: '1fr 1fr' },
  { id: 'grid-8', slots: 8, cols: '1fr 1fr 1fr 1fr', rows: '1fr 1fr' },
  { id: 'grid-9', slots: 9, cols: 'repeat(3, 1fr)', rows: 'repeat(3, 1fr)' },
  { id: 'manuscript', slots: 1, cols: '1fr 3fr 1fr', rows: '1fr', spans: { 0: { gridColumn: '2 / 3' } } },
  { id: 'column-grid', slots: 4, cols: '1fr 1fr 1fr 1fr', rows: '1fr' },
  { id: 'baseline-grid', slots: 6, cols: '1fr', rows: 'repeat(6, 1fr)' },
  { id: 'bento-box', slots: 5, cols: 'repeat(4, 1fr)', rows: 'repeat(3, 1fr)', spans: { 0: { gridArea: '1 / 1 / 3 / 3'}, 1: { gridArea: '1 / 3 / 2 / 5'}, 2: { gridArea: '2 / 3 / 4 / 4'}, 3: { gridArea: '2 / 4 / 4 / 5'}, 4: { gridArea: '3 / 1 / 4 / 3'} } },
  { id: 'masonry', slots: 6, cols: '1fr 1fr 1fr', rows: 'repeat(4, 1fr)', spans: { 0: { gridArea: '1 / 1 / 3 / 2' }, 1: { gridArea: '1 / 2 / 4 / 3' }, 2: { gridArea: '1 / 3 / 2 / 4' }, 3: { gridArea: '3 / 1 / 5 / 2' }, 4: { gridArea: '4 / 2 / 5 / 3' }, 5: { gridArea: '2 / 3 / 5 / 4' } } },
  { id: 'broken-grid', slots: 4, cols: '1fr 1fr 1fr', rows: '1fr 1fr 1fr', spans: { 0: { gridArea: '1 / 1 / 3 / 3', zIndex: 1}, 1: { gridArea: '2 / 2 / 4 / 4', zIndex: 2}, 2: { gridArea: '1 / 3 / 2 / 4', zIndex: 3}, 3: { gridArea: '3 / 1 / 4 / 2', zIndex: 4} } },
  { id: 'holy-grail', slots: 5, cols: '1fr 3fr 1fr', rows: '1fr 4fr 1fr', spans: { 0: { gridColumn: '1 / -1' }, 1: { gridColumn: '1 / 2' }, 2: { gridColumn: '2 / 3' }, 3: { gridColumn: '3 / 4' }, 4: { gridColumn: '1 / -1' } } },
  { id: 'scatter', type: 'scattered', slots: 4, cols: '1fr', rows: '1fr' },
  { id: 'slanted', type: 'slanted', slots: 3, cols: '1fr 1fr 1fr', rows: '1fr' },
  { id: 'inset', type: 'inset', slots: 3, cols: '1fr', rows: '1fr' }
];

export const RATIOS = [
  { id: '1:1', value: '1 / 1' },
  { id: '4:5', value: '4 / 5' },
  { id: '9:16', value: '9 / 16' },
  { id: '3:4', value: '3 / 4' },
  { id: '4:3', value: '4 / 3' },
  { id: '16:9', value: '16 / 9' }
];

export const COLORS = [
  '#ffffff', '#f8f9fa', '#e9ecef', '#dee2e6', '#adb5bd', '#495057', '#212529', '#000000',
  '#ffe3e3', '#ffc9c9', '#ff8787', '#f8d7da', '#f1f3f5', '#fff5f5',
  '#ebfbee', '#d3f9d8', '#b2f2bb', '#8ce99a', '#51cf66', '#40c057',
  '#e3fafc', '#c5f6fa', '#99e9f2', '#66d9e8', '#3bc9db', '#22b8cf',
  '#e7f5ff', '#d0ebff', '#a5d8ff', '#74c0fc', '#4dabf7', '#339af0',
  '#f3f0ff', '#e5dbff', '#d0bfff', '#b197fc', '#9775fa', '#845ef7',
  '#fff0f6', '#ffdeeb', '#fcc2d7', '#faa2c1', '#f783ac', '#f06595'
];

export const GRADIENTS = [
  'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
  'linear-gradient(135deg, #f6d365 0%, #fda085 100%)',
  'linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)',
  'linear-gradient(135deg, #84fab0 0%, #8fd3f4 100%)',
  'linear-gradient(135deg, #a6c0fe 0%, #f68084 100%)',
  'linear-gradient(135deg, #fccb90 0%, #d57eeb 100%)',
  'linear-gradient(135deg, #e0c3fc 0%, #8ec5fc 100%)',
  'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
  'linear-gradient(135deg, #232526 0%, #414345 100%)',
  'linear-gradient(to top, #30cfd0 0%, #330867 100%)',
  'linear-gradient(to right, #43e97b 0%, #38f8d4 100%)',
  'linear-gradient(to right, #fa709a 0%, #fee140 100%)'
];
