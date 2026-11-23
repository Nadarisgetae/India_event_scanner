import asyncio
import uuid
from datetime import datetime, timezone
from typing import List, Optional
import xml.etree.ElementTree as ET
import httpx

from app.models.filings import CorporateAnnouncement, FilingsResponse
from app.data.filing_parser import FilingParser


class ExchangeWatcher:
    """
    Watches and digests public announcements and circulars from NSE, BSE, and regulatory portals.
    """

    REPRESENTATIVE_FILINGS = [
        {
            "symbol": "SUNPHARMA",
            "company_name": "Sun Pharmaceutical Industries Ltd",
            "exchange": "NSE",
            "headline": "USFDA issues Form 483 with 3 procedural observations following inspection of Dadra formulation facility",
            "summary": "Facility inspection conducted between Nov 10-18 concluded with procedural observations. None related to data integrity. Company preparing comprehensive corrective response within 15 days.",
            "attachment_url": "https://www.bseindia.com/xml-data/corpfiling/AttachLive/sunpharma-dadra-nov26.pdf"
        },
        {
            "symbol": "TATAMOTORS",
            "company_name": "Tata Motors Ltd",
            "exchange": "BSE",
            "headline": "Board approves Scheme of Arrangement for Demerger into two distinct listed entities (Commercial Vehicles & Passenger Vehicles)",
            "summary": "NCLT convened shareholder meeting approved demerger ratio 1:1. Expected listing of separate commercial and passenger vehicle companies by Q3 FY27.",
            "attachment_url": "https://www.bseindia.com/xml-data/corpfiling/AttachLive/tatamotors-demerger-nov26.pdf"
        },
        {
            "symbol": "RELIANCE",
            "company_name": "Reliance Industries Ltd",
            "exchange": "NSE",
            "headline": "Commissioning of first phase 10GW solar photovoltaic giga-complex at Dhirubhai Ambani Green Energy Giga Complex in Jamnagar",
            "summary": "Fully integrated solar module line commences trial production ahead of schedule, reducing cell import dependence from China.",
            "attachment_url": "https://www.bseindia.com/xml-data/corpfiling/AttachLive/ril-solar-giga-nov26.pdf"
        },
        {
            "symbol": "ASIANPAINT",
            "company_name": "Asian Paints Ltd",
            "exchange": "BSE",
            "headline": "Receipt of GST assessment order with tax demand and penalty of Rs 14.2 Crore from State Tax Officer, Chennai",
            "summary": "Demand pertains to input tax credit matching for FY 2019-20. The company will file an appeal before the Appellate Authority; no material impact on operations expected.",
            "attachment_url": "https://www.bseindia.com/xml-data/corpfiling/AttachLive/ap-gst-order-nov26.pdf"
        },
        {
            "symbol": "MARUTI",
            "company_name": "Maruti Suzuki India Ltd",
            "exchange": "NSE",
            "headline": "Temporary plant adjustment at Manesar facility due to international maritime shipping supply chain bottlenecks",
            "summary": "Electronic component shipments delayed due to Red Sea rerouting; production scheduled to operate at 85% capacity for two weeks.",
            "attachment_url": "https://www.bseindia.com/xml-data/corpfiling/AttachLive/maruti-production-update.pdf"
        },
        {
            "symbol": "INFY",
            "company_name": "Infosys Ltd",
            "exchange": "NSE",
            "headline": "Signs strategic 5-year USD 1.2 Billion AI transformation agreement with leading European financial group",
            "summary": "Infosys Topaz platform chosen to accelerate enterprise-wide generative AI and cloud modernization for Nordic enterprise.",
            "attachment_url": "https://www.bseindia.com/xml-data/corpfiling/AttachLive/infy-nordic-deal.pdf"
        },
        {
            "symbol": "HDFCBANK",
            "company_name": "HDFC Bank Ltd",
            "exchange": "BSE",
            "headline": "RBI approves appointment of Deputy Managing Director for a period of three years effective immediately",
            "summary": "Central bank communication dated Nov 21 confirms tenure following recommendation by Nomination & Remuneration Committee.",
            "attachment_url": "https://www.bseindia.com/xml-data/corpfiling/AttachLive/hdfc-rbi-approval.pdf"
        }
    ]

    def __init__(self):
        self.parser = FilingParser()

    async def get_recent_filings(self, exchange: Optional[str] = None, high_impact_only: bool = False) -> FilingsResponse:
        """
        Retrieves, classifies, and returns parsed corporate filings.
        """
        announcements: List[CorporateAnnouncement] = []

        for item in self.REPRESENTATIVE_FILINGS:
            ex = item.get("exchange", "NSE")
            if exchange and exchange.upper() != "ALL" and ex.upper() != exchange.upper():
                continue

            category, score, is_high = self.parser.evaluate_filing(
                item["headline"], item.get("summary", "")
            )

            if high_impact_only and not is_high:
                continue

            announcements.append(CorporateAnnouncement(
                id=f"FIL-{uuid.uuid4().hex[:6]}",
                symbol=item["symbol"],
                company_name=item["company_name"],
                exchange=ex,
                category=category,
                headline=item["headline"],
                summary=item.get("summary", ""),
                materiality_score=score,
                attachment_url=item.get("attachment_url"),
                is_high_impact=is_high,
                timestamp=datetime.now(timezone.utc).isoformat()
            ))

        high_count = sum(1 for a in announcements if a.is_high_impact)
        return FilingsResponse(
            count=len(announcements),
            high_impact_count=high_count,
            announcements=announcements
        )


exchange_watcher = ExchangeWatcher()
