const fs = require('fs');

// Read sources
const english = JSON.parse(fs.readFileSync('scripts/english_bodies.json', 'utf-8'));
const chinese = JSON.parse(fs.readFileSync('hoved/locales/ch.json', 'utf-8'));

/**
 * Replace visible text in HTML using a translation map.
 * Only replaces text that appears between HTML tags (not in attributes).
 * Matches longest strings first to avoid partial overlaps.
 */
function translateHtml(html, map) {
  const entries = Object.entries(map).sort((a, b) => b[0].length - a[0].length);
  
  // Process text between closing > and opening <
  let result = html;
  for (const [from, to] of entries) {
    // Escape regex special chars
    const escaped = from.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    // Match text that is NOT inside a tag
    // We match: (text between > and <) that equals our search string
    const regex = new RegExp('(?<=>|^)' + escaped + '(?=<|$)', 'g');
    result = result.replace(regex, to);
  }
  return result;
}

console.log('=== Translating "talk" body ===');
const talkTrans = {
  "F1": "F1",
  "Get in Touch": "联系我们",
  "Secure Submission Form": "安全提交表单",
  "Scroll down to use the google contact form - Limit submission and reloading, this is to avoid spam": "向下滚动使用谷歌联系表单 - 限制提交和重新加载，以避免垃圾邮件",
  "Verify identity to display submission portal": "验证身份以显示提交门户",
  "Loading form\u2026": "正在加载表单……"
};
chinese.pages.talk.body = translateHtml(english.talk, talkTrans);

console.log('=== Translating "home" body ===');
const homeTrans = {
  "Resources": "资源",
  "Short explanations on key topics.": "关键主题的简要说明。",
  "Atheism": "无神论",
  "The rejection of claims regarding deities due to a lack of verifiable objective data. It relies on hard observation to view religious narratives as fiction or subjective truths rather than objective facts": "因缺乏可验证的客观数据而拒绝对神祇的主张。它依赖于严格观察，将宗教叙事视为虚构或主观真理而非客观事实",
  "Philosophy": "哲学",
  "The systematic study of fundamental questions regarding existence, knowledge, values, reason, mind, and language. It serves as the intellectual foundation from which science, Atheism, political ideologies, and personal worldviews stem to explain our reality": "对存在、知识、价值、理性、心灵和语言等基本问题的系统性研究。它作为知识基础，科学、无神论、政治意识形态和个人世界观由此衍生以解释我们的现实",
  "Belief": "信仰",
  "The psychological state of holding a proposition, narrative, or concept to be true, regardless of empirical evidence. It relies on subjective truths and soft observation rather than objective facts, making it fundamental for laws, ideologies, and religion": "持有某个命题、叙事或概念为真实的心理状态，无论是否有经验证据。它依赖于主观真理和软观察而非客观事实，因此是法律、意识形态和宗教的基础",
  "Bangladesh": "孟加拉国",
  "A sovereign country on the Bay of Bengal and successor to ancient Vanga and Gauda; it is a semi-secular republic with Islam as the state religion, shaped by Animism, Hinduism, and Buddhism, becoming Muslim-majority after Mughal reforms": "位于孟加拉湾的主权国家，是古代Vanga和Gauda的继承者；它是一个半世俗共和国，以伊斯兰教为国教，受万物有灵论、印度教和佛教影响，在莫卧儿改革后成为穆斯林多数国家",
  "Islam": "伊斯兰教",
  "A monotheistic Abrahamic religion based on the Quran, which adherents consider to be the verbatim word of a deity, and the teachings of Muhammad (Hadith). It functions as a comprehensive life view, legal system, and ideology built on faith and subjective truth rather than empirical hard observation": "一种基于《古兰经》的一神论亚伯拉罕宗教，信徒认为其为神的逐字话语以及穆罕默德的教导（圣训）。它作为一种全面的生活观、法律体系和意识形态，建立在信仰和主观真理而非经验的严格观察之上",
  "Life View": "生活观",
  "A comprehensive framework of beliefs, convictions, and values that a person or culture uses to interpret the world and interact with reality. It integrates philosophy, ideology, or religion into personal narratives that guide purpose, ethics, and action": "个人或文化用来解读世界和与现实互动的一整套信仰、信念和价值观框架。它将哲学、意识形态或宗教融入个人叙事，指导目的、伦理和行动",
  "Open": "打开"
};
chinese.pages.home.body = translateHtml(english.home, homeTrans);

console.log('=== Translating "si" body ===');
const siTrans = {
  "Context": "背景",
  "The Regional Crossroads": "区域十字路口",
  "Atheism does not exist separately from society. It develops within specific cultures, histories, and political environments. This project examines atheism through the realities of Bangladesh and the surrounding region, where religion often influences more than personal belief. It can shape family expectations, education, politics, laws, social identity, and public debates.": "无神论并不独立于社会而存在。它在特定的文化、历史和政治环境中发展。本项目通过孟加拉国及周边地区的现实来审视无神论，在这些地方，宗教往往影响的不只是个人信仰。它可以塑造家庭期望、教育、政治、法律、社会身份和公共辩论。",
  "In this context, questioning religion is not only a matter of philosophy. For many people, it can affect relationships, opportunities, and their place within their communities. This site exists to explore those issues in detail. It looks at how belief systems gain influence, how societies respond to doubt, and how people navigate life when their views do not match the traditions around them.": "在此背景下，质疑宗教不仅仅是哲学问题。对许多人来说，它可能影响人际关系、机会以及他们在社区中的位置。本网站旨在详细探讨这些问题。它审视信仰体系如何获得影响力，社会如何回应怀疑，以及当人们的观点与周围传统不符时，他们如何应对生活。",
  "Bangladesh is the main focus, but the questions explored here extend beyond national borders. Across South Asia, countries such as India, Pakistan, Nepal, and Sri Lanka face their own debates about religion, secularism, freedom of expression, and individual rights. The details differ from place to place, but many of the underlying challenges are connected. Atheism in this region cannot be understood only as a personal position. It is also connected to history, institutions, politics, and social expectations. This project examines those connections by looking at both the larger systems and the experiences of individuals living within them.": "孟加拉国是主要焦点，但这里探讨的问题超越了国界。在整个南亚，印度、巴基斯坦、尼泊尔和斯里兰卡等国都在进行关于宗教、世俗主义、言论自由和个人权利的辩论。具体细节因地而异，但许多根本挑战是相互关联的。该地区的无神论不能仅被理解为个人立场。它也与历史、制度、政治和社会期望相关。本项目通过审视更大的体系以及生活其中的个人经历来考察这些联系。",
  "Scope": "范围",
  "What This Project Covers": "本项目涵盖的内容",
  "This site examines the connections across multiple layers of society:": "本网站考察社会多个层面的联系：",
  "History:": "历史：",
  "Religion has played a major role in shaping societies, governments, and cultural traditions. This section explores how religious narratives have evolved and how they continue to influence modern life.": "宗教在塑造社会、政府和文化传统方面发挥了重要作用。本节探讨宗教叙事如何演变，以及它们如何继续影响现代生活。",
  "Philosophy:": "哲学：",
  "Atheism raises fundamental questions about knowledge, evidence, morality, and reality. This section examines arguments surrounding belief, disbelief, and the nature of truth itself.": "无神论引发了关于知识、证据、道德和现实的基本问题。本节审视围绕信仰、不信仰以及真理本身性质的论证。",
  "Politics and Current Events:": "政治与时事：",
  "Religious ideas often influence laws, elections, and public policy. This project analyzes how religion interacts with political power, both in Bangladesh and globally.": "宗教思想常常影响法律、选举和公共政策。本项目分析宗教如何与政治权力互动，无论是在孟加拉国还是全球范围内。",
  "Economics and Development:": "经济与发展：",
  "Belief systems can influence attitudes toward education, labor, social structures, and national development. This section examines the economic dimensions of religious influence.": "信仰体系可以影响对教育、劳动、社会结构和国家发展的态度。本节审视宗教影响的经济维度。",
  "Personal Experiences:": "个人经历：",
  "Behind every debate are real people. This project also focuses on the experiences of those who question or reject religious beliefs, and how their lives are shaped by the societies around them.": "每场辩论背后都是真实的人。本项目也关注那些质疑或拒绝宗教信仰的人的经历，以及他们的生活如何被周围的社会所塑造。",
  "Stance": "立场",
  "A Commitment to Evidence and Critical Thinking": "对证据和批判性思维的承诺",
  "Every project has a perspective. Pretending to have none often hides the assumptions that shape it. This site approaches its subject from a secular, atheistic, and evidence-based position.": "每个项目都有视角。假装没有视角往往会隐藏塑造它的假设。本网站从世俗、无神论和基于证据的立场来探讨其主题。",
  "The goal is not to create a space where every idea is accepted without question. Ideas should be evaluated based on the quality of their evidence and reasoning. The site is open to correction and improvement, but it does not treat all viewpoints as equally valid.": "目标不是创造一个每个想法都毋庸置疑地被接受的空间。思想应根据其证据和推理的质量来评估。本网站接受更正和改进，但不会将所有观点视为同样有效。",
  "Many people inherit beliefs through family, culture, and tradition. Those beliefs can provide meaning and community, but inherited truth is still inherited. This project asks everyone, regardless of their background, to examine what they believe and why.": "许多人通过家庭、文化和传统继承信仰。这些信仰可以提供意义和社区，但继承的真理仍然是继承的。本项目要求每个人，无论其背景如何，审视他们相信什么以及为什么相信。",
  "Questioning old answers is not the end of the search. It is where a deeper search begins.": "质疑旧答案并非探索的终点。这是一场更深入探索的起点。"
};
chinese.pages.si.body = translateHtml(english.si, siTrans);

// Write intermediate result
fs.writeFileSync('hoved/locales/ch.json', JSON.stringify(chinese, null, 2) + '\n', 'utf-8');
console.log('Phase 1 done: talk, home, si');
