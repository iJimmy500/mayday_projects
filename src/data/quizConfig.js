export const RESULTS = {
  generations: (score, total) => {
    const pct = (score / total) * 100;
    if (pct === 100) return { label: "Cultural Historian", sub: "Perfect knowledge across all eras." };
    return { label: "Culturally Aware", sub: `Score: ${score}/${total}` };
  },
  icar: (score, total) => {
    const estIQ = Math.floor(70 + (score * 4.7));
    let cat = "Average Ability";
    if (estIQ >= 130) cat = "Very Superior";
    else if (estIQ >= 120) cat = "Superior";
    else if (estIQ >= 110) cat = "High Average";
    else if (estIQ < 90) cat = "Low Average";
    return { label: `Estimated IQ: ${estIQ}`, sub: `Categorized as ${cat} based on ICAR-16 metrics.` };
  },
  java: (score, total) => ({ label: `Score: ${score}/${total}`, sub: score >= 10 ? "Advanced Developer" : "Foundational Knowledge" }),
  c_prog: (score, total) => ({ label: `Score: ${score}/${total}`, sub: score >= 10 ? "Low-Level Master" : "Foundational Knowledge" }),
  python: (score, total) => ({ label: `Score: ${score}/${total}`, sub: score >= 10 ? "Python Expert" : "Foundational Knowledge" }),
  devskiller: (score, total) => ({ label: `Score: ${score}/${total}`, sub: score >= 8 ? "Production Ready" : "Learning Phase" }),
  autism: (score, total) => {
    if (score >= 6) return { label: "Referral Suggested", sub: "Traits are highly indicative of neurodivergence. Consult a specialist." };
    return { label: "Typical Range", sub: "Traits are within the typical neurotypical range." };
  },
  riasec: (scores) => {
    const sorted = Object.entries(scores).sort((a,b) => b[1] - a[1]);
    const top = sorted.slice(0, 3).map(s => s[0]).join('-');
    return { label: `Primary Code: ${top}`, sub: "Holland Codes mapping your vocational interests." };
  },
  panas: (scores) => {
    const pos = scores.Positive || 0;
    const neg = scores.Negative || 0;
    return { label: `PA: ${pos} / NA: ${neg}`, sub: "Positive and Negative Affect scores. Higher PA indicates more energy/interest." };
  },
  sd3: (scores) => {
    const top = Object.entries(scores).sort((a,b) => b[1] - a[1])[0][0];
    return { label: `Primary Trait: ${top}`, sub: "Highest scoring subclinical dark personality trait." };
  },
  mft: (scores) => {
    const top = Object.entries(scores).sort((a,b) => b[1] - a[1])[0][0];
    return { label: `Foundation: ${top}`, sub: "Your strongest moral foundation based on MFT metrics." };
  },
  schwartz: (scores) => {
    const top = Object.entries(scores).sort((a,b) => b[1] - a[1])[0][0];
    return { label: `Core Value: ${top}`, sub: "The primary motivation driving your choices and beliefs." }
  },
  trivia: (score, total) => ({ label: `Trivia Score: ${score}/${total}`, sub: score >= 8 ? "Polymath" : "General Enthusiast" })
};
