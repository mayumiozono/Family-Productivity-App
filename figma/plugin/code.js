// Rotina em Família – gera as telas do celular dos pais no Figma.
//
// Cria, no arquivo aberto:
//   1. Variáveis de cor, estilos de texto e de efeito com os nomes do Keep Design System.
//   2. Uma página "Keep · Componentes locais" com os componentes usados nas telas.
//   3. Três seções de fluxo (um cenário cada) na página "Fluxos APP", com telas nomeadas,
//      setas no estilo do Autoflow, interações de protótipo e pontos de início de fluxo.
//
// Pode ser rodado de novo: remove o que ele mesmo criou antes e recria tudo.

const TAG = 'rotina-em-familia'
const FONT = 'Inter'
const SCREEN_W = 390
const SCREEN_H = 844

// ---------------------------------------------------------------------------
// Keep Design System tokens
// ---------------------------------------------------------------------------

const COLORS = {
  'Base/White': '#FFFFFF',
  'Base/Black': '#000000',
  'Primary/background': '#F2F5FF',
  'Primary/select-hover': '#E8EDFF',
  'Primary/active': '#B4C4FF',
  'Primary/support': '#94ABFF',
  'Primary/main-color': '#1B4DFF',
  'Primary/text': '#042185',
  'Success/surface': '#D7FFEB',
  'Success/support': '#8FE7B8',
  'Success/main-color': '#11A75C',
  'Success/text': '#02542B',
  'Warning/surface': '#FFF2C4',
  'Warning/support': '#FFE176',
  'Warning/main-color': '#FFC700',
  'Warning/text': '#896B00',
  'Error/surface': '#FFF5F4',
  'Error/support': '#FFDCDA',
  'Error/main-color': '#FF3838',
  'Error/text': '#AB0A00',
  'Neutral/background': '#F9FAFB',
  'Neutral/support-light': '#E9EFF6',
  'Neutral/support-medium': '#D7DFE9',
  'Neutral/text-support': '#5E718D',
  'Neutral/text': '#1C222B',
}

// name → [style, size, lineHeight]
const TEXT_STYLES = {
  'Headline: 3/Bold': ['Bold', 48, 60],
  'Headline: 5/Bold': ['Bold', 32, 44],
  'Headline: 6/Bold': ['Bold', 24, 36],
  'Paragraph: 1/Semi Bold': ['Semi Bold', 22, 35],
  'Paragraph: 5/Regular': ['Regular', 14, 24],
  'Paragraph: 5/Medium': ['Medium', 14, 24],
  'Paragraph: 5/Bold': ['Bold', 14, 24],
  'Paragraph: 6/Regular': ['Regular', 12, 20],
  'Paragraph: 6/Medium': ['Medium', 12, 20],
}

const V = {} // 'primary/main-color' → Variable
const TS = {} // text style name → TextStyle
const ES = {} // effect style name → EffectStyle
const C = {} // component sets/components built below
const P = {} // component property keys: P.button.Label, …

function hexToRgb(hex) {
  const n = parseInt(hex.slice(1), 16)
  return { r: ((n >> 16) & 255) / 255, g: ((n >> 8) & 255) / 255, b: (n & 255) / 255 }
}

function tokenHex(key) {
  const name = Object.keys(COLORS).find((k) => k.toLowerCase() === key.toLowerCase())
  if (!name) throw new Error('Token desconhecido: ' + key)
  return COLORS[name]
}

/** A solid paint bound to a Keep color variable, e.g. paint('primary/main-color'). */
function paint(key, opacity) {
  const base = { type: 'SOLID', color: hexToRgb(tokenHex(key)) }
  if (opacity !== undefined) base.opacity = opacity
  const v = V[key.toLowerCase()]
  return v ? figma.variables.setBoundVariableForPaint(base, 'color', v) : base
}

async function setupTokens() {
  const collections = await figma.variables.getLocalVariableCollectionsAsync()
  let col = collections.find((c) => c.name === 'Keep · Colors')
  if (!col) col = figma.variables.createVariableCollection('Keep · Colors')
  const modeId = col.modes[0].modeId
  const existing = await figma.variables.getLocalVariablesAsync('COLOR')
  for (const [short, hex] of Object.entries(COLORS)) {
    const name = 'Colors/' + short
    let v = existing.find((x) => x.name === name && x.variableCollectionId === col.id)
    if (!v) v = figma.variables.createVariable(name, col, 'COLOR')
    v.setValueForMode(modeId, Object.assign(hexToRgb(hex), { a: 1 }))
    v.scopes = ['FRAME_FILL', 'SHAPE_FILL', 'TEXT_FILL', 'STROKE_COLOR', 'EFFECT_COLOR']
    V[short.toLowerCase()] = v
  }

  const textStyles = await figma.getLocalTextStylesAsync()
  for (const [name, [style, size, lh]] of Object.entries(TEXT_STYLES)) {
    let s = textStyles.find((x) => x.name === name)
    if (!s) {
      s = figma.createTextStyle()
      s.name = name
    }
    s.fontName = { family: FONT, style }
    s.fontSize = size
    s.lineHeight = { unit: 'PIXELS', value: lh }
    TS[name] = s
  }

  const effectStyles = await figma.getLocalEffectStylesAsync()
  const shadow = (y, blur, spread, a) => ({
    type: 'DROP_SHADOW',
    color: Object.assign(hexToRgb('#1C222B'), { a }),
    offset: { x: 0, y },
    radius: blur,
    spread,
    visible: true,
    blendMode: 'NORMAL',
  })
  const effects = {
    'Shadow/sm': [shadow(1, 3, 0, 0.1), shadow(1, 2, 0, 0.06)],
    'Shadow/xl': [shadow(20, 24, -4, 0.08), shadow(8, 8, -4, 0.03)],
    'Focus/md/primary/50': [
      { type: 'DROP_SHADOW', color: Object.assign(hexToRgb(COLORS['Primary/active']), { a: 1 }), offset: { x: 0, y: 0 }, radius: 0, spread: 4, visible: true, blendMode: 'NORMAL' },
    ],
  }
  for (const [name, list] of Object.entries(effects)) {
    let s = effectStyles.find((x) => x.name === name)
    if (!s) {
      s = figma.createEffectStyle()
      s.name = name
    }
    s.effects = list
    ES[name] = s
  }
}

// ---------------------------------------------------------------------------
// Node helpers
// ---------------------------------------------------------------------------

function pads(p) {
  if (typeof p === 'number') return [p, p, p, p]
  if (p.length === 2) return [p[0], p[1], p[0], p[1]]
  return p
}

/** Auto-layout frame that hugs its content. */
function box(dir, o) {
  o = o || {}
  const f = figma.createFrame()
  f.layoutMode = dir
  f.primaryAxisSizingMode = 'AUTO'
  f.counterAxisSizingMode = 'AUTO'
  f.fills = []
  f.clipsContent = false
  styleFrame(f, o)
  return f
}

function styleFrame(f, o) {
  if (o.name) f.name = o.name
  if (o.gap !== undefined) f.itemSpacing = o.gap
  if (o.pad !== undefined) {
    const p = pads(o.pad)
    f.paddingTop = p[0]
    f.paddingRight = p[1]
    f.paddingBottom = p[2]
    f.paddingLeft = p[3]
  }
  if (o.fill) f.fills = [paint(o.fill)]
  if (o.stroke) {
    f.strokes = [paint(o.stroke)]
    f.strokeWeight = o.strokeWeight || 1
    f.strokeAlign = 'INSIDE'
    if (o.dashed) f.dashPattern = [4, 4]
  }
  if (o.radius !== undefined) f.cornerRadius = o.radius
  if (o.align) f.counterAxisAlignItems = o.align
  if (o.justify) f.primaryAxisAlignItems = o.justify
}

/** Appends and applies sizing that only works once the child is inside an auto-layout parent. */
function add(parent, child, s) {
  parent.appendChild(child)
  s = s || {}
  if (s.h) child.layoutSizingHorizontal = s.h
  if (s.v) child.layoutSizingVertical = s.v
  if (s.grow) child.layoutGrow = 1
  if (child.type === 'TEXT' && s.h === 'FILL') child.textAutoResize = 'HEIGHT'
  return child
}

async function text(str, style, color, o) {
  o = o || {}
  const t = figma.createText()
  await t.setTextStyleIdAsync(TS[style].id)
  t.characters = str
  t.fills = [paint(color || 'neutral/text')]
  t.name = o.name || str.slice(0, 40)
  if (o.align) t.textAlignHorizontal = o.align
  return t
}

/** Emoji text (Keep has no style for pictures; size is set directly). */
function emoji(str, size) {
  const t = figma.createText()
  t.fontName = { family: FONT, style: 'Regular' }
  t.fontSize = size
  t.characters = str
  t.name = 'Emoji'
  t.textAlignHorizontal = 'CENTER'
  return t
}

function svgIcon(svg, color, size, name) {
  const node = figma.createNodeFromSvg(svg)
  node.name = name || 'Ícone'
  node.fills = []
  for (const n of node.findAll((x) => x.type === 'VECTOR' || x.type === 'ELLIPSE' || x.type === 'RECTANGLE')) {
    if (n.strokes.length) n.strokes = [paint(color)]
    if (n.fills.length) n.fills = [paint(color)]
  }
  node.resize(size, size)
  return node
}

const ICONS = {
  check: '<svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M3.5 8.5l3 3 6-7" stroke="#000" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  warning:
    '<svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M8 2l6.5 11.5h-13z" stroke="#000" stroke-width="1.6" stroke-linejoin="round"/><path d="M8 6.5v3" stroke="#000" stroke-width="1.6" stroke-linecap="round"/></svg>',
  info: '<svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="8" cy="8" r="6.2" stroke="#000" stroke-width="1.6"/><path d="M8 7.2v4" stroke="#000" stroke-width="1.6" stroke-linecap="round"/><path d="M8 4.6v.2" stroke="#000" stroke-width="1.8" stroke-linecap="round"/></svg>',
  sun: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="12" cy="12" r="4.5" stroke="#000" stroke-width="1.8"/><path d="M12 2.5v2.5M12 19v2.5M2.5 12H5M19 12h2.5M5.3 5.3l1.8 1.8M16.9 16.9l1.8 1.8M5.3 18.7l1.8-1.8M16.9 7.1l1.8-1.8" stroke="#000" stroke-width="1.8" stroke-linecap="round"/></svg>',
  list: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M9 6.5h11M9 12h11M9 17.5h11" stroke="#000" stroke-width="1.8" stroke-linecap="round"/><path d="M4.5 6.5h.01M4.5 12h.01M4.5 17.5h.01" stroke="#000" stroke-width="2.6" stroke-linecap="round"/></svg>',
  chart: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M4 20V13M10 20V8M16 20v-9M22 20H2" stroke="#000" stroke-width="1.8" stroke-linecap="round"/></svg>',
  chevron: '<svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M4 6l4 4 4-4" stroke="#000" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/></svg>',
}

function variant(set, props) {
  const want = Object.entries(props).map(([k, v]) => k + '=' + v)
  const found = set.children.find((c) => want.every((w) => c.name.split(', ').includes(w)))
  if (!found) throw new Error('Variante não encontrada em ' + set.name + ': ' + want.join(', '))
  return found
}

/** Creates an instance of a set's variant and fills its text/boolean properties by name. */
function inst(setName, variantProps, values) {
  const set = C[setName]
  const comp = set.type === 'COMPONENT_SET' ? variant(set, variantProps || {}) : set
  const i = comp.createInstance()
  if (values) setProps(i, setName, values)
  return i
}

function setProps(instance, setName, values) {
  const keys = P[setName] || {}
  const props = {}
  for (const [name, value] of Object.entries(values)) {
    if (!keys[name]) throw new Error('Propriedade ' + name + ' não existe em ' + setName)
    props[keys[name]] = value
  }
  instance.setProperties(props)
}

function nested(instance, name) {
  return instance.findOne((n) => n.type === 'INSTANCE' && n.name === name)
}

/** Combines variant components into a wrapping, documented set on the components page. */
function makeSet(components, name, description, width) {
  for (const c of components) COMPONENT_PAGE.appendChild(c)
  const set = figma.combineAsVariants(components, COMPONENT_PAGE)
  set.name = name
  set.description = description
  set.layoutMode = 'HORIZONTAL'
  set.layoutWrap = 'WRAP'
  set.primaryAxisSizingMode = 'FIXED'
  set.counterAxisSizingMode = 'AUTO'
  set.resize(width || 900, set.height)
  set.itemSpacing = 24
  set.counterAxisSpacing = 24
  set.paddingTop = set.paddingBottom = set.paddingLeft = set.paddingRight = 32
  set.fills = [paint('base/white')]
  set.strokes = [paint('primary/support')]
  set.dashPattern = [6, 4]
  set.cornerRadius = 6
  C[name] = set
  return set
}

/** Adds text properties to a set and links each variant's text layers (found by layer name). */
function textProps(set, defs) {
  P[set.name] = P[set.name] || {}
  for (const [prop, layerName, def] of defs) {
    const key = set.addComponentProperty(prop, 'TEXT', def)
    P[set.name][prop] = key
    for (const v of set.children) {
      for (const t of v.findAll((n) => n.type === 'TEXT' && n.name === layerName)) {
        t.componentPropertyReferences = { characters: key }
      }
    }
  }
}

function component(name) {
  const c = figma.createComponent()
  c.name = name
  c.fills = []
  return c
}

function autoComponent(name, dir, o) {
  const c = component(name)
  c.layoutMode = dir
  c.primaryAxisSizingMode = 'AUTO'
  c.counterAxisSizingMode = 'AUTO'
  styleFrame(c, o || {})
  return c
}

let COMPONENT_PAGE

// ---------------------------------------------------------------------------
// Components (built from Keep tokens; names follow Keep where Keep has them)
// ---------------------------------------------------------------------------

const BUTTON_LOOK = {
  Primary: { fill: 'primary/main-color', text: 'base/white' },
  Secondary: { fill: 'base/white', stroke: 'primary/active', text: 'primary/main-color' },
  'Secondary Gray': { fill: 'base/white', stroke: 'neutral/support-medium', text: 'neutral/text' },
  Tertiary: { text: 'neutral/text-support' },
  'Dash Border': { fill: 'base/white', stroke: 'neutral/support-medium', dashed: true, text: 'neutral/text-support' },
  'Link Color': { text: 'primary/main-color' },
}
const BUTTON_SIZE = { xsm: { h: 36, pad: [6, 12], box: 38 }, sm: { h: 40, pad: [8, 15], box: 42 } }

async function buildButton() {
  const specs = []
  for (const type of ['Primary', 'Secondary', 'Secondary Gray', 'Tertiary', 'Dash Border']) {
    for (const size of ['xsm', 'sm']) specs.push({ type, size, icon: 'No icon', destructive: 'False' })
  }
  specs.push({ type: 'Link Color', size: 'xsm', icon: 'No icon', destructive: 'False' })
  specs.push({ type: 'Link Color', size: 'sm', icon: 'No icon', destructive: 'False' })
  specs.push({ type: 'Secondary', size: 'sm', icon: 'Only - box', destructive: 'False' })
  specs.push({ type: 'Tertiary', size: 'xsm', icon: 'Only - box', destructive: 'False' })
  specs.push({ type: 'Tertiary', size: 'xsm', icon: 'Only - box', destructive: 'True' })

  const comps = []
  for (const s of specs) {
    const look = BUTTON_LOOK[s.type]
    const size = BUTTON_SIZE[s.size]
    const c = component(`Type=${s.type}, Size=${s.size}, Icon=${s.icon}, Destructive=${s.destructive}`)
    c.layoutMode = 'HORIZONTAL'
    c.primaryAxisAlignItems = 'CENTER'
    c.counterAxisAlignItems = 'CENTER'
    c.itemSpacing = 8
    c.cornerRadius = 6
    const iconOnly = s.icon === 'Only - box'
    if (s.type === 'Link Color') {
      c.primaryAxisSizingMode = 'AUTO'
      c.counterAxisSizingMode = 'AUTO'
    } else if (iconOnly) {
      c.resize(size.box, size.box)
      c.primaryAxisSizingMode = 'FIXED'
      c.counterAxisSizingMode = 'FIXED'
    } else {
      c.resize(100, size.h)
      c.primaryAxisSizingMode = 'AUTO'
      c.counterAxisSizingMode = 'FIXED'
      c.paddingLeft = c.paddingRight = size.pad[1]
      c.paddingTop = c.paddingBottom = size.pad[0]
    }
    styleFrame(c, { fill: look.fill, stroke: look.stroke, dashed: look.dashed })
    const color = s.destructive === 'True' ? 'error/text' : look.text
    const label = await text(iconOnly ? '✓' : 'Botão', 'Paragraph: 5/Bold', color, { name: 'Label' })
    c.appendChild(label)
    comps.push(c)
  }
  const set = makeSet(comps, 'Button', 'Keep Button. Primary: ação principal (uma por tela). Secondary: ações de apoio. Tertiary: ações discretas. Link Color: navegação em texto. Dash Border: “adicionar”. Only - box: botão só com ícone (use sempre um rótulo acessível).', 1100)
  textProps(set, [['Label', 'Label', 'Botão']])
}

async function buildBadge() {
  const looks = {
    Info: ['primary/select-hover', 'primary/active', 'primary/text', 'info'],
    Success: ['success/surface', 'success/support', 'success/text', 'check'],
    Warning: ['warning/surface', 'warning/support', 'warning/text', 'warning'],
    Neutral: ['neutral/support-light', 'neutral/support-medium', 'neutral/text', null],
  }
  const comps = []
  for (const [intent, [bg, border, fg, icon]] of Object.entries(looks)) {
    const c = autoComponent('Intent=' + intent, 'HORIZONTAL', { pad: [2, 10], gap: 4, radius: 16, fill: bg, stroke: border, align: 'CENTER' })
    if (icon) c.appendChild(svgIcon(ICONS[icon], fg, 12, 'Ícone'))
    c.appendChild(await text('Selo', 'Paragraph: 6/Medium', fg, { name: 'Texto' }))
    comps.push(c)
  }
  const set = makeSet(comps, 'Badge', 'Selos de status. Warning = “Atrasado” (nunca vermelho). Success = concluído. Info = informação. Neutral = exemplo/etiqueta.', 600)
  textProps(set, [['Texto', 'Texto', 'Selo']])
}

async function buildAvatar() {
  const comps = []
  for (const size of [40, 32, 28]) {
    const c = component('Size=' + size)
    c.layoutMode = 'HORIZONTAL'
    c.resize(size, size)
    c.primaryAxisSizingMode = 'FIXED'
    c.counterAxisSizingMode = 'FIXED'
    c.primaryAxisAlignItems = 'CENTER'
    c.counterAxisAlignItems = 'CENTER'
    c.cornerRadius = size / 2
    c.fills = [paint('neutral/support-light')]
    c.appendChild(emoji('👧', Math.round(size * 0.55)))
    comps.push(c)
  }
  const set = makeSet(comps, 'Avatar', 'Foto ou emoji de cada pessoa. Sem cores por pessoa: o Keep reserva cores para significado.', 400)
  textProps(set, [['Emoji', 'Emoji', '👧']])
}

async function buildStatusBar() {
  const c = component('Status bar')
  c.layoutMode = 'HORIZONTAL'
  c.resize(SCREEN_W, 44)
  c.primaryAxisSizingMode = 'FIXED'
  c.counterAxisSizingMode = 'FIXED'
  c.primaryAxisAlignItems = 'SPACE_BETWEEN'
  c.counterAxisAlignItems = 'CENTER'
  c.paddingLeft = c.paddingRight = 28
  c.fills = [paint('neutral/background')]
  c.appendChild(await text('07:09', 'Paragraph: 5/Bold', 'neutral/text', { name: 'Hora' }))
  const battery = box('HORIZONTAL', { name: 'Bateria', pad: 2, radius: 4, stroke: 'neutral/text' })
  const level = figma.createRectangle()
  level.resize(18, 8)
  level.cornerRadius = 2
  level.fills = [paint('neutral/text')]
  battery.appendChild(level)
  c.appendChild(battery)
  COMPONENT_PAGE.appendChild(c)
  C['Status bar'] = c
  P['Status bar'] = { Hora: c.addComponentProperty('Hora', 'TEXT', '07:09') }
  c.findOne((n) => n.type === 'TEXT').componentPropertyReferences = { characters: P['Status bar'].Hora }
}

async function buildTopBar() {
  const title = autoComponent('Type=Título', 'HORIZONTAL', { pad: [8, 16], gap: 12, align: 'CENTER', justify: 'SPACE_BETWEEN' })
  title.resize(SCREEN_W, 52)
  title.primaryAxisSizingMode = 'FIXED'
  title.counterAxisSizingMode = 'AUTO'
  const t = await text('Hoje', 'Headline: 6/Bold', 'neutral/text', { name: 'Título' })
  title.appendChild(t)
  const badge = inst('Badge', { Intent: 'Neutral' }, { Texto: 'Exemplo' })
  badge.name = 'Selo'
  title.appendChild(badge)

  const editor = autoComponent('Type=Editor', 'HORIZONTAL', { pad: [8, 16], gap: 12, align: 'CENTER', justify: 'SPACE_BETWEEN' })
  editor.resize(SCREEN_W, 56)
  editor.primaryAxisSizingMode = 'FIXED'
  editor.counterAxisSizingMode = 'AUTO'
  const back = inst('Button', { Type: 'Link Color', Size: 'sm' }, { Label: '← Voltar' })
  back.name = 'Voltar'
  editor.appendChild(back)
  const et = await text('Editar rotina', 'Paragraph: 5/Medium', 'neutral/text-support', { name: 'Título' })
  editor.appendChild(et)
  const save = inst('Button', { Type: 'Primary', Size: 'sm' }, { Label: 'Salvar' })
  save.name = 'Salvar'
  editor.appendChild(save)

  const set = makeSet([title, editor], 'Top bar', 'Barra superior. Título: nome da aba (com selo opcional). Editor: Voltar + Salvar (uma ação Primary por tela).', 900)
  textProps(set, [['Título', 'Título', 'Hoje']])
  const selo = set.addComponentProperty('Selo', 'BOOLEAN', false)
  P['Top bar'].Selo = selo
  const b = set.children[0].findOne((n) => n.name === 'Selo')
  b.componentPropertyReferences = { visible: selo }
}

async function buildTabBar() {
  const tabs = [
    ['Hoje', 'sun'],
    ['Rotinas', 'list'],
    ['Resumo', 'chart'],
  ]
  const comps = []
  for (const [active] of tabs) {
    const c = component('Active=' + active)
    c.layoutMode = 'VERTICAL'
    c.resize(SCREEN_W, 80)
    c.primaryAxisSizingMode = 'AUTO'
    c.counterAxisSizingMode = 'FIXED'
    c.counterAxisAlignItems = 'CENTER'
    c.fills = [paint('base/white')]
    c.strokes = [paint('neutral/support-medium')]
    c.strokeTopWeight = 1
    c.strokeBottomWeight = 0
    c.strokeLeftWeight = 0
    c.strokeRightWeight = 0
    c.paddingBottom = 8
    const row = box('HORIZONTAL', { name: 'Abas' })
    add(c, row, { h: 'FILL' })
    for (const [label, icon] of tabs) {
      const color = label === active ? 'primary/main-color' : 'neutral/text-support'
      const item = box('VERTICAL', { name: 'Aba ' + label, gap: 2, pad: [10, 0, 6, 0], align: 'CENTER' })
      item.appendChild(svgIcon(ICONS[icon], color, 24, 'Ícone'))
      item.appendChild(await text(label, 'Paragraph: 6/Medium', color, { name: 'Rótulo' }))
      add(row, item, { h: 'FILL' })
    }
    const indicator = figma.createRectangle()
    indicator.name = 'Home indicator'
    indicator.resize(134, 5)
    indicator.cornerRadius = 3
    indicator.fills = [paint('neutral/text')]
    c.appendChild(indicator)
    comps.push(c)
  }
  makeSet(comps, 'Tab bar', 'Navegação principal do celular dos pais: Hoje, Rotinas, Resumo.', 1300)
}

async function buildAlert() {
  const looks = {
    Sucesso: ['success/surface', 'success/support', 'success/main-color', 'success/text', 'check'],
    Info: ['primary/select-hover', 'primary/active', 'primary/main-color', 'primary/text', 'info'],
  }
  const comps = []
  for (const [intent, [bg, border, iconColor, fg, icon]] of Object.entries(looks)) {
    const c = autoComponent('Intent=' + intent, 'HORIZONTAL', { pad: [10, 12], gap: 10, radius: 6, fill: bg, stroke: border, align: 'CENTER' })
    c.resize(358, 44)
    c.primaryAxisSizingMode = 'FIXED'
    c.counterAxisSizingMode = 'AUTO'
    c.appendChild(svgIcon(ICONS[icon], iconColor, 18, 'Ícone'))
    add(c, await text('Mensagem', 'Paragraph: 5/Medium', fg, { name: 'Mensagem' }), { h: 'FILL' })
    const action = inst('Button', { Type: 'Link Color', Size: 'xsm' }, { Label: 'Desfazer' })
    action.name = 'Ação'
    c.appendChild(action)
    comps.push(c)
  }
  const set = makeSet(comps, 'Alert', 'Aviso curto no topo da tela depois de uma ação (toast). Cores do Keep para Success e Info.', 900)
  textProps(set, [['Mensagem', 'Mensagem', 'Mensagem']])
  const acao = set.addComponentProperty('Ação', 'BOOLEAN', true)
  P.Alert['Ação'] = acao
  for (const v of set.children) v.findOne((n) => n.name === 'Ação').componentPropertyReferences = { visible: acao }
}

async function buildRoutineToday() {
  const c = autoComponent('Routine today', 'VERTICAL', { pad: 16, gap: 4, radius: 6, fill: 'base/white', stroke: 'neutral/support-medium' })
  c.resize(358, 100)
  c.primaryAxisSizingMode = 'AUTO'
  c.counterAxisSizingMode = 'FIXED'
  add(c, await text('Manhã', 'Paragraph: 1/Semi Bold', 'neutral/text', { name: 'Rotina' }), { h: 'FILL' })
  add(c, await text('Sair às 07:40 · faltam 31 minutos', 'Paragraph: 5/Regular', 'neutral/text-support', { name: 'Prazo' }), { h: 'FILL' })
  const track = box('HORIZONTAL', { name: 'Progresso', radius: 4, fill: 'primary/active' })
  track.resize(326, 8)
  track.primaryAxisSizingMode = 'FIXED'
  track.counterAxisSizingMode = 'FIXED'
  track.clipsContent = true
  const fill = figma.createRectangle()
  fill.name = 'Preenchimento'
  fill.resize(110, 8)
  fill.cornerRadius = 4
  fill.fills = [paint('primary/main-color')]
  track.appendChild(fill)
  add(c, track, { h: 'FILL' })
  track.layoutSizingVertical = 'FIXED'
  COMPONENT_PAGE.appendChild(c)
  c.description = 'Rotina em andamento com o prazo e o tempo que falta (planejado de trás para frente).'
  C['Routine today'] = c
  P['Routine today'] = {}
  for (const [prop, def] of [
    ['Rotina', 'Manhã'],
    ['Prazo', 'Sair às 07:40 · faltam 31 minutos'],
  ]) {
    const key = c.addComponentProperty(prop, 'TEXT', def)
    P['Routine today'][prop] = key
    c.findOne((n) => n.type === 'TEXT' && n.name === prop).componentPropertyReferences = { characters: key }
  }
}

async function buildPersonCard() {
  const comps = []
  for (const state of ['Em andamento', 'Atrasado', 'Pronto']) {
    const c = autoComponent('State=' + state, 'HORIZONTAL', { pad: [10, 12], gap: 8, radius: 6, fill: 'base/white', stroke: 'neutral/support-medium', align: 'CENTER' })
    c.resize(358, 60)
    c.primaryAxisSizingMode = 'FIXED'
    c.counterAxisSizingMode = 'AUTO'
    const avatar = inst('Avatar', { Size: '40' })
    avatar.name = 'Avatar'
    c.appendChild(avatar)
    const col = box('VERTICAL', { name: 'Textos' })
    add(c, col, { h: 'FILL' })
    add(col, await text('Téo', 'Paragraph: 5/Medium', 'neutral/text', { name: 'Nome' }), { h: 'FILL' })
    add(col, await text('🚿 Tomar banho · até 07:05', 'Paragraph: 6/Regular', 'neutral/text-support', { name: 'Passo' }), { h: 'FILL' })
    if (state === 'Atrasado') c.appendChild(inst('Badge', { Intent: 'Warning' }, { Texto: 'Atrasado' }))
    if (state === 'Pronto') c.appendChild(inst('Badge', { Intent: 'Success' }, { Texto: 'Pronto' }))
    if (state !== 'Pronto') {
      const b = inst('Button', { Type: 'Secondary', Size: 'sm', Icon: 'Only - box' }, { Label: '✓' })
      b.name = 'Marcar como feito'
      c.appendChild(b)
    }
    comps.push(c)
  }
  const set = makeSet(comps, 'Person card', 'Uma pessoa na rotina de hoje: passo atual e prazo. Tocar no cartão abre a lista; o botão ✓ marca o passo pela pessoa.', 1200)
  textProps(set, [
    ['Nome', 'Nome', 'Téo'],
    ['Passo', 'Passo', '🚿 Tomar banho · até 07:05'],
  ])
  for (const v of set.children) nested(v, 'Avatar').isExposedInstance = true
}

async function buildStepLine() {
  const looks = {
    Feito: ['Paragraph: 5/Regular', 'neutral/text-support'],
    Atual: ['Paragraph: 5/Medium', 'primary/main-color'],
    Atrasado: ['Paragraph: 5/Medium', 'warning/text'],
    Próximo: ['Paragraph: 5/Regular', 'neutral/text'],
  }
  const comps = []
  for (const [state, [style, color]] of Object.entries(looks)) {
    const c = autoComponent('State=' + state, 'HORIZONTAL', { pad: [4, 0], gap: 8, align: 'CENTER' })
    c.resize(334, 32)
    c.primaryAxisSizingMode = 'FIXED'
    c.counterAxisSizingMode = 'AUTO'
    const time = await text('06:55', 'Paragraph: 6/Regular', 'neutral/text-support', { name: 'Horário' })
    c.appendChild(time)
    time.resize(40, time.height)
    time.textAutoResize = 'HEIGHT'
    add(c, await text('🚿 Tomar banho', style, color, { name: 'Passo' }), { h: 'FILL' })
    if (state === 'Feito') c.appendChild(inst('Button', { Type: 'Link Color', Size: 'xsm' }, { Label: 'Desfazer' }))
    if (state === 'Atrasado') c.appendChild(inst('Badge', { Intent: 'Warning' }, { Texto: 'Atrasado' }))
    if (state === 'Atual') c.appendChild(inst('Badge', { Intent: 'Info' }, { Texto: 'Agora' }))
    comps.push(c)
  }
  const set = makeSet(comps, 'Step line', 'Linha de passo na lista aberta de uma pessoa. Feito pode ser desfeito.', 800)
  textProps(set, [
    ['Horário', 'Horário', '06:55'],
    ['Passo', 'Passo', '🚿 Tomar banho'],
  ])
}

async function buildEditableStep() {
  const comps = []
  for (const isNew of ['Não', 'Sim']) {
    const c = autoComponent('Novo=' + isNew, 'HORIZONTAL', { pad: [6, 4, 6, 10], gap: 8, align: 'CENTER', fill: isNew === 'Sim' ? 'primary/select-hover' : 'base/white' })
    c.resize(358, 50)
    c.primaryAxisSizingMode = 'FIXED'
    c.counterAxisSizingMode = 'AUTO'
    const times = box('VERTICAL', { name: 'Horários' })
    times.appendChild(await text('06:50', 'Paragraph: 6/Regular', 'neutral/text-support', { name: 'Início' }))
    times.appendChild(await text('06:55', 'Paragraph: 6/Regular', 'neutral/text-support', { name: 'Fim' }))
    c.appendChild(times)
    add(c, await text('🌞 Acordar', 'Paragraph: 5/Regular', 'neutral/text', { name: 'Passo' }), { h: 'FILL' })
    c.appendChild(await text('5 min', 'Paragraph: 6/Medium', 'neutral/text', { name: 'Minutos' }))
    const actions = box('HORIZONTAL', { name: 'Ações' })
    for (const [label, destructive, name] of [
      ['↑', 'False', 'Mover para cima'],
      ['↓', 'False', 'Mover para baixo'],
      ['✕', 'True', 'Remover passo'],
    ]) {
      const b = inst('Button', { Type: 'Tertiary', Size: 'xsm', Icon: 'Only - box', Destructive: destructive }, { Label: label })
      b.name = name
      actions.appendChild(b)
    }
    c.appendChild(actions)
    comps.push(c)
  }
  const set = makeSet(comps, 'Editable step', 'Passo no editor de rotina, com horários calculados de trás para frente a partir do prazo. Novo = destaque logo após adicionar.', 900)
  textProps(set, [
    ['Início', 'Início', '06:50'],
    ['Fim', 'Fim', '06:55'],
    ['Passo', 'Passo', '🌞 Acordar'],
    ['Minutos', 'Minutos', '5 min'],
  ])
}

async function buildOwnerHeader() {
  const c = autoComponent('Owner header', 'HORIZONTAL', { gap: 8, align: 'CENTER' })
  c.resize(358, 32)
  c.primaryAxisSizingMode = 'FIXED'
  c.counterAxisSizingMode = 'AUTO'
  const avatar = inst('Avatar', { Size: '32' })
  avatar.name = 'Avatar'
  c.appendChild(avatar)
  add(c, await text('Passos de Lia', 'Paragraph: 5/Medium', 'neutral/text', { name: 'Título' }), { h: 'FILL' })
  c.appendChild(await text('começa às 06:50', 'Paragraph: 6/Regular', 'neutral/text-support', { name: 'Início' }))
  COMPONENT_PAGE.appendChild(c)
  avatar.isExposedInstance = true
  c.description = 'Cabeçalho dos passos de uma pessoa no editor de rotina.'
  C['Owner header'] = c
  P['Owner header'] = {}
  for (const [prop, def] of [
    ['Título', 'Passos de Lia'],
    ['Início', 'começa às 06:50'],
  ]) {
    const key = c.addComponentProperty(prop, 'TEXT', def)
    P['Owner header'][prop] = key
    c.findOne((n) => n.type === 'TEXT' && n.name === prop).componentPropertyReferences = { characters: key }
  }
}

async function buildField() {
  const comps = []
  for (const type of ['Texto', 'Seleção']) {
    for (const state of ['Padrão', 'Foco']) {
      const c = autoComponent(`Type=${type}, State=${state}`, 'VERTICAL', { gap: 6 })
      c.resize(358, 80)
      c.primaryAxisSizingMode = 'AUTO'
      c.counterAxisSizingMode = 'FIXED'
      add(c, await text('Nome da rotina', 'Paragraph: 5/Medium', 'neutral/text-support', { name: 'Rótulo' }), { h: 'FILL' })
      const input = box('HORIZONTAL', {
        name: 'Campo',
        pad: [0, 12],
        gap: 8,
        radius: 6,
        fill: 'base/white',
        stroke: state === 'Foco' ? 'primary/main-color' : 'neutral/support-medium',
        align: 'CENTER',
      })
      add(c, input, { h: 'FILL' })
      input.resize(input.width, 44)
      input.layoutSizingVertical = 'FIXED'
      add(input, await text('Manhã', 'Paragraph: 5/Regular', 'neutral/text', { name: 'Valor' }), { h: 'FILL' })
      if (type === 'Seleção') input.appendChild(svgIcon(ICONS.chevron, 'neutral/text-support', 16, 'Chevron'))
      if (state === 'Foco') await input.setEffectStyleIdAsync(ES['Focus/md/primary/50'].id)
      comps.push(c)
    }
  }
  const set = makeSet(comps, 'Input', 'Campo de formulário do Keep: rótulo em neutral/text-support, borda neutral/support-medium e foco em primary/main-color com anel.', 800)
  textProps(set, [
    ['Rótulo', 'Rótulo', 'Nome da rotina'],
    ['Valor', 'Valor', 'Manhã'],
  ])
}

async function buildChip() {
  const comps = []
  for (const on of ['Sim', 'Não']) {
    const c = autoComponent('Selecionado=' + on, 'HORIZONTAL', {
      pad: [0, 10],
      radius: 18,
      fill: on === 'Sim' ? 'primary/select-hover' : 'base/white',
      stroke: on === 'Sim' ? 'primary/active' : 'neutral/support-medium',
      align: 'CENTER',
      justify: 'CENTER',
    })
    c.resize(48, 36)
    c.primaryAxisSizingMode = 'AUTO'
    c.counterAxisSizingMode = 'FIXED'
    c.minWidth = 44
    c.appendChild(await text('Seg', 'Paragraph: 5/Medium', on === 'Sim' ? 'primary/text' : 'neutral/text-support', { name: 'Dia' }))
    comps.push(c)
  }
  const set = makeSet(comps, 'Day chip', 'Dia da semana em que a rotina acontece.', 400)
  textProps(set, [['Dia', 'Dia', 'Seg']])
}

async function buildEmojiOption() {
  const comps = []
  for (const on of ['Sim', 'Não']) {
    const c = component('Selecionado=' + on)
    c.layoutMode = 'HORIZONTAL'
    c.resize(40, 40)
    c.primaryAxisSizingMode = 'FIXED'
    c.counterAxisSizingMode = 'FIXED'
    c.primaryAxisAlignItems = 'CENTER'
    c.counterAxisAlignItems = 'CENTER'
    c.cornerRadius = 6
    c.fills = [paint(on === 'Sim' ? 'primary/select-hover' : 'neutral/background')]
    if (on === 'Sim') {
      c.strokes = [paint('primary/main-color')]
      c.strokeWeight = 1
      c.strokeAlign = 'INSIDE'
    }
    c.appendChild(emoji('🐶', 20))
    comps.push(c)
  }
  const set = makeSet(comps, 'Picture option', 'Figura do passo (ajuda quem ainda não lê).', 400)
  textProps(set, [['Emoji', 'Emoji', '🐶']])
}

async function buildRoutineCard() {
  const c = autoComponent('Routine card', 'HORIZONTAL', { pad: [14, 16], gap: 12, radius: 6, fill: 'base/white', stroke: 'neutral/support-medium', align: 'CENTER' })
  c.resize(358, 80)
  c.primaryAxisSizingMode = 'FIXED'
  c.counterAxisSizingMode = 'AUTO'
  const col = box('VERTICAL', { name: 'Textos' })
  add(c, col, { h: 'FILL' })
  add(col, await text('Manhã', 'Paragraph: 1/Semi Bold', 'neutral/text', { name: 'Nome' }), { h: 'FILL' })
  add(col, await text('Sair às 07:40', 'Paragraph: 5/Regular', 'neutral/text-support', { name: 'Prazo' }), { h: 'FILL' })
  add(col, await text('Seg · Ter · Qua · Qui · Sex', 'Paragraph: 6/Regular', 'neutral/text-support', { name: 'Dias' }), { h: 'FILL' })
  const edit = inst('Button', { Type: 'Secondary', Size: 'sm' }, { Label: 'Editar' })
  edit.name = 'Editar'
  c.appendChild(edit)
  COMPONENT_PAGE.appendChild(c)
  c.description = 'Rotina na lista de rotinas.'
  C['Routine card'] = c
  P['Routine card'] = {}
  for (const [prop, def] of [
    ['Nome', 'Manhã'],
    ['Prazo', 'Sair às 07:40'],
    ['Dias', 'Seg · Ter · Qua · Qui · Sex'],
  ]) {
    const key = c.addComponentProperty(prop, 'TEXT', def)
    P['Routine card'][prop] = key
    c.findOne((n) => n.type === 'TEXT' && n.name === prop).componentPropertyReferences = { characters: key }
  }
}

async function buildBarRow() {
  const c = autoComponent('Person bar', 'HORIZONTAL', { gap: 8, align: 'CENTER' })
  c.resize(358, 28)
  c.primaryAxisSizingMode = 'FIXED'
  c.counterAxisSizingMode = 'AUTO'
  const avatar = inst('Avatar', { Size: '28' })
  avatar.name = 'Avatar'
  c.appendChild(avatar)
  const name = await text('Téo', 'Paragraph: 5/Regular', 'neutral/text', { name: 'Nome' })
  c.appendChild(name)
  name.resize(56, name.height)
  name.textAutoResize = 'HEIGHT'
  const track = box('HORIZONTAL', { name: 'Trilho', radius: 6, fill: 'neutral/support-light' })
  add(c, track, { h: 'FILL' })
  track.resize(track.width, 12)
  track.layoutSizingVertical = 'FIXED'
  track.clipsContent = true
  const bar = figma.createRectangle()
  bar.name = 'Preenchimento'
  bar.resize(180, 12)
  bar.topRightRadius = 4
  bar.bottomRightRadius = 4
  bar.fills = [paint('primary/main-color')]
  track.appendChild(bar)
  const value = await text('2', 'Paragraph: 5/Medium', 'neutral/text', { name: 'Valor', align: 'RIGHT' })
  c.appendChild(value)
  value.resize(24, value.height)
  value.textAutoResize = 'HEIGHT'
  COMPONENT_PAGE.appendChild(c)
  avatar.isExposedInstance = true
  c.description = 'Barra de passos atrasados por pessoa (uma série, primary/main-color). Ajuste a largura de “Preenchimento” pelo valor.'
  C['Person bar'] = c
  P['Person bar'] = {}
  for (const [prop, def] of [
    ['Nome', 'Téo'],
    ['Valor', '2'],
  ]) {
    const key = c.addComponentProperty(prop, 'TEXT', def)
    P['Person bar'][prop] = key
    c.findOne((n) => n.type === 'TEXT' && n.name === prop).componentPropertyReferences = { characters: key }
  }
}

async function buildComponents() {
  await buildButton()
  await buildBadge()
  await buildAvatar()
  await buildStatusBar()
  await buildTopBar()
  await buildTabBar()
  await buildAlert()
  await buildRoutineToday()
  await buildPersonCard()
  await buildStepLine()
  await buildEditableStep()
  await buildOwnerHeader()
  await buildField()
  await buildChip()
  await buildEmojiOption()
  await buildRoutineCard()
  await buildBarRow()

  // Lay the components out in a column on their page.
  let y = 0
  for (const node of COMPONENT_PAGE.children) {
    node.x = 0
    node.y = y
    y += node.height + 80
  }
}

// ---------------------------------------------------------------------------
// Sample data (same as the demo)
// ---------------------------------------------------------------------------

const PEOPLE = {
  lia: { name: 'Lia', emoji: '👧' },
  teo: { name: 'Téo', emoji: '👦' },
  bia: { name: 'Bia', emoji: '👩‍🎓' },
  ana: { name: 'Ana', emoji: '👩' },
  carlos: { name: 'Carlos', emoji: '👨' },
}
const ORDER = ['lia', 'teo', 'bia', 'ana', 'carlos']
const DEADLINE = 7 * 60 + 40

const MORNING = {
  lia: [['🌞', 'Acordar', 5], ['🚽', 'Ir ao banheiro', 5], ['🥣', 'Tomar café', 15], ['🪥', 'Escovar os dentes', 5], ['👕', 'Vestir o uniforme', 10], ['👟', 'Calçar os sapatos', 5], ['🎒', 'Pegar a mochila', 5]],
  teo: [['⏰', 'Acordar', 5], ['🚿', 'Tomar banho', 10], ['👕', 'Vestir o uniforme', 5], ['🥣', 'Tomar café', 15], ['🪥', 'Escovar os dentes', 5], ['🎒', 'Arrumar a mochila', 5], ['👟', 'Calçar o tênis', 5]],
  bia: [['⏰', 'Acordar', 5], ['🚿', 'Tomar banho', 15], ['👕', 'Se vestir', 10], ['🥣', 'Tomar café', 10], ['🪥', 'Escovar os dentes', 5], ['📅', 'Conferir a agenda do dia', 5]],
  ana: [['🛏️', 'Acordar as crianças', 10], ['🥪', 'Montar as lancheiras', 15], ['👔', 'Se arrumar', 10]],
  carlos: [['🍳', 'Preparar o café da manhã', 20], ['🎒', 'Conferir as mochilas', 5], ['🗑️', 'Levar o lixo para fora', 5], ['🔑', 'Pegar a chave do carro', 5]],
}

const clock = (m) => String(Math.floor(m / 60)).padStart(2, '0') + ':' + String(m % 60).padStart(2, '0')

/** Plans steps backwards so the last one ends at the deadline. */
function plan(steps) {
  let end = DEADLINE
  const out = []
  for (let i = steps.length - 1; i >= 0; i--) {
    const [e, title, min] = steps[i]
    out.unshift({ emoji: e, title, min, start: end - min, end })
    end -= min
  }
  return out
}

// ---------------------------------------------------------------------------
// Screens
// ---------------------------------------------------------------------------

/** A phone screen: status bar, top bar, scrolling content and (optionally) the tab bar. */
async function screen(parent, name, o) {
  const f = figma.createFrame()
  f.name = name
  f.layoutMode = 'VERTICAL'
  f.resize(SCREEN_W, SCREEN_H)
  f.counterAxisSizingMode = 'FIXED'
  f.primaryAxisSizingMode = 'AUTO'
  f.minHeight = SCREEN_H
  f.fills = [paint('neutral/background')]
  f.clipsContent = true
  parent.appendChild(f)
  add(f, inst('Status bar', null, { Hora: o.time || '07:09' }), { h: 'FILL' })
  const top =
    o.editor
      ? inst('Top bar', { Type: 'Editor' }, { Título: 'Editar rotina' })
      : inst('Top bar', { Type: 'Título' }, { Título: o.title, Selo: !!o.badge })
  top.name = 'Top bar'
  add(f, top, { h: 'FILL' })
  const content = box('VERTICAL', { name: 'Conteúdo', gap: 16, pad: [8, 16, 24, 16] })
  add(f, content, { h: 'FILL', grow: true })
  return { frame: f, content, top }
}

function tabBar(s, active) {
  const t = inst('Tab bar', { Active: active })
  t.name = 'Tab bar'
  add(s.frame, t, { h: 'FILL' })
  return t
}

function tabItem(tabBarInstance, label) {
  return tabBarInstance.findOne((n) => n.name === 'Aba ' + label)
}

function alert(s, intent, message, action) {
  const a = inst('Alert', { Intent: intent }, { Mensagem: message, Ação: !!action })
  a.name = 'Alert – ' + message
  add(s.content, a, { h: 'FILL' })
  return a
}

function personCard(parent, id, state, stepText) {
  const p = PEOPLE[id]
  const c = inst('Person card', { State: state }, { Nome: p.name, Passo: stepText })
  setProps(nested(c, 'Avatar'), 'Avatar', { Emoji: p.emoji })
  c.name = 'Person card – ' + p.name
  add(parent, c, { h: 'FILL' })
  return c
}

const TODAY_CARDS = {
  lia: ['Em andamento', '🥣 Tomar café · até 07:15'],
  teo: ['Atrasado', '🚿 Tomar banho · até 07:05'],
  bia: ['Em andamento', '🚿 Tomar banho · até 07:10'],
  ana: ['Em andamento', '🛏️ Acordar as crianças · até 07:15'],
  carlos: ['Em andamento', '🍳 Preparar o café da manhã · até 07:25'],
}

/** "Hoje" tab. `expandTeo`: 'late' | 'done' shows Téo's full list. */
async function todayScreen(parent, name, o) {
  o = o || {}
  const s = await screen(parent, name, { title: 'Hoje' })
  if (o.toast) alert(s, 'Sucesso', o.toast, true)
  const rt = inst('Routine today', null, { Rotina: 'Manhã', Prazo: 'Sair às 07:40 · faltam 31 minutos' })
  add(s.content, rt, { h: 'FILL' })
  const list = box('VERTICAL', { name: 'Pessoas', gap: 8 })
  add(s.content, list, { h: 'FILL' })
  const cards = {}
  for (const id of ORDER) {
    let [state, step] = TODAY_CARDS[id]
    if (id === 'teo' && o.expandTeo === 'done') {
      state = 'Em andamento'
      step = '👕 Vestir o uniforme · até 07:10'
    }
    if (id === 'teo' && o.expandTeo) {
      const wrap = box('VERTICAL', { name: 'Téo – aberto', radius: 6, fill: 'base/white', stroke: 'primary/active' })
      add(list, wrap, { h: 'FILL' })
      const card = personCard(wrap, id, state, step)
      card.strokes = []
      cards[id] = card
      const steps = box('VERTICAL', { name: 'Passos do Téo', pad: [6, 12, 10, 12] })
      steps.strokes = [paint('neutral/support-medium')]
      steps.strokeTopWeight = 1
      steps.strokeBottomWeight = steps.strokeLeftWeight = steps.strokeRightWeight = 0
      add(wrap, steps, { h: 'FILL' })
      const planned = plan(MORNING.teo)
      planned.forEach((st, i) => {
        let lineState = i === 0 ? 'Feito' : i === 1 ? 'Atrasado' : 'Próximo'
        if (o.expandTeo === 'done') lineState = i <= 1 ? 'Feito' : i === 2 ? 'Atual' : 'Próximo'
        const line = inst('Step line', { State: lineState }, { Horário: clock(st.start), Passo: st.emoji + ' ' + st.title })
        line.name = 'Step line – ' + st.title
        add(steps, line, { h: 'FILL' })
        if (i === 1) cards.teoLateLine = line
      })
    } else {
      cards[id] = personCard(list, id, state, step)
    }
  }
  const tabs = tabBar(s, 'Hoje')
  return Object.assign(s, { cards, tabs })
}

async function routinesScreen(parent, name, toast) {
  const s = await screen(parent, name, { title: 'Rotinas' })
  if (toast) alert(s, 'Sucesso', toast, false)
  const list = box('VERTICAL', { name: 'Rotinas', gap: 8 })
  add(s.content, list, { h: 'FILL' })
  const morning = inst('Routine card', null, { Nome: 'Manhã', Prazo: 'Sair às 07:40', Dias: 'Seg · Ter · Qua · Qui · Sex' })
  morning.name = 'Routine card – Manhã'
  add(list, morning, { h: 'FILL' })
  const night = inst('Routine card', null, { Nome: 'Noite', Prazo: 'Dormir às 21:00', Dias: 'Dom · Seg · Ter · Qua · Qui · Sex · Sáb' })
  night.name = 'Routine card – Noite'
  add(list, night, { h: 'FILL' })
  const tabs = tabBar(s, 'Rotinas')
  return Object.assign(s, { editMorning: nested(morning, 'Editar'), tabs })
}

function field(parent, type, state, label, value) {
  const f = inst('Input', { Type: type, State: state }, { Rótulo: label, Valor: value })
  f.name = 'Input – ' + label
  add(parent, f, { h: 'FILL' })
  return f
}

/** Routine editor. mode: 'closed' (add button) | 'form' (add-step form open) | 'added' (new step highlighted). */
async function editorScreen(parent, name, mode) {
  const s = await screen(parent, name, { editor: true })
  if (mode === 'added') alert(s, 'Sucesso', 'Passo adicionado para Téo', true)
  field(s.content, 'Texto', 'Padrão', 'Nome da rotina', 'Manhã')
  const row = box('HORIZONTAL', { name: 'Prazo', gap: 12 })
  add(s.content, row, { h: 'FILL' })
  add(row, inst('Input', { Type: 'Texto', State: 'Padrão' }, { Rótulo: 'O que acontece no fim', Valor: 'Sair' }), { h: 'FILL' })
  add(row, inst('Input', { Type: 'Texto', State: 'Padrão' }, { Rótulo: 'Horário final', Valor: '07:40' }), { h: 'FILL' })

  const days = box('VERTICAL', { name: 'Dias', gap: 6 })
  add(s.content, days, { h: 'FILL' })
  add(days, await text('Dias', 'Paragraph: 5/Medium', 'neutral/text-support', { name: 'Rótulo' }), { h: 'FILL' })
  const chips = box('HORIZONTAL', { name: 'Chips', gap: 6 })
  chips.layoutWrap = 'WRAP'
  add(days, chips, { h: 'FILL' })
  ;['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].forEach((d, i) => {
    const on = i >= 1 && i <= 5
    const chip = inst('Day chip', { Selecionado: on ? 'Sim' : 'Não' }, { Dia: d })
    chip.name = 'Day chip – ' + d
    chips.appendChild(chip)
  })
  add(s.content, await text('Os horários são calculados de trás para frente, a partir de “Sair às 07:40”.', 'Paragraph: 6/Regular', 'neutral/text-support', { name: 'Ajuda' }), { h: 'FILL' })

  let addButton = null
  let submit = null
  if (mode === 'form') {
    const form = box('VERTICAL', { name: 'Adicionar passo', gap: 12, pad: 16, radius: 6, fill: 'base/white', stroke: 'primary/active' })
    add(s.content, form, { h: 'FILL' })
    add(form, await text('Adicionar passo', 'Paragraph: 5/Medium', 'neutral/text', { name: 'Título' }), { h: 'FILL' })
    field(form, 'Seleção', 'Padrão', 'Responsável', '👦 Téo')
    const r = box('HORIZONTAL', { name: 'Nome e minutos', gap: 12 })
    add(form, r, { h: 'FILL' })
    const nameField = add(r, inst('Input', { Type: 'Texto', State: 'Foco' }, { Rótulo: 'Nome do passo', Valor: 'Dar comida ao cachorro' }), { h: 'FILL' })
    nameField.layoutGrow = 3
    const minutes = add(r, inst('Input', { Type: 'Texto', State: 'Padrão' }, { Rótulo: 'Minutos', Valor: '5' }), { h: 'FILL' })
    minutes.layoutGrow = 1
    const pics = box('VERTICAL', { name: 'Figura', gap: 6 })
    add(form, pics, { h: 'FILL' })
    add(pics, await text('Figura', 'Paragraph: 5/Medium', 'neutral/text-support', { name: 'Rótulo' }), { h: 'FILL' })
    const grid = box('HORIZONTAL', { name: 'Figuras', gap: 4 })
    grid.layoutWrap = 'WRAP'
    grid.counterAxisSpacing = 4
    add(pics, grid, { h: 'FILL' })
    for (const e of ['🌞', '⏰', '🚽', '🚿', '🛁', '🪥', '🥣', '🍳', '🥪', '👕', '🩳', '👟', '🎒', '📅', '📚', '📖', '🧸', '🧺', '🍽️', '🗑️', '🔑', '💊', '🐶', '📵']) {
      const opt = inst('Picture option', { Selecionado: e === '🐶' ? 'Sim' : 'Não' }, { Emoji: e })
      opt.name = 'Figura ' + e
      grid.appendChild(opt)
    }
    const actions = box('HORIZONTAL', { name: 'Ações', gap: 8, justify: 'MAX' })
    add(form, actions, { h: 'FILL' })
    actions.appendChild(inst('Button', { Type: 'Tertiary', Size: 'sm' }, { Label: 'Cancelar' }))
    submit = inst('Button', { Type: 'Primary', Size: 'sm' }, { Label: 'Adicionar passo' })
    submit.name = 'Adicionar passo'
    actions.appendChild(submit)
  } else {
    addButton = inst('Button', { Type: 'Dash Border', Size: 'sm' }, { Label: '+ Adicionar passo' })
    addButton.name = 'Adicionar passo'
    add(s.content, addButton, { h: 'FILL' })
  }

  let newRow = null
  for (const id of ORDER) {
    const steps = MORNING[id].slice()
    if (id === 'teo' && mode === 'added') steps.push(['🐶', 'Dar comida ao cachorro', 5])
    const planned = plan(steps)
    const section = box('VERTICAL', { name: 'Passos de ' + PEOPLE[id].name, gap: 8 })
    add(s.content, section, { h: 'FILL' })
    const head = inst('Owner header', null, { Título: 'Passos de ' + PEOPLE[id].name, Início: 'começa às ' + clock(planned[0].start) })
    setProps(nested(head, 'Avatar'), 'Avatar', { Emoji: PEOPLE[id].emoji })
    add(section, head, { h: 'FILL' })
    const list = box('VERTICAL', { name: 'Lista', radius: 6, fill: 'base/white', stroke: 'neutral/support-medium' })
    list.clipsContent = true
    add(section, list, { h: 'FILL' })
    planned.forEach((st, i) => {
      const isNew = id === 'teo' && mode === 'added' && i === planned.length - 1
      const row = inst('Editable step', { Novo: isNew ? 'Sim' : 'Não' }, { Início: clock(st.start), Fim: clock(st.end), Passo: st.emoji + ' ' + st.title, Minutos: st.min + ' min' })
      row.name = 'Editable step – ' + st.title
      add(list, row, { h: 'FILL' })
      if (isNew) newRow = row
    })
  }
  return Object.assign(s, { addButton, submit, save: nested(s.top, 'Salvar'), newRow })
}

async function summaryScreen(parent, name) {
  const s = await screen(parent, name, { title: 'Resumo da semana', badge: true })
  add(s.content, await text('Números de exemplo. Com uso real, o app conta sozinho os passos atrasados ou pulados.', 'Paragraph: 6/Regular', 'neutral/text-support', { name: 'Nota' }), { h: 'FILL' })

  const hero = box('VERTICAL', { name: 'Total da semana', pad: 16, radius: 6, fill: 'base/white', stroke: 'neutral/support-medium' })
  add(s.content, hero, { h: 'FILL' })
  add(hero, await text('Passos atrasados nesta semana', 'Paragraph: 5/Regular', 'neutral/text-support', { name: 'Rótulo' }), { h: 'FILL' })
  const heroRow = box('HORIZONTAL', { name: 'Números', gap: 12, align: 'BASELINE' })
  add(hero, heroRow, { h: 'FILL' })
  heroRow.appendChild(await text('3', 'Headline: 3/Bold', 'neutral/text', { name: 'Esta semana' }))
  heroRow.appendChild(await text('7 na semana passada', 'Paragraph: 5/Regular', 'neutral/text-support', { name: 'Semana passada' }))

  const people = box('VERTICAL', { name: 'Por pessoa', gap: 10 })
  add(s.content, people, { h: 'FILL' })
  add(people, await text('Por pessoa nesta semana', 'Paragraph: 5/Medium', 'neutral/text', { name: 'Título' }), { h: 'FILL' })
  const values = { lia: 0, teo: 2, bia: 0, ana: 0, carlos: 1 }
  for (const id of ORDER) {
    const row = inst('Person bar', null, { Nome: PEOPLE[id].name, Valor: String(values[id]) })
    setProps(nested(row, 'Avatar'), 'Avatar', { Emoji: PEOPLE[id].emoji })
    row.name = 'Person bar – ' + PEOPLE[id].name
    add(people, row, { h: 'FILL' })
    const bar = row.findOne((n) => n.name === 'Preenchimento')
    const track = row.findOne((n) => n.name === 'Trilho')
    const width = Math.round((values[id] / 2) * track.width)
    try {
      if (width === 0) bar.visible = false
      else bar.resize(width, 12)
    } catch (e) {
      WARNINGS.push('Barra de ' + PEOPLE[id].name + ' não redimensionada: ' + e.message)
    }
  }

  const today = box('VERTICAL', { name: 'Hoje', gap: 8 })
  add(s.content, today, { h: 'FILL' })
  add(today, await text('Hoje', 'Paragraph: 5/Medium', 'neutral/text', { name: 'Título' }), { h: 'FILL' })
  const entry = box('HORIZONTAL', { name: 'Téo – Tomar banho', gap: 8, align: 'CENTER', justify: 'SPACE_BETWEEN' })
  add(today, entry, { h: 'FILL' })
  entry.appendChild(await text('👦 Téo · 🚿 Tomar banho', 'Paragraph: 5/Regular', 'neutral/text', { name: 'Passo' }))
  entry.appendChild(inst('Badge', { Intent: 'Warning' }, { Texto: '4 min atrasado' }))
  add(s.content, await text('Visível só para os pais.', 'Paragraph: 6/Regular', 'neutral/text-support', { name: 'Privacidade' }), { h: 'FILL' })
  tabBar(s, 'Resumo')
  return s
}

// ---------------------------------------------------------------------------
// Flow layout, arrows and prototype
// ---------------------------------------------------------------------------

const GAP = 220 // space between screens, room for arrows
const LABEL_W = 360

async function scenarioLabel(section, o) {
  const card = box('VERTICAL', { name: 'Início do fluxo – ' + o.title, gap: 12, pad: 24, radius: 6, fill: 'base/white', stroke: 'primary/active', strokeWeight: 2 })
  card.resize(LABEL_W, 200)
  card.counterAxisSizingMode = 'FIXED'
  card.primaryAxisSizingMode = 'AUTO'
  section.appendChild(card)
  card.appendChild(inst('Badge', { Intent: 'Info' }, { Texto: 'Início do fluxo' }))
  add(card, await text(o.eyebrow, 'Paragraph: 6/Medium', 'primary/main-color', { name: 'Cenário' }), { h: 'FILL' })
  add(card, await text(o.title, 'Headline: 6/Bold', 'neutral/text', { name: 'Título' }), { h: 'FILL' })
  add(card, await text(o.description, 'Paragraph: 5/Regular', 'neutral/text-support', { name: 'Descrição' }), { h: 'FILL' })
  const meta = box('VERTICAL', { name: 'Detalhes', gap: 4 })
  add(card, meta, { h: 'FILL' })
  for (const line of o.meta) add(meta, await text(line, 'Paragraph: 6/Regular', 'neutral/text', { name: 'Detalhe' }), { h: 'FILL' })
  return card
}

function absBox(node) {
  const t = node.absoluteTransform
  return { x: t[0][2], y: t[1][2], w: node.width, h: node.height }
}

/**
 * Elbow arrow in the Autoflow style: a dot on the tapped element, a rounded
 * orthogonal line and an arrowhead on the target screen's left edge.
 */
async function arrow(section, from, fromScreen, to, label) {
  const sec = absBox(section)
  const a = absBox(from)
  const src = absBox(fromScreen)
  const b = absBox(to)
  const x1 = a.x + a.w - sec.x
  const y1 = a.y + a.h / 2 - sec.y
  const x2 = b.x - sec.x - 4
  const y2 = b.y + 120 - sec.y
  const xm = src.x + src.w - sec.x + (b.x - (src.x + src.w)) / 2

  const pts = [
    [x1, y1],
    [xm, y1],
    [xm, y2],
    [x2, y2],
  ]
  const minX = Math.min(...pts.map((p) => p[0]))
  const minY = Math.min(...pts.map((p) => p[1]))
  const vec = figma.createVector()
  vec.name = 'Seta – ' + label
  section.appendChild(vec)
  vec.x = minX
  vec.y = minY
  const vertices = pts.map(([x, y], i) => {
    const v = { x: x - minX, y: y - minY }
    if (i === pts.length - 1) v.strokeCap = 'ARROW_LINES'
    return v
  })
  try {
    await vec.setVectorNetworkAsync({
      vertices,
      segments: [
        { start: 0, end: 1 },
        { start: 1, end: 2 },
        { start: 2, end: 3 },
      ],
      regions: [],
    })
  } catch (e) {
    // Fallback: same path without a per-vertex cap; the cap then applies to both ends.
    vec.vectorPaths = [{ windingRule: 'NONE', data: vertices.map((v, i) => (i ? 'L ' : 'M ') + v.x + ' ' + v.y).join(' ') }]
    vec.strokeCap = 'ARROW_LINES'
  }
  vec.strokes = [paint('primary/main-color')]
  vec.strokeWeight = 2
  vec.strokeJoin = 'ROUND'
  vec.cornerRadius = 16
  vec.fills = []

  const dot = figma.createEllipse()
  dot.name = 'Origem'
  dot.resize(12, 12)
  section.appendChild(dot)
  dot.x = x1 - 6
  dot.y = y1 - 6
  dot.fills = [paint('primary/main-color')]
  dot.strokes = [paint('base/white')]
  dot.strokeWeight = 2

  const tag = box('HORIZONTAL', { name: 'Ação – ' + label, pad: [4, 10], radius: 12, fill: 'base/white', stroke: 'primary/active' })
  section.appendChild(tag)
  tag.appendChild(await text(label, 'Paragraph: 6/Medium', 'primary/text', { name: 'Ação' }))
  tag.x = xm - tag.width / 2
  tag.y = Math.min(y1, y2) - tag.height - 10
  if (tag.x < src.x + src.w - sec.x + 8) tag.x = src.x + src.w - sec.x + 8
  return vec
}

async function link(from, to) {
  try {
    await from.setReactionsAsync([
      {
        trigger: { type: 'ON_CLICK' },
        actions: [
          {
            type: 'NODE',
            destinationId: to.id,
            navigation: 'NAVIGATE',
            transition: { type: 'SMART_ANIMATE', easing: { type: 'EASE_OUT' }, duration: 0.3 },
            preserveScrollPosition: false,
          },
        ],
      },
    ])
  } catch (e) {
    WARNINGS.push('Interação não criada em ' + from.name + ': ' + e.message)
  }
}

const WARNINGS = []

/** Builds one scenario row inside a section and returns its section + screens. */
async function scenario(page, y, o) {
  const section = figma.createSection()
  section.name = o.sectionName
  page.appendChild(section)
  section.x = 0
  section.y = y
  section.setPluginData(TAG, 'flow')
  section.resizeWithoutConstraints(4000, 1200)

  const label = await scenarioLabel(section, o.label)
  label.x = 80
  label.y = 120

  const screens = []
  let x = 80 + LABEL_W + GAP
  for (const build of o.screens) {
    const s = await build(section)
    s.frame.x = x
    s.frame.y = 120
    x += SCREEN_W + GAP
    screens.push(s)
  }
  const height = Math.max(label.height, ...screens.map((s) => s.frame.height))
  section.resizeWithoutConstraints(x - GAP + 80, height + 240)
  return { section, screens, label }
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function cleanUp(flowPage) {
  for (const page of figma.root.children.slice()) {
    if (page.getPluginData(TAG) === 'components' && page !== figma.currentPage) page.remove()
  }
  await flowPage.loadAsync()
  for (const node of flowPage.children.slice()) {
    if (node.getPluginData(TAG)) node.remove()
  }
  flowPage.flowStartingPoints = flowPage.flowStartingPoints.filter((f) => !f.name.startsWith('Cenário'))
}

async function main() {
  await Promise.all(['Light', 'Regular', 'Medium', 'Semi Bold', 'Bold'].map((style) => figma.loadFontAsync({ family: FONT, style })))

  let flowPage = figma.root.children.find((p) => p.name === 'Fluxos APP')
  if (!flowPage) {
    flowPage = figma.createPage()
    flowPage.name = 'Fluxos APP'
  }
  await figma.setCurrentPageAsync(flowPage)
  await cleanUp(flowPage)

  await setupTokens()

  COMPONENT_PAGE = figma.createPage()
  COMPONENT_PAGE.name = 'Keep · Componentes locais'
  COMPONENT_PAGE.setPluginData(TAG, 'components')
  await buildComponents()

  let y = 0
  for (const node of flowPage.children) y = Math.max(y, node.y + node.height + 400)

  // Cenário 1 — acompanhar a manhã
  const c1 = await scenario(flowPage, y, {
    sectionName: 'Cenário 1 · Acompanhar a manhã e marcar um passo por um filho',
    label: {
      eyebrow: 'CENÁRIO 1 · PRIORIDADE P1',
      title: 'Acompanhar a manhã',
      description: 'Às 07:09, o Téo passou do horário do banho. Um dos pais abre o app, vê quem está atrasado e marca o passo pelo filho.',
      meta: ['Quem: Ana ou Carlos (pais)', 'Rotina: Manhã · Sair às 07:40', 'Telas: 1.1 → 1.2 → 1.3'],
    },
    screens: [
      (p) => todayScreen(p, '1.1 · Hoje – Téo atrasado'),
      (p) => todayScreen(p, '1.2 · Hoje – Passos do Téo', { expandTeo: 'late' }),
      (p) => todayScreen(p, '1.3 · Hoje – Banho marcado como feito', { expandTeo: 'done', toast: 'Tomar banho marcado para o Téo' }),
    ],
  })
  const [s11, s12, s13] = c1.screens
  await link(s11.cards.teo, s12.frame)
  await link(nested(s12.cards.teo, 'Marcar como feito'), s13.frame)
  await arrow(c1.section, s11.cards.teo, s11.frame, s12.frame, 'Toca no Téo')
  await arrow(c1.section, nested(s12.cards.teo, 'Marcar como feito'), s12.frame, s13.frame, 'Marca como feito')

  // Cenário 2 — criar/editar rotina
  const c2 = await scenario(flowPage, c1.section.y + c1.section.height + 200, {
    sectionName: 'Cenário 2 · Editar a rotina da manhã e adicionar um passo',
    label: {
      eyebrow: 'CENÁRIO 2 · PRIORIDADE P1',
      title: 'Editar a rotina da manhã',
      description: 'Um dos pais adiciona “Dar comida ao cachorro” para o Téo. O app recalcula os horários de trás para frente a partir de “Sair às 07:40”.',
      meta: ['Quem: Ana ou Carlos (pais)', 'Resultado: Téo passa a começar às 06:45', 'Telas: 2.1 → 2.2 → 2.3 → 2.4 → 2.5'],
    },
    screens: [
      (p) => routinesScreen(p, '2.1 · Rotinas – Lista'),
      (p) => editorScreen(p, '2.2 · Editar rotina – Manhã', 'closed'),
      (p) => editorScreen(p, '2.3 · Editar rotina – Adicionar passo', 'form'),
      (p) => editorScreen(p, '2.4 · Editar rotina – Passo adicionado', 'added'),
      (p) => routinesScreen(p, '2.5 · Rotinas – Rotina salva', 'Rotina Manhã salva'),
    ],
  })
  const [s21, s22, s23, s24, s25] = c2.screens
  await link(s21.editMorning, s22.frame)
  await link(s22.addButton, s23.frame)
  await link(s23.submit, s24.frame)
  await link(s24.save, s25.frame)
  await arrow(c2.section, s21.editMorning, s21.frame, s22.frame, 'Editar')
  await arrow(c2.section, s22.addButton, s22.frame, s23.frame, 'Adicionar passo')
  await arrow(c2.section, s23.submit, s23.frame, s24.frame, 'Confirma o passo')
  await arrow(c2.section, s24.save, s24.frame, s25.frame, 'Salvar')

  // Cenário 3 — resumo da semana
  const c3 = await scenario(flowPage, c2.section.y + c2.section.height + 200, {
    sectionName: 'Cenário 3 · Ver o resumo da semana',
    label: {
      eyebrow: 'CENÁRIO 3 · MEDIÇÃO DO TESTE',
      title: 'Ver o resumo da semana',
      description: 'Os pais conferem quantos passos atrasaram nesta semana e quem precisa de mais apoio. Números de exemplo, sem ranking entre irmãos.',
      meta: ['Quem: Ana ou Carlos (pais)', 'Visível só para os pais', 'Telas: 3.1 → 3.2'],
    },
    screens: [(p) => todayScreen(p, '3.1 · Hoje – Início'), (p) => summaryScreen(p, '3.2 · Resumo da semana')],
  })
  const [s31, s32] = c3.screens
  const resumoTab = tabItem(s31.tabs, 'Resumo')
  await link(resumoTab, s32.frame)
  await arrow(c3.section, resumoTab, s31.frame, s32.frame, 'Aba Resumo')

  flowPage.flowStartingPoints = flowPage.flowStartingPoints.concat([
    { nodeId: s11.frame.id, name: 'Cenário 1 – Acompanhar a manhã' },
    { nodeId: s21.frame.id, name: 'Cenário 2 – Editar a rotina da manhã' },
    { nodeId: s31.frame.id, name: 'Cenário 3 – Ver o resumo da semana' },
  ])

  figma.viewport.scrollAndZoomIntoView([c1.section, c2.section, c3.section])
  return WARNINGS
}

main()
  .then((warnings) => {
    const extra = warnings.length ? ` (${warnings.length} aviso(s): ${warnings[0]})` : ''
    figma.closePlugin('Telas criadas: 3 cenários, 10 telas.' + extra)
  })
  .catch((e) => {
    figma.closePlugin('Erro: ' + (e && e.message ? e.message : String(e)))
  })
