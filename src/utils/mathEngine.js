/**
 * Math Generator Engine for Mayday Math Academy
 * Procedurally generates LaTeX-based math problems.
 */

const getRandomInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

export const SUBJECTS = {
  JUNIOR: [
    { id: 'addsub', name: 'Addition & Subtraction', levels: [1, 2, 3, 4, 5] },
    { id: 'mult', name: 'Multiplication', levels: [1, 2, 3, 4, 5] },
    { id: 'div', name: 'Division', levels: [1, 2, 3, 4, 5] },
    { id: 'frac', name: 'Fractions', levels: [1, 2, 3, 4, 5] },
    { id: 'dec', name: 'Decimals', levels: [1, 2, 3, 4, 5] },
    { id: 'perc', name: 'Percentages', levels: [1, 2, 3, 4, 5] },
    { id: 'geom', name: 'Geometry', levels: [1, 2, 3, 4, 5] },
    { id: 'alg_jr', name: 'Pre-Algebra', levels: [1, 2, 3, 4, 5] },
    { id: 'stats', name: 'Data & Stats', levels: [1, 2, 3] },
  ],
  COLLEGIATE: [
    { id: 'alg', name: 'Advanced Algebra', levels: [1, 2, 3, 4, 5] },
    { id: 'trig', name: 'Precalculus & Trig', levels: [1, 2, 3, 4, 5] },
    { id: 'calc1', name: 'Calculus I (Differential)', levels: [1, 2, 3, 4, 5] },
    { id: 'calc2', name: 'Calculus II (Integral)', levels: [1, 2, 3, 4, 5] },
    { id: 'calc3', name: 'Calculus III (Multivariate)', levels: [1, 2, 3] },
    { id: 'discrete', name: 'Discrete Math', levels: [1, 2, 3, 4, 5] },
    { id: 'linalg', name: 'Linear Algebra', levels: [1, 2, 3, 4, 5] },
    { id: 'foundations', name: 'Math Foundations', levels: [1, 2, 3] },
  ]
};

export const generateProblem = (subjectId, level = 1) => {
  switch (subjectId) {
    case 'addsub': return generateAddSub(level);
    case 'mult': return generateMultiplication(level);
    case 'div': return generateDivision(level);
    case 'frac': return generateFractions(level);
    case 'dec': return generateDecimals(level);
    case 'perc': return generatePercentages(level);
    case 'geom': return generateGeometry(level);
    case 'alg_jr': return generatePreAlgebra(level);
    case 'stats': return generateStats(level);
    case 'alg': return generateAlgebra(level);
    case 'trig': return generateTrig(level);
    case 'calc1': return generateCalculus1(level);
    case 'calc2': return generateCalculus2(level);
    case 'calc3': return generateCalculus3(level);
    case 'discrete': return generateDiscrete(level);
    case 'linalg': return generateLinAlg(level);
    case 'foundations': return generateFoundations(level);
    default: return generateMultiplication(1);
  }
};

const generateAddSub = (level) => {
  let a, b, op = getRandomInt(0, 1) === 0 ? '+' : '-';
  if (level === 1) {
    a = getRandomInt(1, 20);
    b = getRandomInt(1, 20);
  } else if (level === 2) {
    a = getRandomInt(20, 100);
    b = getRandomInt(10, 50);
  } else if (level === 3) {
    a = getRandomInt(100, 500);
    b = getRandomInt(50, 200);
  } else if (level === 4) {
    a = getRandomInt(500, 2000);
    b = getRandomInt(100, 1000);
  } else {
    a = getRandomInt(2000, 10000);
    b = getRandomInt(1000, 5000);
  }
  
  if (op === '-' && a < b) [a, b] = [b, a]; // Avoid negatives for junior
  
  return {
    latex: `${a} ${op} ${b}`,
    answer: (op === '+' ? a + b : a - b).toString(),
    hint: op === '+' ? "Line up the digits by place value." : "Don't forget to regroup if needed!"
  };
};

const generateMultiplication = (level) => {
  let a, b;
  if (level === 1) {
    a = getRandomInt(2, 12);
    b = getRandomInt(2, 12);
  } else if (level === 2) {
    a = getRandomInt(10, 50);
    b = getRandomInt(2, 9);
  } else if (level === 3) {
    a = getRandomInt(10, 99);
    b = getRandomInt(10, 20);
  } else if (level === 4) {
    a = getRandomInt(100, 999);
    b = getRandomInt(2, 9);
  } else {
    a = getRandomInt(10, 99);
    b = getRandomInt(10, 99);
  }
  return {
    latex: `${a} \\times ${b}`,
    answer: (a * b).toString(),
    hint: `Think of it as ${a} groups of ${b}.`
  };
};

const generateDivision = (level) => {
  let a, b, quotient, remainder = 0;
  if (level === 1) {
    quotient = getRandomInt(2, 12);
    b = getRandomInt(2, 12);
    a = quotient * b;
  } else if (level === 2) {
    quotient = getRandomInt(10, 20);
    b = getRandomInt(2, 9);
    a = quotient * b;
  } else if (level === 3) {
    b = getRandomInt(2, 9);
    a = getRandomInt(20, 99);
    quotient = Math.floor(a / b);
    remainder = a % b;
  } else if (level === 4) {
    quotient = getRandomInt(20, 100);
    b = getRandomInt(2, 9);
    a = quotient * b;
  } else {
    b = getRandomInt(11, 20);
    a = getRandomInt(100, 500);
    quotient = Math.floor(a / b);
    remainder = a % b;
  }

  const ansStr = remainder === 0 ? quotient.toString() : `${quotient} r ${remainder}`;
  return {
    latex: `${a} \\div ${b}`,
    answer: ansStr,
    hint: remainder === 0 ? "What number times " + b + " equals " + a + "?" : "Find the quotient and the leftover remainder (format: Q r R)."
  };
};

const generateFractions = (level) => {
  let n1, d1, n2, d2, op = '+', ansN, ansD;
  const gcd = (a, b) => b === 0 ? a : gcd(b, a % b);

  if (level === 1) {
    d1 = getRandomInt(2, 10);
    d2 = d1;
    n1 = getRandomInt(1, d1 - 1);
    n2 = getRandomInt(1, d1 - 1);
    ansN = n1 + n2;
    ansD = d1;
  } else if (level === 2) {
    d1 = getRandomInt(2, 6);
    d2 = getRandomInt(2, 6);
    if (d1 === d2) d2++;
    n1 = getRandomInt(1, d1 - 1);
    n2 = getRandomInt(1, d2 - 1);
    ansN = n1 * d2 + n2 * d1;
    ansD = d1 * d2;
  } else if (level === 3) {
    op = '\\times';
    n1 = getRandomInt(1, 5);
    d1 = getRandomInt(2, 6);
    n2 = getRandomInt(1, 5);
    d2 = getRandomInt(2, 6);
    ansN = n1 * n2;
    ansD = d1 * d2;
  } else if (level === 4) {
    op = '\\div';
    n1 = getRandomInt(1, 5);
    d1 = getRandomInt(2, 6);
    n2 = getRandomInt(1, 5);
    d2 = getRandomInt(2, 6);
    ansN = n1 * d2;
    ansD = d1 * n2;
  } else {
    const w1 = getRandomInt(1, 3);
    const w2 = getRandomInt(1, 3);
    d1 = getRandomInt(2, 5);
    d2 = d1;
    n1 = 1;
    n2 = 1;
    return {
      latex: `${w1}\\frac{${n1}}{${d1}} + ${w2}\\frac{${n2}}{${d2}}`,
      answer: `${w1 + w2}\\frac{${n1 + n2}}{${d1}}`,
      hint: "Add the whole numbers first, then the fractions."
    };
  }

  const common = gcd(ansN, ansD);
  const finalN = ansN / common;
  const finalD = ansD / common;
  const ansStr = finalD === 1 ? finalN.toString() : `${finalN}/${finalD}`;

  return {
    latex: `\\frac{${n1}}{${d1}} ${op} \\frac{${n2}}{${d2}}`,
    answer: ansStr,
    hint: level <= 2 ? "Find a common denominator." : "Multiply tops and bottoms!"
  };
};

const generateDecimals = (level) => {
  let a, b, op = '+', ans;
  if (level === 1) {
    a = (getRandomInt(1, 100) / 10).toFixed(1);
    b = (getRandomInt(1, 100) / 10).toFixed(1);
    ans = (parseFloat(a) + parseFloat(b)).toFixed(1);
  } else if (level === 2) {
    a = (getRandomInt(1, 100) / 10).toFixed(1);
    return {
      latex: `${a} \\times 10`,
      answer: (parseFloat(a) * 10).toString(),
      hint: "Move the decimal point one place to the right."
    };
  } else if (level === 3) {
    a = (getRandomInt(1, 50) / 10).toFixed(1);
    b = getRandomInt(2, 5);
    ans = (parseFloat(a) * b).toFixed(1);
    op = '\\times';
  } else if (level === 4) {
    a = (getRandomInt(1, 20) / 10).toFixed(1);
    b = (getRandomInt(1, 20) / 10).toFixed(1);
    ans = (parseFloat(a) * parseFloat(b)).toFixed(2);
    op = '\\times';
  } else {
    a = (getRandomInt(10, 100) / 10).toFixed(1);
    b = 2;
    ans = (parseFloat(a) / b).toFixed(2);
    op = '\\div';
  }

  return {
    latex: `${a} ${op} ${b}`,
    answer: parseFloat(ans).toString(),
    hint: "Line up the decimal points!"
  };
};

const generatePercentages = (level) => {
  if (level === 1) {
    const p = getRandomInt(1, 10) * 10;
    const v = getRandomInt(1, 10) * 100;
    return {
      latex: `${p}\\% \\text{ of } ${v}`,
      answer: ((p / 100) * v).toString(),
      hint: "10% of a number is just dividing by 10."
    };
  } else if (level === 2) {
    const total = 50 * getRandomInt(1, 4);
    const part = getRandomInt(1, total / 5) * 5;
    return {
      latex: `\\text{What percent of } ${total} \\text{ is } ${part}?`,
      answer: `${(part / total) * 100}%`,
      hint: "Divide the part by the total and multiply by 100."
    };
  } else if (level === 3) {
    const p = 25 * getRandomInt(1, 3);
    const v = 40 * getRandomInt(1, 5);
    const change = (p / 100) * v;
    return {
      latex: `\\text{Increase } ${v} \\text{ by } ${p}\\%`,
      answer: (v + change).toString(),
      hint: `Find ${p}% of ${v} and add it.`
    };
  } else if (level === 4) {
    const price = getRandomInt(20, 100);
    const ans = (price * 1.15).toFixed(2);
    return {
      latex: `\\text{Total bill for \\$}${price} \\text{ with a 15\\% tip}`,
      answer: parseFloat(ans).toString(),
      hint: "Multiply by 1.15 to get the total."
    };
  } else {
    const part = getRandomInt(2, 10) * 4;
    return {
      latex: `20\\% \\text{ of a number is } ${part}. \\text{ What is the number?}`,
      answer: ((part / 20) * 100).toString(),
      hint: "If 20% is " + part + ", then 100% is 5 times that!"
    };
  }
};

const generateGeometry = (level) => {
  const l = getRandomInt(3, 12);
  const w = getRandomInt(2, 10);
  const h = getRandomInt(2, 8);
  
  if (level === 1) {
    return {
      latex: `\\text{Area of a rectangle with length } ${l} \\text{ and width } ${w}`,
      answer: (l * w).toString(),
      hint: "Area = length × width"
    };
  } else if (level === 2) {
    const b = getRandomInt(4, 12);
    const ht = getRandomInt(3, 10);
    return {
      latex: `\\text{Area of a triangle with base } ${b} \\text{ and height } ${ht}`,
      answer: (0.5 * b * ht).toString(),
      hint: "Area = 1/2 × base × height"
    };
  } else if (level === 3) {
    return {
      latex: `\\text{Volume of a box with dimensions } ${l} \\times ${w} \\times ${h}`,
      answer: (l * w * h).toString(),
      hint: "Volume = length × width × height"
    };
  } else if (level === 4) {
    const r = 7 * getRandomInt(1, 3);
    return {
      latex: `\\text{Circumference of a circle with radius } ${r} \\text{ (use } \\pi = \\frac{22}{7})`,
      answer: (2 * (22/7) * r).toString(),
      hint: "C = 2πr"
    };
  } else {
    return {
      latex: `\\text{Area of a circle with radius 10 (use } \\pi = 3.14)`,
      answer: "314",
      hint: "Area = πr²"
    };
  }
};

const generatePreAlgebra = (level) => {
  const a = getRandomInt(2, 10);
  const b = getRandomInt(1, 20);
  const x = getRandomInt(1, 12);
  
  if (level === 1) {
    return { latex: `x + ${b} = ${x + b}`, answer: x.toString(), hint: "Subtract " + b + " from both sides." };
  } else if (level === 2) {
    return { latex: `x - ${b} = ${x - b}`, answer: x.toString(), hint: "Add " + b + " to both sides." };
  } else if (level === 3) {
    return { latex: `${a}x = ${a * x}`, answer: x.toString(), hint: "Divide by " + a + "." };
  } else if (level === 4) {
    return { latex: `\\frac{x}{${a}} = ${x}`, answer: (a * x).toString(), hint: "Multiply by " + a + "." };
  } else {
    const c = a * x + b;
    return { latex: `${a}x + ${b} = ${c}`, answer: x.toString(), hint: `Subtract ${b}, then divide by ${a}.` };
  }
};

const generateStats = (level) => {
  const nums = Array.from({ length: 5 }, () => getRandomInt(1, 10)).sort((a, b) => a - b);
  if (level === 1) {
    const sum = nums.reduce((a, b) => a + b, 0);
    return {
      latex: `\\text{Mean (average) of } ${nums.join(', ')}`,
      answer: (sum / 5).toString(),
      hint: "Add them all up and divide by the count."
    };
  } else if (level === 2) {
    return {
      latex: `\\text{Median of } ${nums.join(', ')}`,
      answer: nums[2].toString(),
      hint: "The median is the middle number in a sorted list."
    };
  } else {
    return {
      latex: `\\text{Range of } ${nums.join(', ')}`,
      answer: (nums[4] - nums[0]).toString(),
      hint: "Range = Largest number - Smallest number."
    };
  }
};

const generateAlgebra = (level) => {
  const x = getRandomInt(-10, 10);
  const a = getRandomInt(2, 10);
  const b = getRandomInt(1, 20);
  
  if (level === 1) {
    return { latex: `${a}x + ${b} = ${a * x + b}`, answer: x.toString(), hint: "Subtract " + b + ", then divide by " + a + "." };
  } else if (level === 2) {
    const x2 = getRandomInt(1, 10);
    return { latex: `x^2 - ${x2 * x2} = 0`, answer: x2.toString(), hint: "Take the square root (provide positive answer)." };
  } else if (level === 3) {
    const base = getRandomInt(2, 5);
    const exp = getRandomInt(2, 4);
    return { latex: `\\log_{${base}}(${Math.pow(base, exp)}) = x`, answer: exp.toString(), hint: "The base raised to what power equals the argument?" };
  } else if (level === 4) {
    return { latex: `(x + ${a})(x - ${a}) = x^2 - ?`, answer: (a * a).toString(), hint: "Difference of squares: (a+b)(a-b) = a² - b²" };
  } else {
    return { latex: `3x + ${b} = x + ${b + 2 * x}`, answer: x.toString(), hint: "Get all x terms on one side." };
  }
};

const generateTrig = (level) => {
  const common = [
    { rad: '0', sin: '0', cos: '1', tan: '0' },
    { rad: '\\frac{\\pi}{6}', sin: '\\frac{1}{2}', cos: '\\frac{\\sqrt{3}}{2}', tan: '\\frac{\\sqrt{3}}{3}' },
    { rad: '\\frac{\\pi}{4}', sin: '\\frac{\\sqrt{2}}{2}', cos: '\\frac{\\sqrt{2}}{2}', tan: '1' },
    { rad: '\\frac{\\pi}{3}', sin: '\\frac{\\sqrt{3}}{2}', cos: '\\frac{1}{2}', tan: '\\sqrt{3}' },
    { rad: '\\frac{\\pi}{2}', sin: '1', cos: '0', tan: '\\text{undefined}' },
  ];
  
  if (level <= 2) {
    const choice = common[getRandomInt(0, common.length - 1)];
    const type = level === 1 ? (getRandomInt(0, 1) === 0 ? 'sin' : 'cos') : 'tan';
    return { latex: `\\${type}(${choice.rad})`, answer: choice[type], hint: "Think of the unit circle." };
  } else if (level === 3) {
    return { latex: `\\sin^2(\\theta) + \\cos^2(\\theta) = ?`, answer: "1", hint: "Pythagorean identity." };
  } else if (level === 4) {
    return { latex: `\\text{Amplitude of } 5\\sin(2x + 3)`, answer: "5", hint: "The coefficient in front of the sine function." };
  } else {
    return { latex: `\\text{Period of } \\cos(4x)`, answer: "\\frac{\\pi}{2}", hint: "Period = 2π/b" };
  }
};

const generateCalculus1 = (level) => {
  const n = getRandomInt(2, 6);
  const a = getRandomInt(2, 8);
  
  if (level === 1) {
    return { latex: `\\frac{d}{dx} (${a}x^{${n}})`, answer: `${a * n}x^{${n - 1}}`, hint: "Power rule: nx^{n-1}" };
  } else if (level === 2) {
    return { latex: `\\frac{d}{dx} (\\sin(x) + e^x)`, answer: "\\cos(x) + e^x", hint: "Derivative of sin(x) is cos(x), e^x is e^x." };
  } else if (level === 3) {
    return { latex: `\\frac{d}{dx} (x^2\\sin(x))`, answer: "2x\\sin(x) + x^2\\cos(x)", hint: "Use the Product Rule: u'v + uv'" };
  } else if (level === 4) {
    return { latex: `\\frac{d}{dx} (\\sin(x^2))`, answer: "2x\\cos(x^2)", hint: "Use the Chain Rule." };
  } else {
    return { latex: `\\lim_{x \\to 0} \\frac{\\sin(x)}{x}`, answer: "1", hint: "Fundamental limit or L'Hôpital's Rule." };
  }
};

const generateCalculus2 = (level) => {
  const n = getRandomInt(1, 4);
  const a = getRandomInt(1, 6) * (n + 1);
  
  if (level === 1) {
    return { latex: `\\int ${a}x^{${n}} \\, dx`, answer: `${a / (n + 1)}x^{${n + 1}} + C`, hint: "Add 1 to power, divide by new power." };
  } else if (level === 2) {
    return { latex: `\\int \\cos(x) \\, dx`, answer: "\\sin(x) + C", hint: "Reverse of differentiation." };
  } else if (level === 3) {
    return { latex: `\\int_0^1 x^2 \\, dx`, answer: "1/3", hint: "Evaluate at 1, subtract value at 0." };
  } else if (level === 4) {
    return { latex: `\\int \\frac{1}{x} \\, dx`, answer: "\\ln|x| + C", hint: "Standard integral." };
  } else {
    return { latex: `\\int xe^x \\, dx`, answer: "(x-1)e^x + C", hint: "Integration by Parts." };
  }
};

const generateCalculus3 = (level) => {
  if (level === 1) {
    return { latex: `\\frac{\\partial}{\\partial x} (x^2y + y^3)`, answer: "2xy", hint: "Treat y as a constant." };
  } else if (level === 2) {
    return { latex: `\\nabla (x^2 + y^2)`, answer: "(2x, 2y)", hint: "Vector of partial derivatives." };
  } else {
    return { latex: `\\text{Magnitude of } (3, 4)`, answer: "5", hint: "sqrt(3² + 4²)" };
  }
};

const generateDiscrete = (level) => {
  if (level === 1) {
    return { latex: `P \\land Q \\text{ is True if...}`, answer: "both are true", hint: "Logical AND" };
  } else if (level === 2) {
    return { latex: `\\{1, 2, 3\\} \\cap \\{3, 4, 5\\}`, answer: "{3}", hint: "Intersection (shared elements)" };
  } else if (level === 3) {
    return { latex: `3!`, answer: "6", hint: "3 * 2 * 1" };
  } else if (level === 4) {
    return { latex: `\\text{Number of subsets of } \\{a, b, c\\}`, answer: "8", hint: "2^n" };
  } else {
    return { latex: `\\binom{4}{2}`, answer: "6", hint: "4! / (2! * 2!)" };
  }
};

const generateLinAlg = (level) => {
  const m1 = [[getRandomInt(1, 3), getRandomInt(1, 3)], [getRandomInt(1, 3), getRandomInt(1, 3)]];
  if (level <= 2) {
    const row = getRandomInt(0, 1);
    const col = getRandomInt(0, 1);
    return { latex: `\\begin{pmatrix} ${m1[0][0]} & ${m1[0][1]} \\\\ ${m1[1][0]} & ${m1[1][1]} \\end{pmatrix} + I \\\\ \\text{Element at } (${row+1}, ${col+1})`, answer: (m1[row][col] + (row === col ? 1 : 0)).toString(), hint: "I is the Identity Matrix." };
  } else if (level === 3) {
    const det = m1[0][0] * m1[1][1] - m1[0][1] * m1[1][0];
    return { latex: `\\text{det}\\begin{pmatrix} ${m1[0][0]} & ${m1[0][1]} \\\\ ${m1[1][0]} & ${m1[1][1]} \\end{pmatrix}`, answer: det.toString(), hint: "ad - bc" };
  } else if (level === 4) {
    return { latex: `\\text{Trace of } \\begin{pmatrix} 5 & 2 \\\\ 1 & 3 \\end{pmatrix}`, answer: "8", hint: "Sum of diagonal elements." };
  } else {
    return { latex: `\\text{Eigenvalues of } \\begin{pmatrix} 2 & 0 \\\\ 0 & 5 \\end{pmatrix}`, answer: "2, 5", hint: "Diagonal matrices have eigenvalues on the diagonal." };
  }
};

const generateFoundations = (level) => {
  if (level === 1) {
    return { latex: `17 \\pmod{5}`, answer: "2", hint: "Remainder of 17 divided by 5." };
  } else if (level === 2) {
    return { latex: `\\text{Is } 13 \\text{ prime?}`, answer: "yes", hint: "Does it have any divisors other than 1 and itself?" };
  } else {
    return { latex: `\\text{GCD}(12, 18)`, answer: "6", hint: "Greatest Common Divisor." };
  }
};
