/**
 * Core utilities for quiz data obfuscation and deobfuscation.
 * Used across the dashboard, engine, and creator.
 */

const PREFIX = "q:";

export const encode = (str) => {
  if (!str) return str;
  return PREFIX + btoa(str);
};

export const decode = (str) => {
  if (!str || typeof str !== 'string') return str;
  if (!str.startsWith(PREFIX)) return str;
  
  const actual = str.slice(PREFIX.length);
  try {
    return atob(actual);
  } catch (e) {
    return str;
  }
};

export const obfuscate = (quiz) => {
  if (!quiz) return null;
  return {
    ...quiz,
    title: encode(quiz.title),
    tag: encode(quiz.tag),
    warning: quiz.warning ? encode(quiz.warning) : undefined,
    questions: quiz.questions.map(q => ({
      ...q,
      question: encode(q.question),
      options: q.options ? q.options.map(opt => {
        if (typeof opt === 'string') return encode(opt);
        if (typeof opt === 'object') return { ...opt, text: encode(opt.text) };
        return opt;
      }) : null
    }))
  };
};

export const deobfuscate = (quiz) => {
  if (!quiz) return null;
  const decodeOptions = (opts) => {
    if (!opts || !Array.isArray(opts)) return opts;
    return opts.map(opt => {
      if (typeof opt === 'string') return decode(opt);
      if (typeof opt === 'object') return { ...opt, text: decode(opt.text) };
      return opt;
    });
  };

  return {
    ...quiz,
    title: decode(quiz.title),
    tag: decode(quiz.tag),
    warning: quiz.warning ? decode(quiz.warning) : null,
    options: decodeOptions(quiz.options || quiz.choices),
    questions: quiz.questions ? quiz.questions.map(q => ({
      ...q,
      question: decode(q.question),
      options: decodeOptions(q.options || q.choices)
    })) : []
  };
};
