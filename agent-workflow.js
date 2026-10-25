const urgentPattern = /\b(chest pain|can't breathe|cannot breathe|difficulty breathing|trouble breathing|shortness of breath|unconscious|passed out|severe bleeding|heavy bleeding|stroke|face drooping|suicidal|want to die|kill myself|overdose|seizure|need urgent help|urgent help|emergency)\b|सीने में दर्द|सांस नहीं|साँस नहीं|सांस लेने में दिक्कत|बेहोश|बहुत खून|आत्महत्या|जान देना|दिल का दौरा|स्ट्रोक/i;

const copy = {
  en: {
    urgent: 'This may need urgent attention. Call your local emergency number now or go to the nearest emergency department. If possible, ask someone nearby to stay with you. I can’t assess emergencies through chat.',
    followUpSymptom: 'I’m glad you reached out. To understand what kind of general information may be useful, when did this start, and how severe is it? If it feels severe or is getting worse, please seek medical care now.',
    symptomQuestion: 'When did this start, and how severe is it?',
    generalQuestion: 'Could you share a little more about what’s happening and what you’re hoping to understand?',
    followUpGeneral: 'I can try to help you find a safe next step. Could you share a little more about what’s happening and what you’re hoping to understand?',
    limitation: 'Thanks for sharing that. This demo doesn’t have the trained health model connected, so I can’t assess your symptoms or offer a personalized recommendation. For symptoms that persist, worsen, or concern you, please speak with a qualified healthcare professional.',
    unsupported: 'I can only offer this demo conversation in English, Hindi, or Hinglish. Please choose one of those languages above. The trained health model is not connected.',
    urgentStatus: 'URGENT — SEEK IN-PERSON HELP',
    urgentTitle: 'Please seek emergency help now.',
    demoStatus: 'DEMO — NO MODEL PREDICTION'
  },
  hi: {
    urgent: 'यह स्थिति तुरंत ध्यान देने योग्य हो सकती है। अभी अपने स्थानीय आपातकालीन नंबर पर कॉल करें या नज़दीकी आपातकालीन विभाग जाएँ। संभव हो तो किसी पास के व्यक्ति से अपने साथ रहने को कहें। मैं चैट में आपात स्थिति का आकलन नहीं कर सकता।',
    followUpSymptom: 'आपने बताया, इसके लिए धन्यवाद। सामान्य जानकारी के लिए, यह कब शुरू हुआ और इसकी गंभीरता कैसी है? अगर यह गंभीर लगे या बढ़ रहा हो, तो अभी चिकित्सा सहायता लें।',
    symptomQuestion: 'यह कब शुरू हुआ और इसकी गंभीरता कैसी है?',
    generalQuestion: 'क्या आप थोड़ा और बता सकते हैं कि क्या हो रहा है और आप क्या जानना चाहते हैं?',
    followUpGeneral: 'मैं सुरक्षित अगला कदम समझने में मदद कर सकता हूँ। क्या आप थोड़ा और बता सकते हैं कि क्या हो रहा है और आप क्या जानना चाहते हैं?',
    limitation: 'यह जानकारी साझा करने के लिए धन्यवाद। इस डेमो में प्रशिक्षित स्वास्थ्य मॉडल जुड़ा नहीं है, इसलिए मैं लक्षणों का आकलन या व्यक्तिगत सलाह नहीं दे सकता। लक्षण बने रहें, बढ़ें या चिंता हो, तो योग्य स्वास्थ्यकर्मी से बात करें।',
    unsupported: 'इस डेमो में बातचीत केवल English, हिन्दी या Hinglish में उपलब्ध है। कृपया ऊपर से इनमें से एक भाषा चुनें। प्रशिक्षित स्वास्थ्य मॉडल अभी जुड़ा नहीं है।',
    urgentStatus: 'तत्काल — व्यक्तिगत चिकित्सा सहायता लें',
    urgentTitle: 'कृपया अभी आपातकालीन मदद लें।',
    demoStatus: 'डेमो — मॉडल का कोई अनुमान नहीं'
  },
  hinglish: {
    urgent: 'Yeh situation urgent ho sakti hai. Abhi apne local emergency number par call karein ya nearest emergency department jaayein. Agar mumkin ho, kisi paas ke insaan ko apne saath rukne ko kahein. Main chat mein emergency assess nahi kar sakta.',
    followUpSymptom: 'Batane ke liye shukriya. General information ke liye, yeh kab shuru hua aur kitna severe hai? Agar yeh serious lag raha hai ya badh raha hai, toh abhi medical care lein.',
    symptomQuestion: 'Yeh kab shuru hua aur kitna severe hai?',
    generalQuestion: 'Thoda aur batayein ki kya ho raha hai aur aap kya samajhna chahte hain?',
    followUpGeneral: 'Main safe next step samajhne mein madad kar sakta hoon. Thoda aur batayein ki kya ho raha hai aur aap kya samajhna chahte hain?',
    limitation: 'Share karne ke liye shukriya. Is demo mein trained health model connected nahi hai, isliye main symptoms assess ya personalized advice nahi de sakta. Agar symptoms bane rahen, badhein, ya concern ho, toh qualified healthcare professional se baat karein.',
    unsupported: 'Is demo mein conversation sirf English, Hindi, ya Hinglish mein available hai. Please upar se inmein se ek language choose karein. Trained health model connected nahi hai.',
    urgentStatus: 'URGENT — IN-PERSON HELP LEIN',
    urgentTitle: 'Please abhi emergency help lein.',
    demoStatus: 'DEMO — KOI MODEL PREDICTION NAHI'
  }
};

function isSupportedScript(message) {
  return !/[\u0400-\u052f\u0600-\u06ff\u0900-\u097f\u3040-\u30ff\u3400-\u9fff]/.test(message) || /[\u0900-\u097f]/.test(message);
}

export function runHealthcareAgent(sessionId, userMessage, context = {}) {
  const language = context.language in copy ? context.language : 'en';
  const messages = copy[language];
  if (!isSupportedScript(userMessage)) {
    return { response: messages.unsupported, follow_up_question: null, status: 'unsupported_language', status_label: messages.demoStatus, safety_flags: [], model_info: { connected: false, prediction: null } };
  }
  if (urgentPattern.test(userMessage)) {
    return { response: messages.urgent, follow_up_question: null, status: 'urgent_escalation', status_label: messages.urgentStatus, urgent_title: messages.urgentTitle, safety_flags: ['urgent_signal_detected', 'model_bypassed'], model_info: { connected: false, prediction: null } };
  }
  if (context.completed || context.awaiting_follow_up) {
    return { response: messages.limitation, follow_up_question: null, status: 'safe_handoff', status_label: messages.demoStatus, safety_flags: ['model_unavailable', 'personal_assessment_not_provided'], model_info: { connected: false, prediction: null } };
  }
  const symptomRelated = /\b(pain|ache|hurt|symptom|fever|cough|headache|dizzy|rash|nausea|tired|sick|swelling|bleed|medicine|medication)\b|दर्द|बुखार|खांसी|खाँसी|सिरदर्द|चक्कर|लक्षण|दवा|तकलीफ/i.test(userMessage);
  return {
    response: symptomRelated ? messages.followUpSymptom : messages.followUpGeneral,
    follow_up_question: symptomRelated ? messages.symptomQuestion : messages.generalQuestion,
    status: 'needs_clarification',
    status_label: messages.demoStatus,
    safety_flags: [],
    model_info: { connected: false, prediction: null }
  };
}
