from typing import Dict, Any, Optional
from app.data.prices import PriceManager


async def analyze_technicals_and_priced_in(
    symbol: str,
    price_mgr: PriceManager
) -> Dict[str, Any]:
    """
    Computes technical positioning and assesses whether an event is already priced in.
    """
    quote = await price_mgr.get_quote(symbol)
    if not quote:
        return {
            "symbol": symbol,
            "status": "unavailable",
            "priced_in_status": "Unknown",
            "technical_posture": "Neutral",
            "dma_20": None,
            "dma_50": None,
            "dma_200": None,
            "rsi_14": 50.0,
            "momentum_5d_pct": 0.0,
            "priced_in_reason": "Real-time pricing data currently unavailable for technical scan."
        }

    current = quote.current_price
    dma_20 = quote.dma_20
    dma_50 = quote.dma_50
    dma_200 = quote.dma_200
    rsi = quote.rsi_14 or 50.0
    mom_5d = quote.momentum_5d_pct

    # Determine trend posture
    above_200 = (current > dma_200) if dma_200 else True
    above_50 = (current > dma_50) if dma_50 else True

    if above_200 and above_50:
        posture = "Strong Bullish"
    elif above_200 and not above_50:
        posture = "Bullish Pullback"
    elif not above_200 and above_50:
        posture = "Bearish Counter-Rally"
    else:
        posture = "Deep Bearish"

    # Priced-In Evaluation
    # If RSI < 35 or 5-day momentum < -6%, negative macro events may already be largely discounted.
    # If RSI > 70 or 5-day momentum > +8%, positive tailwinds may be overbought / priced-in.
    if rsi <= 35.0 or mom_5d <= -6.0:
        priced_in_status = "Substantially Discounted"
        priced_in_reason = f"Stock has already fallen {abs(mom_5d):.1f}% over 5 sessions with RSI at {rsi:.1f} (oversold), suggesting downside risks are largely reflected in current valuations."
    elif rsi >= 68.0 or mom_5d >= 7.0:
        priced_in_status = "Optimism Fully Priced-In"
        priced_in_reason = f"Stock is up {mom_5d:.1f}% in past 5 sessions with RSI at {rsi:.1f} (near overbought); positive expectations leave little room for execution disappointment."
    else:
        priced_in_status = "Fresh Reaction Anticipated"
        priced_in_reason = f"RSI stands balanced at {rsi:.1f} with 5-day move of {mom_5d:+.1f}%; stock prices have not yet fully priced in the evolving event transmission."

    return {
        "symbol": symbol,
        "status": "active",
        "current_price": current,
        "currency": quote.currency,
        "priced_in_status": priced_in_status,
        "priced_in_reason": priced_in_reason,
        "technical_posture": posture,
        "dma_20": dma_20,
        "dma_50": dma_50,
        "dma_200": dma_200,
        "rsi_14": rsi,
        "momentum_5d_pct": mom_5d
    }
