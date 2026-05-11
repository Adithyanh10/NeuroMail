"""
Advanced AI Engine — 20 Innovation Features
Features: Intent Detection, Emotion Analysis, Tone Optimization, Context Memory,
Reply Scoring, Multi-Reply Generation, Email Summarization, Grammar Correction,
Priority Detection, Spam Detection, Meeting Extraction, Action Items, Language Detection
"""
import re
import math
from typing import Any

# ─── 1. SMART INTENT DETECTION ENGINE ────────────────────────────────────────

INTENT_PATTERNS = {
    "complaint": [
        "not working","broken","issue","problem","error","failed","terrible",
        "awful","disappointed","unacceptable","refund","complaint","wrong","bad service",
    ],
    "business_proposal": [
        "proposal","partnership","collaborate","opportunity","business","invest",
        "venture","deal","offer","contract","agreement","joint",
    ],
    "hr_communication": [
        "leave","vacation","salary","appraisal","performance","hr","human resources",
        "policy","onboarding","resignation","offer letter","joining",
    ],
    "customer_support": [
        "help","support","assist","account","login","password","order","delivery",
        "track","status","cancel","return","exchange",
    ],
    "meeting_request": [
        "meeting","schedule","call","discuss","appointment","calendar","available",
        "slot","zoom","teams","conference","sync","catch up",
    ],
    "follow_up": [
        "follow up","following up","checking in","any update","status update",
        "reminder","as discussed","as mentioned","per our conversation",
    ],
    "sales_inquiry": [
        "pricing","quote","cost","purchase","buy","subscription","plan","demo",
        "trial","interested in","how much","discount","offer",
    ],
}

def detect_intent(text: str) -> dict:
    text_lower = text.lower()
    scores = {}
    for intent, keywords in INTENT_PATTERNS.items():
        score = sum(1 for kw in keywords if kw in text_lower)
        if score > 0:
            scores[intent] = score
    if not scores:
        return {"intent": "general", "confidence": 0.5, "all_scores": {}}
    best = max(scores, key=scores.get)
    total = sum(scores.values())
    conf = round(scores[best] / total, 3) if total else 0.5
    return {"intent": best, "confidence": conf, "all_scores": scores}


# ─── 2. EMOTION ANALYSIS ─────────────────────────────────────────────────────

EMOTION_PATTERNS = {
    "angry": [
        "angry","furious","outraged","unacceptable","ridiculous","disgusting",
        "terrible","worst","hate","demand","immediately","lawsuit",
    ],
    "urgent": [
        "urgent","asap","immediately","right now","emergency","critical",
        "deadline","today","as soon as possible","time sensitive","rush",
    ],
    "happy": [
        "thank you","great","excellent","wonderful","happy","pleased","love",
        "appreciate","fantastic","amazing","perfect","brilliant","awesome",
    ],
    "frustrated": [
        "frustrated","annoyed","disappointed","fed up","tired of","keep having",
        "still not","again","third time","multiple times","no response",
    ],
    "neutral": [],
}

def analyze_emotion(text: str) -> dict:
    text_lower = text.lower()
    scores = {e: sum(1 for kw in kws if kw in text_lower)
              for e, kws in EMOTION_PATTERNS.items() if kws}
    if not any(scores.values()):
        return {"emotion": "neutral", "intensity": 0.3, "all_scores": {}}
    best = max(scores, key=scores.get)
    intensity = min(1.0, round(scores[best] * 0.2 + 0.3, 2))
    return {"emotion": best, "intensity": intensity, "all_scores": scores}


# ─── 3. AI TONE OPTIMIZATION ─────────────────────────────────────────────────

TONE_RECOMMENDATION_RULES = {
    ("complaint", "angry"):      "empathetic",
    ("complaint", "frustrated"):  "empathetic",
    ("business_proposal", "neutral"): "executive",
    ("business_proposal", "happy"):   "executive",
    ("hr_communication", "neutral"):  "corporate",
    ("meeting_request", "neutral"):   "professional",
    ("sales_inquiry", "neutral"):     "customer_friendly",
    ("customer_support", "angry"):    "empathetic",
    ("customer_support", "neutral"):  "customer_friendly",
    ("follow_up", "neutral"):         "professional",
}

TONE_TEMPLATES = {
    "executive": {
        "opening": "Thank you for reaching out.",
        "closing": "\n\nBest regards,\nExecutive Support Team",
        "style": "concise, authoritative, results-focused",
    },
    "corporate": {
        "opening": "Dear Team Member,\n\nThank you for your communication.",
        "closing": "\n\nKind regards,\nHR Department",
        "style": "formal, policy-aligned, structured",
    },
    "empathetic": {
        "opening": "I completely understand your concern and sincerely apologize for the inconvenience.",
        "closing": "\n\nWarm regards,\nCustomer Care Team",
        "style": "warm, understanding, solution-focused",
    },
    "customer_friendly": {
        "opening": "Hi there! Thanks so much for getting in touch.",
        "closing": "\n\nCheers,\nSupport Team",
        "style": "friendly, helpful, approachable",
    },
    "technical": {
        "opening": "Thank you for reporting this technical issue.",
        "closing": "\n\nBest,\nTechnical Support Team",
        "style": "precise, solution-oriented, detailed",
    },
    "startup": {
        "opening": "Hey! Thanks for reaching out.",
        "closing": "\n\nCheers! 🚀\nTeam",
        "style": "casual, energetic, direct",
    },
    "professional": {
        "opening": "Thank you for your email.",
        "closing": "\n\nBest regards,\nSupport Team",
        "style": "balanced, clear, professional",
    },
}

def recommend_tone(intent: str, emotion: str) -> dict:
    recommended = TONE_RECOMMENDATION_RULES.get(
        (intent, emotion),
        TONE_RECOMMENDATION_RULES.get((intent, "neutral"), "professional")
    )
    template = TONE_TEMPLATES.get(recommended, TONE_TEMPLATES["professional"])
    return {
        "recommended_tone": recommended,
        "style_description": template["style"],
        "opening_template": template["opening"],
        "closing_template": template["closing"],
        "all_tones": list(TONE_TEMPLATES.keys()),
    }


# ─── 5. AI REPLY SCORING SYSTEM ──────────────────────────────────────────────

def score_reply(reply: str) -> dict:
    scores = {}
    words = reply.split()
    word_count = len(words)

    # Professionalism: no slang, proper greeting/closing
    slang = ["gonna","wanna","kinda","sorta","yeah","nope","ok","lol","omg"]
    slang_hits = sum(1 for w in words if w.lower() in slang)
    scores["professionalism"] = max(0.0, round(1.0 - slang_hits * 0.15, 2))

    # Clarity: sentence length, not too long/short
    sentences = [s.strip() for s in re.split(r'[.!?]', reply) if s.strip()]
    avg_sent_len = word_count / max(len(sentences), 1)
    clarity = 1.0 if 10 <= avg_sent_len <= 25 else max(0.4, 1.0 - abs(avg_sent_len - 17) * 0.03)
    scores["clarity"] = round(clarity, 2)

    # Confidence: assertive language
    confident_phrases = ["will","ensure","guarantee","confirm","resolve","assist","provide"]
    weak_phrases = ["maybe","perhaps","might","possibly","not sure","i think","i guess"]
    conf_hits = sum(1 for w in words if w.lower() in confident_phrases)
    weak_hits = sum(1 for w in words if w.lower() in weak_phrases)
    scores["confidence"] = round(min(1.0, 0.5 + conf_hits * 0.1 - weak_hits * 0.1), 2)

    # Politeness: thank you, please, sorry, appreciate
    polite = ["thank","please","sorry","apologize","appreciate","kindly","respect"]
    polite_hits = sum(1 for w in words if w.lower() in polite)
    scores["politeness"] = round(min(1.0, 0.5 + polite_hits * 0.15), 2)

    # Grammar quality: basic checks
    grammar_score = 1.0
    if not reply[0].isupper():
        grammar_score -= 0.1
    if not reply.rstrip().endswith(('.', '!', '?')):
        grammar_score -= 0.05
    double_spaces = reply.count("  ")
    grammar_score -= double_spaces * 0.05
    scores["grammar_quality"] = round(max(0.0, grammar_score), 2)

    overall = round(sum(scores.values()) / len(scores), 3)
    return {
        "scores": scores,
        "overall_score": overall,
        "grade": "A" if overall >= 0.85 else "B" if overall >= 0.70 else "C" if overall >= 0.55 else "D",
        "ai_confidence_pct": round(overall * 100, 1),
    }


# ─── 6. MULTI-REPLY SUGGESTION GENERATOR ─────────────────────────────────────

def generate_multi_replies(base_reply: str, intent: str, emotion: str) -> dict:
    short = _make_short_reply(base_reply, intent)
    detailed = _make_detailed_reply(base_reply, intent, emotion)
    persuasive = _make_persuasive_reply(base_reply, intent)
    return {
        "short_reply": short,
        "detailed_reply": detailed,
        "persuasive_reply": persuasive,
    }

def _make_short_reply(base: str, intent: str) -> str:
    sentences = [s.strip() for s in re.split(r'(?<=[.!?])\s+', base) if s.strip()]
    core = sentences[0] if sentences else base
    return f"{core}\n\nWe will follow up shortly.\n\nBest regards,\nSupport Team"

def _make_detailed_reply(base: str, intent: str, emotion: str) -> str:
    empathy = ""
    if emotion in ("angry", "frustrated"):
        empathy = "We sincerely apologize for the inconvenience this has caused you. "
    action_map = {
        "complaint": "Our team will investigate this matter thoroughly and provide a resolution within 24-48 hours.",
        "customer_support": "Please allow us 1-2 business days to review your case and provide a comprehensive solution.",
        "meeting_request": "We will check our calendar and confirm a suitable time slot within the next few hours.",
        "follow_up": "We appreciate your patience. Here is a detailed update on the current status of your request.",
        "sales_inquiry": "We would be happy to provide a detailed breakdown of our pricing and available packages.",
        "business_proposal": "We have reviewed your proposal with great interest and would like to schedule a detailed discussion.",
        "hr_communication": "We have noted your request and will process it in accordance with our company policies.",
    }
    action = action_map.get(intent, "We will address your request with the highest priority.")
    return f"{empathy}{base}\n\n{action}\n\nPlease do not hesitate to reach out if you need any further assistance.\n\nBest regards,\nSupport Team"

def _make_persuasive_reply(base: str, intent: str) -> str:
    persuasive_map = {
        "sales_inquiry": "We are confident that our solution will exceed your expectations and deliver measurable ROI.",
        "business_proposal": "We believe this partnership represents a significant opportunity for mutual growth.",
        "complaint": "Your satisfaction is our top priority, and we are committed to making this right for you.",
        "customer_support": "We value your loyalty and will ensure this issue is resolved to your complete satisfaction.",
    }
    hook = persuasive_map.get(intent, "We are dedicated to providing you with the best possible experience.")
    return f"{base}\n\n{hook}\n\nWe look forward to your positive response.\n\nBest regards,\nSupport Team"


# ─── 7. EMAIL SUMMARIZATION ───────────────────────────────────────────────────

def summarize_email(text: str) -> dict:
    sentences = [s.strip() for s in re.split(r'(?<=[.!?])\s+', text) if len(s.strip()) > 20]
    key_points = sentences[:3] if len(sentences) >= 3 else sentences

    # Action items: sentences with action verbs
    action_verbs = ["please","kindly","need","require","request","send","provide",
                    "confirm","update","review","check","fix","resolve","schedule"]
    action_items = [s for s in sentences if any(v in s.lower() for v in action_verbs)][:3]

    # Deadlines: date/time patterns
    deadline_pattern = re.compile(
        r'\b(today|tomorrow|monday|tuesday|wednesday|thursday|friday|'
        r'by \w+|before \w+|\d{1,2}[/-]\d{1,2}|asap|urgent|immediately)\b',
        re.IGNORECASE
    )
    deadlines = list(set(deadline_pattern.findall(text)))[:3]

    # Entities: capitalized words (names, companies)
    entity_pattern = re.compile(r'\b[A-Z][a-z]+(?:\s[A-Z][a-z]+)*\b')
    raw_entities = entity_pattern.findall(text)
    stop_words = {"I","We","The","This","Please","Thank","Dear","Hi","Hello","Best","Kind"}
    entities = list(dict.fromkeys(e for e in raw_entities if e not in stop_words))[:5]

    word_count = len(text.split())
    summary_text = " ".join(key_points)
    if len(summary_text) > 200:
        summary_text = summary_text[:200] + "..."

    return {
        "summary": summary_text,
        "key_points": key_points,
        "action_items": action_items if action_items else ["No specific action items detected"],
        "deadlines": deadlines if deadlines else ["No deadlines mentioned"],
        "entities": entities,
        "word_count": word_count,
        "reading_time_seconds": max(10, word_count // 3),
    }


# ─── 8. GRAMMAR & FORMALITY CORRECTION ───────────────────────────────────────

CASUAL_TO_FORMAL = {
    r"\bi'm\b": "I am", r"\bcan't\b": "cannot", r"\bwon't\b": "will not",
    r"\bdon't\b": "do not", r"\bdidn't\b": "did not", r"\bisn't\b": "is not",
    r"\baren't\b": "are not", r"\bwasn't\b": "was not", r"\bweren't\b": "were not",
    r"\bhasn't\b": "has not", r"\bhaven't\b": "have not", r"\bhadn't\b": "had not",
    r"\bwouldn't\b": "would not", r"\bshouldn't\b": "should not",
    r"\bcouldn't\b": "could not", r"\bthey're\b": "they are",
    r"\bwe're\b": "we are", r"\byou're\b": "you are", r"\bit's\b": "it is",
    r"\bthat's\b": "that is", r"\bwhat's\b": "what is", r"\bthere's\b": "there is",
    r"\bgonna\b": "going to", r"\bwanna\b": "want to", r"\bgotta\b": "have to",
    r"\bkinda\b": "somewhat", r"\bsorta\b": "somewhat", r"\blots of\b": "many",
    r"\ba lot of\b": "many", r"\bget back to you\b": "respond to you",
    r"\bcheck out\b": "review", r"\bset up\b": "establish",
    r"\bfigure out\b": "determine", r"\bcome up with\b": "develop",
    r"\bok\b": "acceptable", r"\bokay\b": "acceptable",
    r"\byeah\b": "yes", r"\bnope\b": "no",
    r"\bhi\b": "Dear Sir/Madam,", r"\bhey\b": "Dear Sir/Madam,",
    r"\bthanks\b": "Thank you", r"\bthx\b": "Thank you",
    r"\bbtw\b": "additionally", r"\bfyi\b": "for your information",
    r"\basap\b": "as soon as possible",
}

def correct_grammar_and_formality(text: str) -> dict:
    corrected = text
    corrections_made = []
    for pattern, replacement in CASUAL_TO_FORMAL.items():
        new_text = re.sub(pattern, replacement, corrected, flags=re.IGNORECASE)
        if new_text != corrected:
            corrections_made.append({"from": pattern.replace(r"\b",""), "to": replacement})
            corrected = new_text

    # Capitalize first letter of each sentence
    corrected = re.sub(r'(?<=[.!?]\s)([a-z])', lambda m: m.group(1).upper(), corrected)
    if corrected and corrected[0].islower():
        corrected = corrected[0].upper() + corrected[1:]

    # Ensure ends with punctuation
    if corrected and corrected[-1] not in '.!?':
        corrected += '.'

    formality_score = round(min(1.0, 0.5 + len(corrections_made) * 0.05), 2)
    return {
        "corrected_text": corrected,
        "corrections_count": len(corrections_made),
        "corrections": corrections_made[:10],
        "formality_score": formality_score,
        "improvement_pct": round(len(corrections_made) / max(len(text.split()), 1) * 100, 1),
    }


# ─── 12. SPAM & RISK DETECTION ────────────────────────────────────────────────

SPAM_PATTERNS = [
    r"click here", r"free money", r"you have won", r"lottery", r"prize",
    r"nigerian prince", r"bank transfer", r"wire transfer", r"urgent transfer",
    r"verify your account", r"confirm your password", r"suspended account",
    r"unusual activity", r"click the link below", r"limited time offer",
    r"act now", r"congratulations you", r"selected winner",
    r"send your details", r"social security", r"credit card number",
    r"bitcoin", r"crypto investment", r"guaranteed returns",
]

PHISHING_PATTERNS = [
    r"paypal", r"amazon", r"microsoft", r"apple", r"google",
    r"your account has been", r"verify immediately", r"suspended",
    r"unusual sign.?in", r"login attempt", r"security alert",
]

def detect_spam_and_risk(text: str) -> dict:
    text_lower = text.lower()
    spam_hits = [p for p in SPAM_PATTERNS if re.search(p, text_lower)]
    phishing_hits = [p for p in PHISHING_PATTERNS if re.search(p, text_lower)]

    risk_score = min(1.0, len(spam_hits) * 0.15 + len(phishing_hits) * 0.2)
    risk_level = "high" if risk_score >= 0.6 else "medium" if risk_score >= 0.3 else "low"
    is_suspicious = risk_score >= 0.3

    warnings = []
    if spam_hits:
        warnings.append(f"Spam indicators detected: {', '.join(spam_hits[:3])}")
    if phishing_hits:
        warnings.append(f"Possible phishing attempt targeting: {', '.join(phishing_hits[:3])}")

    return {
        "is_suspicious": is_suspicious,
        "risk_level": risk_level,
        "risk_score": round(risk_score, 3),
        "warnings": warnings,
        "spam_indicators": spam_hits[:5],
        "phishing_indicators": phishing_hits[:5],
        "recommendation": "Do not reply — report to security team" if risk_level == "high"
                          else "Proceed with caution" if risk_level == "medium"
                          else "Safe to reply",
    }


# ─── 13. LANGUAGE DETECTION ───────────────────────────────────────────────────

LANGUAGE_SIGNATURES = {
    "english":    ["the","is","are","was","were","have","has","will","would","can","could","this","that","with","from","they","their"],
    "spanish":    ["el","la","los","las","es","son","está","están","que","con","por","para","una","uno","como","pero","más"],
    "french":     ["le","la","les","est","sont","avec","pour","dans","sur","qui","que","une","des","pas","plus","très","nous"],
    "german":     ["der","die","das","ist","sind","mit","für","auf","von","zu","ein","eine","nicht","auch","sich","aber","oder"],
    "hindi_roman":["hai","hain","kya","aap","main","mera","meri","yeh","woh","kar","karo","please","dhanyawad","namaste"],
    "portuguese": ["o","a","os","as","é","são","com","para","que","uma","não","mais","por","como","mas","seu","sua"],
}

def detect_language(text: str) -> dict:
    text_lower = text.lower()
    words = re.findall(r'\b\w+\b', text_lower)
    scores = {}
    for lang, sig_words in LANGUAGE_SIGNATURES.items():
        score = sum(1 for w in words if w in sig_words)
        if score > 0:
            scores[lang] = score
    if not scores:
        return {"language": "english", "confidence": 0.5, "all_scores": {}}
    best = max(scores, key=scores.get)
    total = sum(scores.values())
    conf = round(scores[best] / total, 3)
    return {"language": best, "confidence": conf, "all_scores": scores}


# ─── 14. MEETING & SCHEDULE EXTRACTION ───────────────────────────────────────

def extract_meeting_info(text: str) -> dict:
    is_meeting_request = any(kw in text.lower() for kw in [
        "meeting","schedule","call","discuss","appointment","available","slot",
        "zoom","teams","conference","sync","catch up","book","calendar"
    ])

    date_pattern = re.compile(
        r'\b(\d{1,2}[/-]\d{1,2}(?:[/-]\d{2,4})?|'
        r'(?:jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)\w*\s+\d{1,2}(?:st|nd|rd|th)?(?:\s*,?\s*\d{4})?|'
        r'(?:monday|tuesday|wednesday|thursday|friday|saturday|sunday)|'
        r'today|tomorrow|next\s+\w+)\b',
        re.IGNORECASE
    )
    time_pattern = re.compile(
        r'\b(\d{1,2}(?::\d{2})?\s*(?:am|pm)|'
        r'\d{1,2}:\d{2}|'
        r'(?:morning|afternoon|evening|noon|midnight))\b',
        re.IGNORECASE
    )
    participant_pattern = re.compile(r'\b[A-Z][a-z]+(?:\s[A-Z][a-z]+)?\b')

    dates = list(set(date_pattern.findall(text)))[:3]
    times = list(set(time_pattern.findall(text)))[:3]
    raw_participants = participant_pattern.findall(text)
    stop = {"I","We","The","This","Please","Thank","Dear","Hi","Hello","Best","Kind","Meeting","Schedule"}
    participants = list(dict.fromkeys(p for p in raw_participants if p not in stop))[:5]

    agenda_sentences = [s.strip() for s in re.split(r'[.!?]', text)
                        if any(kw in s.lower() for kw in ["discuss","agenda","topic","review","plan","cover"])]

    return {
        "is_meeting_request": is_meeting_request,
        "dates": dates,
        "times": times,
        "participants": participants,
        "agenda_items": agenda_sentences[:3],
        "suggested_reply": (
            "Thank you for the meeting request. I will check my calendar and confirm a suitable time shortly."
            if is_meeting_request else None
        ),
    }


# ─── 15. ACTION ITEM EXTRACTION ───────────────────────────────────────────────

def extract_action_items(text: str) -> dict:
    sentences = [s.strip() for s in re.split(r'(?<=[.!?])\s+', text) if s.strip()]
    action_verbs = [
        "please","kindly","need","require","must","should","send","provide",
        "confirm","update","review","check","fix","resolve","schedule","submit",
        "complete","finish","prepare","create","share","forward","approve","sign",
    ]
    action_items = []
    for s in sentences:
        s_lower = s.lower()
        if any(v in s_lower for v in action_verbs):
            priority = "high" if any(w in s_lower for w in ["urgent","asap","immediately","today"]) else "medium"
            action_items.append({"task": s, "priority": priority, "assignee": "Support Team"})

    return {
        "action_items": action_items[:8],
        "total_tasks": len(action_items),
        "high_priority_count": sum(1 for a in action_items if a["priority"] == "high"),
        "has_action_items": len(action_items) > 0,
    }


# ─── 11. AI SIGNATURE GENERATOR ──────────────────────────────────────────────

SIGNATURES = {
    "customer_support": "Customer Support Team\n📧 support@company.com | 📞 1-800-SUPPORT\nAvailable Mon-Fri, 9AM-6PM EST",
    "technical":        "Technical Support Team\n📧 tech@company.com | 🔧 support.company.com\nResponse time: 2-4 hours",
    "sales":            "Sales Team\n📧 sales@company.com | 📞 1-800-SALES\n🌐 www.company.com",
    "hr":               "Human Resources Department\n📧 hr@company.com\nConfidential — Internal Use Only",
    "executive":        "Executive Office\n📧 executive@company.com\nOffice of the CEO",
    "general":          "Support Team\n📧 hello@company.com\n🌐 www.company.com",
}

def generate_signature(intent: str, category: str) -> str:
    sig_map = {
        "customer_support": "customer_support",
        "complaint":        "customer_support",
        "sales_inquiry":    "sales",
        "hr_communication": "hr",
        "business_proposal":"executive",
        "technical":        "technical",
    }
    key = sig_map.get(intent, sig_map.get(category.lower(), "general"))
    return SIGNATURES.get(key, SIGNATURES["general"])


# ─── 16. HUMAN-LIKE ENHANCEMENT ──────────────────────────────────────────────

ROBOTIC_PHRASES = {
    "I am writing to inform you that": "I wanted to let you know that",
    "Please be advised that": "Just a heads up —",
    "It has come to our attention": "We noticed",
    "We would like to bring to your attention": "We wanted to highlight",
    "Please do not hesitate to contact us": "Feel free to reach out anytime",
    "We apologize for any inconvenience caused": "We're sorry for the trouble",
    "As per our records": "Based on what we have",
    "Kindly revert at the earliest": "Please get back to us when you can",
    "Please find attached herewith": "I've attached",
    "With reference to your email": "Regarding your email",
    "Further to our conversation": "Following up on our conversation",
    "I hope this email finds you well": "Hope you're doing well",
}

def humanize_reply(text: str) -> str:
    result = text
    for robotic, human in ROBOTIC_PHRASES.items():
        result = result.replace(robotic, human)
    return result
