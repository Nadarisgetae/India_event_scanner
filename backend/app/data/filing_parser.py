import re
from typing import Tuple, Dict, Any


class FilingParser:
    """
    Parses and extracts intelligence from Indian exchange corporate circulars & PDFs.
    Computes deterministic materiality scoring and categorizes regulatory filings.
    """

    HIGH_IMPACT_PATTERNS = [
        (r"\b(warning letter|form 483|official action indicated|oai|import alert)\b", "USFDA Regulatory Action", 9),
        (r"\b(sebi order|ed raid|cbi investigation|sfio|forensic audit)\b", "Regulatory Investigation", 9),
        (r"\b(resignation of (statutory )?auditor)\b", "Auditor Resignation", 9),
        (r"\b(plant shutdown|strike|lockout|force majeure|fire incident)\b", "Operational Disruption", 8),
        (r"\b(acquisition|amalgamation|merger|slump sale|demerger)\b", "M&A / Corporate Restructuring", 7),
        (r"\b(capacity expansion|greenfield|capex of rs\.?|new manufacturing unit)\b", "Capital Expenditure", 6),
        (r"\b(tax demand|gst notice|show cause notice|penalty imposed)\b", "Tax / Dispute Notification", 6),
        (r"\b(credit rating (downgrade|upgrade))\b", "Credit Rating Action", 7),
        (r"\b(dividend recommendation|bonus issue|stock split|buyback)\b", "Corporate Action", 5),
    ]

    NOISE_PATTERNS = [
        r"\b(loss of (share )?certificates?)\b",
        r"\b(issue of duplicate (share )?certificates?)\b",
        r"\b(closure of trading window)\b",
        r"\b(schedule of analyst|investor meet)\b",
    ]

    def evaluate_filing(self, headline: str, details_text: str = "") -> Tuple[str, int, bool]:
        """
        Returns (category, materiality_score [1-10], is_high_impact)
        """
        full_text = f"{headline} {details_text}".lower()

        # Check noise patterns
        for np in self.NOISE_PATTERNS:
            if re.search(np, full_text):
                return "Administrative Compliance", 1, False

        # Check high impact patterns
        for pattern, category, score in self.HIGH_IMPACT_PATTERNS:
            if re.search(pattern, full_text):
                return category, score, score >= 7

        # Default fallback
        if "financial result" in full_text or "quarterly result" in full_text:
            return "Financial Results", 6, False

        return "General Disclosure", 4, False
