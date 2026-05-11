
let lgd          = 45.5;
let taxaUso      = 75.0;
let pisoOp       = 15000;
let tetoMax      = 25000;
let riscoFisico  = 8;   
let riscoFin     = 5;   

let editingField = null; 
let editBuffer   = '';
let cursorBlink  = 0;

let dragFisico = false;
let dragFin    = false;

let running     = false;
let runProgress = 0;
let btnHover    = false;

let CX, CY, CW, CH;
const PAD  = 20;
const BLUE = '#06B2FC';

function setup() {
  let cnv = createCanvas(400, 530);
  cnv.parent('canvas-container');
  textFont('Inter, sans-serif');
}

function draw() {
  background(237, 241, 247);
  cursorBlink = floor(millis() / 530) % 2;

  CW = 358;
  CH = 490;
  CX = (width  - CW) / 2;
  CY = (height - CH) / 2;

  drawCard();

  if (running) {
    runProgress += 0.014;
    if (runProgress >= 1) { running = false; runProgress = 0; }
  }
}

function drawCard() {
  push();
  translate(CX, CY);

  noStroke();
  for (let i = 10; i >= 1; i--) {
    fill(0, 0, 0, map(i, 10, 1, 7, 0));
    rect(i * 0.5, i * 1.1, CW, CH, 14);
  }

  fill(255);
  rect(0, 0, CW, CH, 14);

  drawHeader();

  stroke(228, 232, 240);
  strokeWeight(1);
  line(0, 46, CW, 46);
  noStroke();

  let y = 62;
  const fieldW = (CW - PAD * 2 - 12) / 2;

  push();
  translate(PAD, y);
  drawInputField(0,           0, fieldW, 'LGD (Loss Given Default)', fmtPct(lgd),     'lgd');
  drawInputField(fieldW + 12, 0, fieldW, 'Taxa de Uso',              fmtPct(taxaUso), 'taxa');
  pop();
  y += 70;

  push();
  translate(PAD, y);
  drawInputField(0, 0, CW - PAD * 2, 'Piso de Operacionalização', fmtBRL(pisoOp), 'piso');
  pop();
  y += 70;

  push();
  translate(PAD, y);
  drawInputField(0, 0, CW - PAD * 2, 'Teto Máximo Concedido', fmtBRL(tetoMax), 'teto');
  pop();
  y += 78;

  push();
  translate(PAD, y);
  drawSlider(CW - PAD * 2, 'Tolerância de Risco Físico', riscoFisico, 'fisico');
  pop();
  y += 56;

  push();
  translate(PAD, y);
  drawSlider(CW - PAD * 2, 'Tolerância de Risco Financeiro', riscoFin, 'financeiro');
  pop();
  y += 56;

  push();
  translate(PAD, y);
  drawButton(CW - PAD * 2, 42);
  pop();

  if (editingField) {
    push();
    translate(0, CH - 28);
    fill(245, 252, 255);
    stroke(6, 178, 252, 55);
    strokeWeight(1);
    rect(0, 0, CW, 28, 0, 0, 14, 14);
    noStroke();
    fill(120, 145, 165);
    textSize(10);
    textStyle(NORMAL);
    textAlign(CENTER, CENTER);
    text('Enter para confirmar  ·  Esc para cancelar', CW / 2, 14);
    pop();
  }

  pop();
}


function drawHeader() {
  push();
  translate(PAD, 0);
  fill(22, 28, 45);
  textSize(13.5);
  textStyle(BOLD);
  textAlign(LEFT, CENTER);
  text('Parâmetros do Modelo', 0, 23);
  pop();
}

function drawInputField(x, y, w, label, value, id) {
  push();
  translate(x, y);

  const isActive = editingField === id;
  const bY = 15, bH = 34, r = 7;

  fill(145, 155, 175);
  textSize(10);
  textStyle(NORMAL);
  textAlign(LEFT, TOP);
  text(label, 0, 0);

  if (isActive) {
    noFill();
    stroke(6, 178, 252, 30);
    strokeWeight(5);
    rect(0, bY, w, bH, r + 3);
  }

  stroke(isActive ? color(BLUE) : color(218, 222, 232));
  strokeWeight(isActive ? 1.5 : 1);
  fill(isActive ? color(243, 252, 255) : 255);
  rect(0, bY, w, bH, r);
  noStroke();

  const displayVal = isActive
    ? editBuffer + (cursorBlink ? '|' : ' ')
    : value;
  fill(isActive ? color(BLUE) : color(22, 28, 45));
  textSize(13);
  textStyle(isActive ? BOLD : NORMAL);
  textAlign(LEFT, CENTER);
  text(displayVal, 9, bY + bH / 2);

  pop();
}

function drawSlider(w, label, val, id) {
  push();

  const ratio  = (val - 1) / 9;
  const trackY = 22;
  const trackH = 4;
  const thumbR = 7;

  const baseC  = color(BLUE);
  const highC  = color(255, 87, 34);
  const badgeC = id === 'fisico'
    ? lerpColor(baseC, highC, ratio)
    : baseC;

  fill(22, 28, 45);
  textSize(11.5);
  textStyle(NORMAL);
  textAlign(LEFT, TOP);
  text(label, 0, 0);

  const bLabel = riskLabel(id, val);
  const bw = 88, bh = 17, br = 5;
  fill(red(badgeC), green(badgeC), blue(badgeC), 18);
  noStroke();
  rect(w - bw, -2, bw, bh, br);
  fill(badgeC);
  textSize(10);
  textStyle(BOLD);
  textAlign(RIGHT, TOP);
  text(bLabel + '  ' + val + '/10', w - 6, 0);

  fill(175, 185, 200);
  textSize(9.5);
  textStyle(NORMAL);
  textAlign(LEFT, TOP);
  text(id === 'fisico' ? 'Conservador' : 'Baixa', 0, 32);
  textAlign(RIGHT, TOP);
  text(id === 'fisico' ? 'Agressivo' : 'Alta', w, 32);

  noStroke();
  fill(218, 224, 235);
  rect(0, trackY - trackH / 2, w, trackH, trackH / 2);

  fill(badgeC);
  rect(0, trackY - trackH / 2, w * ratio, trackH, trackH / 2);

  fill(red(badgeC), green(badgeC), blue(badgeC), 25);
  ellipse(w * ratio, trackY, (thumbR + 5) * 2);
  fill(badgeC);
  ellipse(w * ratio, trackY, thumbR * 2);
  fill(255);
  ellipse(w * ratio, trackY, 4);

  pop();
}

function drawButton(w, h) {
  push();

  const absX = CX + PAD;
  const absY = CY + 62 + 70 + 70 + 78 + 56 + 56;
  btnHover = (mouseX > absX && mouseX < absX + w &&
              mouseY > absY && mouseY < absY + h);

  const baseC = color(BLUE);
  const darkC = color(4, 140, 210);
  const c     = btnHover ? darkC : baseC;

  fill(red(c), green(c), blue(c), 45);
  noStroke();
  rect(0, 4, w, h, 9);

  fill(c);
  rect(0, 0, w, h, 9);

  if (running) {
    fill(255, 255, 255, 35);
    rect(0, 0, w * runProgress, h, 9);
    fill(255, 255, 255, 70);
    rect(w * runProgress - 12, 0, 10, h);
  }

  fill(255);
  textSize(12.5);
  textStyle(BOLD);
  textAlign(CENTER, CENTER);
  text('Executar Otimização Linear', w / 2, h / 2);

  pop();
}

function mousePressed() {
  const sw = CW - PAD * 2;
  const sx = CX + PAD;

  const bY = CY + 62 + 70 + 70 + 78 + 56 + 56;
  if (inRect(sx, bY, sw, 42)) {
    running      = true;
    runProgress  = 0;
    editingField = null;
    return;
  }

  const fTrackY = CY + 62 + 70 + 70 + 78 + 22;
  if (abs(mouseY - fTrackY) < 14 && mouseX > sx && mouseX < sx + sw) {
    dragFisico   = true;
    editingField = null;
    updateSlider('fisico', mouseX, sx, sw);
    return;
  }

  const finTrackY = CY + 62 + 70 + 70 + 78 + 56 + 22;
  if (abs(mouseY - finTrackY) < 14 && mouseX > sx && mouseX < sx + sw) {
    dragFin      = true;
    editingField = null;
    updateSlider('financeiro', mouseX, sx, sw);
    return;
  }

  checkFieldClick();
}

function mouseDragged() {
  const sw = CW - PAD * 2;
  const sx = CX + PAD;
  if (dragFisico) updateSlider('fisico',     mouseX, sx, sw);
  if (dragFin)    updateSlider('financeiro', mouseX, sx, sw);
}

function mouseReleased() {
  dragFisico = false;
  dragFin    = false;
}

function updateSlider(id, mx, x, w) {
  const val = round(constrain((mx - x) / w, 0, 1) * 9) + 1;
  if (id === 'fisico') riscoFisico = val;
  else                 riscoFin    = val;
}

function checkFieldClick() {
  const fw = (CW - PAD * 2 - 12) / 2;
  const x1 = CX + PAD;
  const x2 = CX + PAD + fw + 12;
  const y1 = CY + 62 + 15;
  const y2 = CY + 62 + 70 + 15;
  const y3 = CY + 62 + 70 + 70 + 15;
  const fw2 = CW - PAD * 2;

  if (inRect(x1, y1, fw,  34)) { startEdit('lgd',  fmtRaw(lgd));       return; }
  if (inRect(x2, y1, fw,  34)) { startEdit('taxa', fmtRaw(taxaUso));    return; }
  if (inRect(x1, y2, fw2, 34)) { startEdit('piso', String(pisoOp));     return; }
  if (inRect(x1, y3, fw2, 34)) { startEdit('teto', String(tetoMax));    return; }

  editingField = null;
}

function inRect(x, y, w, h) {
  return mouseX > x && mouseX < x + w && mouseY > y && mouseY < y + h;
}

function startEdit(field, current) {
  editingField = field;
  editBuffer   = current;
}

function keyPressed() {
  if (!editingField) return;
  if (keyCode === ENTER)     { commitEdit(); }
  else if (keyCode === ESCAPE)    { editingField = null; editBuffer = ''; }
  else if (keyCode === BACKSPACE) { editBuffer = editBuffer.slice(0, -1); }
}

function keyTyped() {
  if (!editingField) return;
  if (/[\d.]/.test(key)) editBuffer += key;
}

function commitEdit() {
  const val = parseFloat(editBuffer);
  if (!isNaN(val)) {
    if (editingField === 'lgd')  lgd     = constrain(val, 0, 100);
    if (editingField === 'taxa') taxaUso = constrain(val, 0, 100);
    if (editingField === 'piso') pisoOp  = max(0, val);
    if (editingField === 'teto') tetoMax = max(0, val);
  }
  editingField = null;
  editBuffer   = '';
}

function fmtPct(v) { return v.toFixed(1) + '%'; }
function fmtRaw(v) { return v.toFixed(1); }
function fmtBRL(v) {
  return 'R$ ' + Number(v).toLocaleString('pt-BR', { minimumFractionDigits: 2 });
}

function riskLabel(id, val) {
  if (id === 'fisico') {
    if (val <= 3) return 'Conservador';
    if (val <= 6) return 'Moderado';
    return 'Agressivo';
  }
  if (val <= 3) return 'Baixo';
  if (val <= 6) return 'Moderado';
  return 'Alto';
}