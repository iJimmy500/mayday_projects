const fs = require('fs');
const path = require('path');

const data = JSON.parse(fs.readFileSync(path.join(__dirname, 'quizzes.json'), 'utf8'));

const encode = (str) => 'q:' + Buffer.from(str).toString('base64');

const obfuscated = data.map(quiz => ({
  ...quiz,
  title: encode(quiz.title),
  tag: quiz.tag ? encode(quiz.tag) : null,
  questions: quiz.questions.map(q => ({
    ...q,
    question: encode(q.question),
    options: q.options ? q.options.map(opt => {
      if (typeof opt === 'string') return encode(opt);
      if (typeof opt === 'object') return { ...opt, text: encode(opt.text) };
      return opt;
    }) : null
  }))
}));

fs.writeFileSync(path.join(__dirname, 'quizzes.enc.json'), JSON.stringify(obfuscated));
console.log('Encoded quizzes written to quizzes.enc.json');
