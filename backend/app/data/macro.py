from typing import Dict, Any
from app.models.event import MacroSnapshot
from app.data.prices import price_manager

class MacroManager:
    def __init__(self):
        pass

    def get_snapshot(self) -> MacroSnapshot:
        """
        Retrieves live-ish macroeconomic indicators for India.
        """
        nifty = price_manager.get_latest_price("^NSEI")
        sensex = price_manager.get_latest_price("^BSESN")
        vix = price_manager.get_latest_price("^INDIAVIX")
        usdinr = price_manager.get_latest_price("USDINR=X")
        brent = price_manager.get_latest_price("BZ=F")
        gold = price_manager.get_latest_price("GC=F")
        us10y = price_manager.get_latest_price("^TNX")

        return MacroSnapshot(
            nifty50=nifty if nifty > 1000 else 24850.0,
            sensex=sensex if sensex > 5000 else 81200.0,
            vix=vix if vix > 1 else 13.8,
            usdinr=usdinr if usdinr > 50 else 84.45,
            brent_crude=brent if brent > 10 else 74.20,
            gold=gold if gold > 100 else 2680.0,
            us_10y=us10y if us10y > 0.5 else 4.42,
            repo_rate=6.50
        )

    async def get_latest_macro_snapshot(self) -> MacroSnapshot:
        return self.get_snapshot()

macro_manager = MacroManager()

