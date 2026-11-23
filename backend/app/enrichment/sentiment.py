from typing import List, Dict, Any, Optional
from app.data.news import NewsManager


async def extract_sector_or_company_sentiment(
    query: str,
    news_mgr: NewsManager,
    limit: int = 8
) -> Dict[str, Any]:
    """
    Extracts relevant headlines and computes news sentiment polarity for an Indian sector/company.
    """
    items = await news_mgr.get_recent_news(query=query, limit=limit)
    if not items:
        # Fallback to general market news
        items = await news_mgr.get_recent_news(limit=5)

    if not items:
        return {
            "query": query,
            "sentiment_score": 0.0,
            "sentiment_label": "Neutral",
            "article_count": 0,
            "top_headlines": [],
            "narrative_summary": "Insufficient recent news coverage to establish strong sentiment drift."
        }

    # Lexical scoring with Indian financial domain keywords
    positive_words = {
        "surge", "rally", "gain", "profit", "jump", "record", "growth", "expansion",
        "bullish", "upgrade", "outperform", "dividend", "order", "win", "approval", "boost",
        "turnaround", "cut", "easing", "capex", "inflow", "cheering"
    }
    negative_words = {
        "fall", "drop", "plunge", "loss", "crash", "slump", "concern", "hit", "drag",
        "penalty", "probe", "investigation", "ban", "restriction", "tariff", "inflation",
        "downside", "downgrade", "selloff", "spill", "default", "crisis", "rout"
    }

    scores = []
    headlines = []
    for item in items:
        text = f"{item.title} {item.summary}".lower()
        headlines.append(item.title)
        pos_count = sum(1 for w in positive_words if w in text)
        neg_count = sum(1 for w in negative_words if w in text)
        diff = pos_count - neg_count
        score = max(min(diff * 0.25, 1.0), -1.0)
        scores.append(score)

    avg_score = round(sum(scores) / len(scores), 2) if scores else 0.0
    if avg_score >= 0.2:
        label = "Constructive / Bullish"
    elif avg_score <= -0.2:
        label = "Cautious / Bearish"
    else:
        label = "Neutral / Balanced"

    return {
        "query": query,
        "sentiment_score": avg_score,
        "sentiment_label": label,
        "article_count": len(items),
        "top_headlines": headlines[:5],
        "narrative_summary": f"Recent media coverage ({len(items)} articles) indicates a {label.lower()} narrative tone with sentiment score of {avg_score:+0.2f}."
    }
