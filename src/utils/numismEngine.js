/**
 * Numism Mathematical and Logical Engine
 * Decoupled, pure functional calculators and validators for Day 17 modes.
 */

export const isPrimeNum = (num) => {
  if (num <= 1) return false;
  for (let i = 2, s = Math.sqrt(num); i <= s; i++) {
    if (num % i === 0) return false;
  }
  return num > 1;
};

export const getAllFactors = (num) => {
  const factors = [];
  for (let i = 1; i <= num; i++) {
    if (num % i === 0) factors.push(i);
  }
  return factors;
};

export const decomposeNumber = (num, depth = 0) => {
  if (depth >= 2) return [num]; // Recursively split twice to yield exactly 4 number cards!

  const ops = ['+', '-', '*'];
  const op = ops[Math.floor(Math.random() * ops.length)];

  if (op === '*' && num > 4) {
    const factors = [];
    for (let i = 2; i <= Math.sqrt(num); i++) {
      if (num % i === 0) {
        factors.push(i);
        factors.push(num / i);
      }
    }
    if (factors.length > 0) {
      const f = factors[Math.floor(Math.random() * factors.length)];
      return [
        ...decomposeNumber(f, depth + 1),
        ...decomposeNumber(num / f, depth + 1)
      ];
    }
  }

  if (op === '-' || num <= 2) {
    const b = Math.floor(Math.random() * 9) + 2;
    return [
      ...decomposeNumber(num + b, depth + 1),
      ...decomposeNumber(b, depth + 1)
    ];
  }

  const a = Math.floor(Math.random() * (num - 1)) + 1;
  return [
    ...decomposeNumber(a, depth + 1),
    ...decomposeNumber(num - a, depth + 1)
  ];
};

export const generateProblemData = (mode, level, currentFermiQuestion, fermiQuestionsList, customTarget) => {
  let target = 0;
  let secondaryTarget = 0;
  let quantizeDots = [];
  let fermiQuestion = null;

  switch (mode) {
    case 'factora': {
      const possibleTargets = [12, 16, 18, 20, 24, 28, 30, 32, 36, 40, 42, 48, 50, 56, 60, 64, 72, 80, 84, 90, 96, 100, 108, 120, 144, 160, 180, 200, 240, 300, 360];
      const minIdx = Math.max(0, level - 2);
      const maxIdx = Math.min(possibleTargets.length - 1, level + 2);
      target = possibleTargets[minIdx + Math.floor(Math.random() * (maxIdx - minIdx + 1))];
      break;
    }
    case 'target': {
      const minVal = Math.max(10, level * 8);
      const maxVal = level * 25 + 10;
      target = Math.floor(Math.random() * (maxVal - minVal + 1)) + minVal;
      break;
    }
    case 'primal':
      target = Math.floor(Math.random() * (15 + level * 15)) + 2;
      break;
    case 'summism': {
      const minVal = Math.max(5, level * 2);
      const maxVal = level * 3 + 4;
      target = Math.floor(Math.random() * (maxVal - minVal + 1)) + minVal;
      break;
    }
    case 'quantize': {
      const count = Math.floor(Math.random() * (4 + level * 2)) + 3;
      target = count;
      quantizeDots = Array.from({ length: count }, () => ({
        x: Math.random() * 80 + 10,
        y: Math.random() * 80 + 10,
        size: Math.random() * 4 + 3
      }));
      break;
    }
    case 'modulo': {
      const divisors = [2, 3, 5, 7, 10, 12, 15, 20, 25];
      const maxIdx = Math.min(divisors.length - 1, level + 1);
      secondaryTarget = divisors[Math.floor(Math.random() * (maxIdx + 1))];
      target = Math.floor(Math.random() * (level * 20)) + 10;
      break;
    }
    case 'divis': {
      const possibleDivisors = [2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15];
      const maxIdx = Math.min(possibleDivisors.length - 1, level + 1);
      secondaryTarget = possibleDivisors[Math.floor(Math.random() * (maxIdx + 1))];
      break;
    }
    case 'complement': {
      const bases = [50, 100, 150, 200, 250, 300, 400, 500, 600, 750, 1000, 1200, 1500, 2000];
      const minIdx = Math.max(0, Math.min(bases.length - 3, level - 2));
      const maxIdx = Math.min(bases.length - 1, level + 1);
      target = bases[minIdx + Math.floor(Math.random() * (maxIdx - minIdx + 1))];
      secondaryTarget = Math.floor(Math.random() * (target - 10)) + 5;
      break;
    }
    case 'binary': {
      const bits = level <= 2 ? 3 : (level <= 4 ? 4 : (level <= 6 ? 6 : 8));
      const val = Math.floor(Math.random() * (Math.pow(2, bits) - 1)) + 1;
      secondaryTarget = val.toString(2).padStart(bits, '0');
      target = val;
      break;
    }
    case 'fermi': {
      let available = fermiQuestionsList;
      if (currentFermiQuestion) {
        available = fermiQuestionsList.filter(q => q.q !== currentFermiQuestion.q);
      }
      const qObj = available[Math.floor(Math.random() * available.length)];
      fermiQuestion = qObj;
      target = qObj.ans;
      secondaryTarget = qObj.desc;
      break;
    }
    case 'makex': {
      const activeX = customTarget || (Math.floor(Math.random() * (level * 20 + 15)) + 10);
      target = activeX;
      const hand = decomposeNumber(target, 0);
      // Append a 5th card to give more dynamic options and multiple solution paths!
      hand.push(Math.floor(Math.random() * 9) + 2);
      secondaryTarget = hand.join(',');
      break;
    }
    default:
      break;
  }

  return { target, secondaryTarget, quantizeDots, fermiQuestion };
};

export const validateNumism = (val, mode, target, secondaryTarget) => {
  const cleanVal = val.trim();
  if (!cleanVal) return false;

  switch (mode) {
    case 'factora': {
      const n = parseInt(cleanVal, 10);
      if (isNaN(n) || n <= 0) return false;
      return target % n === 0;
    }
    case 'target':
      try {
        const clean = cleanVal.replace(/[^-()\d/*+.\s]/g, '');
        if (clean.replace(/\s+/g, '') !== cleanVal.replace(/\s+/g, '')) return false;
        const result = new Function(`return (${clean})`)();
        return result === target;
      } catch {
        return false;
      }
    case 'primal': {
      const p = cleanVal.toLowerCase();
      if (p === 'p') return isPrimeNum(target);
      if (p === 'c') return !isPrimeNum(target);
      return false;
    }
    case 'summism': {
      if (!/^\d+$/.test(cleanVal)) return false;
      const sum = cleanVal.split('').reduce((acc, d) => acc + parseInt(d, 10), 0);
      return sum === target;
    }
    case 'quantize': {
      const n = parseInt(cleanVal, 10);
      return n === target;
    }
    case 'modulo': {
      const n = parseInt(cleanVal, 10);
      return n === target % secondaryTarget;
    }
    case 'divis': {
      const n = parseInt(cleanVal, 10);
      if (isNaN(n) || n <= 0) return false;
      return n % secondaryTarget === 0;
    }
    case 'complement': {
      const n = parseInt(cleanVal, 10);
      return n + secondaryTarget === target;
    }
    case 'binary': {
      const n = parseInt(cleanVal, 10);
      return n === target;
    }
    case 'fermi': {
      const n = parseInt(cleanVal, 10);
      return n === target;
    }
    case 'makex': {
      try {
        const clean = cleanVal.replace(/[^-()\d/*+.\s]/g, '');
        if (clean.replace(/\s+/g, '') !== cleanVal.replace(/\s+/g, '')) return false;

        const result = new Function(`return (${clean})`)();
        if (result !== target) return false;

        const submittedNums = cleanVal.match(/\d+/g);
        if (!submittedNums) return false;

        const handNums = String(secondaryTarget).split(',').map(Number);

        // Check that submittedNums is a valid subset of handNums
        const remaining = [...handNums];
        for (const num of submittedNums.map(Number)) {
          const idx = remaining.indexOf(num);
          if (idx === -1) {
            return false;
          }
          remaining.splice(idx, 1);
        }

        return true;
      } catch {
        return false;
      }
    }
    default:
      return false;
  }
};

export const getDescriptionForFoundItem = (val, mode, target, secondaryTarget, fermiQuestion) => {
  const cleanVal = val.trim();
  switch (mode) {
    case 'factora':
      return `${cleanVal} (factor)`;
    case 'target':
      return `${cleanVal} = ${target}`;
    case 'primal':
      return `${target} is ${isPrimeNum(target) ? 'Prime' : 'Composite'}`;
    case 'summism': {
      const parts = cleanVal.split('').join(' + ');
      return `${parts} = ${target} (${cleanVal})`;
    }
    case 'quantize':
      return `${target} dots`;
    case 'modulo':
      return `${target} % ${secondaryTarget} = ${cleanVal}`;
    case 'divis':
      return `${cleanVal} is multiple of ${secondaryTarget}`;
    case 'complement':
      return `${secondaryTarget} + ${cleanVal} = ${target}`;
    case 'binary':
      return `${secondaryTarget}₂ = ${cleanVal}₁₀`;
    case 'fermi':
      return `${fermiQuestion?.q || 'Fermi'} ≈ 10^${target}`;
    case 'makex':
      return `${cleanVal} = ${target}`;
    default:
      return cleanVal;
  }
};

export const getPromptTiles = (mode, target, secondaryTarget) => {
  switch (mode) {
    case 'factora':
    case 'target':
    case 'primal':
    case 'summism':
      return String(target).split('');
    case 'modulo':
      return `${target} % ${secondaryTarget}`.split('');
    case 'divis':
      return `÷${secondaryTarget}`.split('');
    case 'complement':
      return `${secondaryTarget} + ? = ${target}`.split('');
    case 'binary':
      return String(secondaryTarget).split('');
    case 'fermi':
      return [];
    case 'makex':
      return String(secondaryTarget).split(',');
    default:
      return [];
  }
};
