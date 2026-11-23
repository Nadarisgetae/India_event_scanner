import re
from typing import Tuple, Optional
from app.gateway.chat_gateway import ChatGateway


# Offline deterministic glossary for financial Hindi to ensure 100% zero-cost resilience
HINDI_FINANCIAL_GLOSSARY = [
    (r"\bकच्चे तेल\b", "crude oil"),
    (r"\bकच्चा तेल\b", "crude oil"),
    (r"\bकीमतों में\b", "in prices"),
    (r"\bकीमत\b", "price"),
    (r"\bबढ़ोतरी\b", "surge / increase"),
    (r"\bगिरावट\b", "fall / slump"),
    (r"\bभारतीय रिजर्व बैंक\b", "Reserve Bank of India (RBI)"),
    (r"\bआरबीआई\b", "RBI"),
    (r"\bरेपो रेट\b", "repo rate"),
    (r"\bब्याज दर(ों)?\b", "interest rate(s)"),
    (r"\bमुद्रास्फीति\b", "inflation"),
    (r"\bमहंगाई\b", "inflation"),
    (r"\bरुपया\b", "Indian Rupee (INR)"),
    (r"\bअमेरिकी डॉलर\b", "US Dollar (USD)"),
    (r"\bशेयर बाजार\b", "stock market"),
    (r"\bसेंसेक्स\b", "Sensex"),
    (r"\bनिफ्टी\b", "Nifty"),
    (r"\bघाटा\b", "deficit / loss"),
    (r"\bमुनाफा\b", "profit"),
    (r"\bकंपनियां\b", "companies"),
    (r"\bकंपनी\b", "company"),
    (r"\bनिर्यात\b", "exports"),
    (r"\bआयात\b", "imports"),
    (r"\bप्रतिबंध\b", "tariffs / sanctions"),
    (r"\bशुल्क\b", "duty / tariff"),
]


class MultiLingualProcessor:
    """
    Detects Hindi/Devanagari financial inputs, isolates NSE tickers and numbers,
    and converts text to standardized English financial reporting phrasing.
    """

    @staticmethod
    def is_devanagari(text: str) -> bool:
        """
        Returns True if text contains characters in the Devanagari unicode block (\u0900 - \u097F).
        """
        for ch in text:
            if "\u0900" <= ch <= "\u097f":
                return True
        return False

    @staticmethod
    def offline_translate(text: str) -> str:
        """
        Deterministic word-level and phrase-level glossary fallback.
        """
        result = text
        for pattern, replacement in HINDI_FINANCIAL_GLOSSARY:
            result = re.sub(pattern, replacement, result, flags=re.IGNORECASE)
        # Clean any leftover non-ascii Devanagari characters gracefully if phrase translation was partial
        cleaned = re.sub(r"[\u0900-\u097f]+", " ", result)
        cleaned = re.sub(r"\s+", " ", cleaned).strip()
        return cleaned or text

    @classmethod
    async def process_input_text(
        cls,
        text: str,
        chat_gateway: Optional[ChatGateway] = None,
    ) -> Tuple[str, str, Optional[str]]:
        """
        Takes raw event text.
        Returns: (english_text, detected_language, original_text_if_translated)
        """
        if not text or not cls.is_devanagari(text):
            return text, "en", None

        original_text = text

        # Attempt high-quality translation via Free LLM Gateway if available
        if chat_gateway:
            prompt = (
                "You are an expert bilingual Indian financial translator. "
                "Translate the following Hindi financial news headline/story into clear, professional English "
                "financial reporting phrasing.\n"
                "Rules:\n"
                "1. Keep all NSE/BSE company tickers, Indian stock names (e.g. Reliance, TCS, Maruti), and institutions (RBI, SEBI) intact.\n"
                "2. Keep all numbers, percentages (%), and currency amounts (₹, Cr, Lakh) exact.\n"
                "3. Return ONLY the English translation without any preamble or quotes.\n\n"
                f"Hindi Text: {text}"
            )
            try:
                res = await chat_gateway.chat([{"role": "user", "content": prompt}], max_tokens=250)
                if res and res.content and len(res.content.strip()) > 5:
                    return res.content.strip(), "hi", original_text
            except Exception:
                pass

        # Fallback to offline deterministic glossary
        translated = cls.offline_translate(text)
        return translated, "hi", original_text
