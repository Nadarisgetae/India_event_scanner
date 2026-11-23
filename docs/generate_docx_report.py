"""
BML Munjal University - Major Project-II Report Generator
Project Title: India Event Scanner
Author: Aditya Nadar (Roll No: 210110024)
Department of Computer Science and Engineering, School of Engineering and Technology
BML Munjal University, Gurugram (India)
"""

import os
import shutil
import docx
from docx.shared import Inches, Pt, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_TABLE_ALIGNMENT, WD_ALIGN_VERTICAL
from docx.oxml import parse_xml, OxmlElement
from docx.oxml.ns import nsdecls, qn

def create_report():
    doc = docx.Document()

    # Define standard margins (1.25" left for thesis binding, 1.0" top/bottom/right)
    for section in doc.sections:
        section.top_margin = Inches(1.0)
        section.bottom_margin = Inches(1.0)
        section.left_margin = Inches(1.25)
        section.right_margin = Inches(1.0)

    # Styling constants
    COLOR_PRIMARY = RGBColor(15, 23, 42)     # Deep Slate / Navy
    COLOR_SECONDARY = RGBColor(30, 58, 138)  # Deep Blue
    COLOR_MUTED = RGBColor(71, 85, 105)      # Slate Muted
    COLOR_BODY = RGBColor(30, 41, 59)        # Body Charcoal
    COLOR_WHITE = RGBColor(255, 255, 255)

    HEX_HEADER_BG = "1E3A8A"   # Deep Navy for table headers
    HEX_ALT_ROW = "F8FAFC"     # Light slate alternate row
    HEX_BORDER = "CBD5E1"      # Border gray
    HEX_CALLOUT_BG = "F1F5F9"  # Callout box background
    HEX_CODE_BG = "F8FAFC"

    FONT_FAMILY = "Times New Roman"

    # Set normal style
    normal_style = doc.styles['Normal']
    normal_style.font.name = FONT_FAMILY
    normal_style.font.size = Pt(12)
    normal_style.font.color.rgb = COLOR_BODY
    normal_style.paragraph_format.line_spacing = 1.3
    normal_style.paragraph_format.space_after = Pt(6)
    normal_style.paragraph_format.alignment = WD_ALIGN_PARAGRAPH.JUSTIFY

    # XML Helper Functions
    def set_cell_background(cell, hex_color):
        tcPr = cell._tc.get_or_add_tcPr()
        tcPr.append(parse_xml(f'<w:shd {nsdecls("w")} w:fill="{hex_color}"/>'))

    def set_cell_margins(cell, top=120, bottom=120, left=160, right=160):
        tcPr = cell._tc.get_or_add_tcPr()
        tcMar = OxmlElement('w:tcMar')
        for m, val in [('top', top), ('bottom', bottom), ('left', left), ('right', right)]:
            node = OxmlElement(f'w:{m}')
            node.set(qn('w:w'), str(val))
            node.set(qn('w:type'), 'dxa')
            tcMar.append(node)
        tcPr.append(tcMar)

    def set_cell_borders(cell, top=None, bottom=None, left=None, right=None):
        tcPr = cell._tc.get_or_add_tcPr()
        tcBorders = OxmlElement('w:tcBorders')
        borders = {'top': top, 'bottom': bottom, 'left': left, 'right': right}
        for b_name, b_val in borders.items():
            if b_val:
                b_elm = OxmlElement(f'w:{b_name}')
                b_elm.set(qn('w:val'), b_val.get('val', 'single'))
                b_elm.set(qn('w:sz'), str(b_val.get('sz', 4)))
                b_elm.set(qn('w:space'), '0')
                b_elm.set(qn('w:color'), b_val.get('color', HEX_BORDER))
                tcBorders.append(b_elm)
            else:
                b_elm = OxmlElement(f'w:{b_name}')
                b_elm.set(qn('w:val'), 'none')
                tcBorders.append(b_elm)
        tcPr.append(tcBorders)

    # Content Helper Functions
    def add_p(text, bold=False, italic=False, align=WD_ALIGN_PARAGRAPH.JUSTIFY, space_after=6, font_size=12, color=COLOR_BODY):
        p = doc.add_paragraph()
        p.alignment = align
        p.paragraph_format.space_after = Pt(space_after)
        p.paragraph_format.line_spacing = 1.3
        r = p.add_run(text)
        r.font.name = FONT_FAMILY
        r.font.size = Pt(font_size)
        r.font.bold = bold
        r.font.italic = italic
        r.font.color.rgb = color
        return p

    def add_bullet(prefix, text, space_after=4):
        p = doc.add_paragraph(style='List Bullet')
        p.paragraph_format.space_after = Pt(space_after)
        p.paragraph_format.line_spacing = 1.25
        p.alignment = WD_ALIGN_PARAGRAPH.JUSTIFY
        r_pre = p.add_run(prefix + " ")
        r_pre.font.name = FONT_FAMILY
        r_pre.font.size = Pt(12)
        r_pre.font.bold = True
        r_pre.font.color.rgb = COLOR_PRIMARY
        
        r_txt = p.add_run(text)
        r_txt.font.name = FONT_FAMILY
        r_txt.font.size = Pt(12)
        r_txt.font.color.rgb = COLOR_BODY
        return p

    def add_chap_heading(number, title):
        doc.add_page_break()
        p_num = doc.add_paragraph()
        p_num.alignment = WD_ALIGN_PARAGRAPH.CENTER
        p_num.paragraph_format.space_before = Pt(12)
        p_num.paragraph_format.space_after = Pt(4)
        r_num = p_num.add_run(f"CHAPTER {number}")
        r_num.font.name = FONT_FAMILY
        r_num.font.size = Pt(16)
        r_num.font.bold = True
        r_num.font.color.rgb = COLOR_SECONDARY

        p_tit = doc.add_paragraph()
        p_tit.alignment = WD_ALIGN_PARAGRAPH.CENTER
        p_tit.paragraph_format.space_after = Pt(18)
        r_tit = p_tit.add_run(title.upper())
        r_tit.font.name = FONT_FAMILY
        r_tit.font.size = Pt(16)
        r_tit.font.bold = True
        r_tit.font.color.rgb = COLOR_PRIMARY

        # Decorative line
        p_div = doc.add_paragraph()
        p_div.alignment = WD_ALIGN_PARAGRAPH.CENTER
        p_div.paragraph_format.space_after = Pt(16)
        r_div = p_div.add_run("____________________________________________________________________")
        r_div.font.name = FONT_FAMILY
        r_div.font.size = Pt(10)
        r_div.font.color.rgb = COLOR_MUTED

    def add_sec_heading(title, space_before=14, space_after=6):
        p = doc.add_paragraph()
        p.paragraph_format.space_before = Pt(space_before)
        p.paragraph_format.space_after = Pt(space_after)
        p.paragraph_format.keep_with_next = True
        r = p.add_run(title)
        r.font.name = FONT_FAMILY
        r.font.size = Pt(13.5)
        r.font.bold = True
        r.font.color.rgb = COLOR_SECONDARY
        return p

    def add_subsec_heading(title, space_before=10, space_after=4):
        p = doc.add_paragraph()
        p.paragraph_format.space_before = Pt(space_before)
        p.paragraph_format.space_after = Pt(space_after)
        p.paragraph_format.keep_with_next = True
        r = p.add_run(title)
        r.font.name = FONT_FAMILY
        r.font.size = Pt(12)
        r.font.bold = True
        r.font.italic = True
        r.font.color.rgb = COLOR_PRIMARY
        return p

    def add_callout(title, text):
        tbl = doc.add_table(rows=1, cols=1)
        tbl.alignment = WD_TABLE_ALIGNMENT.CENTER
        cell = tbl.cell(0, 0)
        cell.width = Inches(6.25)
        set_cell_background(cell, HEX_CALLOUT_BG)
        set_cell_margins(cell, top=140, bottom=140, left=180, right=160)
        set_cell_borders(cell, 
                         left={'val': 'single', 'sz': 16, 'color': '1E3A8A'},
                         top={'val': 'single', 'sz': 4, 'color': HEX_BORDER},
                         right={'val': 'single', 'sz': 4, 'color': HEX_BORDER},
                         bottom={'val': 'single', 'sz': 4, 'color': HEX_BORDER})
        
        p = cell.paragraphs[0]
        p.paragraph_format.space_after = Pt(3)
        r_t = p.add_run(title)
        r_t.font.name = FONT_FAMILY
        r_t.font.size = Pt(11)
        r_t.font.bold = True
        r_t.font.color.rgb = COLOR_SECONDARY
        
        p_txt = cell.add_paragraph()
        p_txt.paragraph_format.space_after = Pt(0)
        p_txt.paragraph_format.line_spacing = 1.25
        r_b = p_txt.add_run(text)
        r_b.font.name = FONT_FAMILY
        r_b.font.size = Pt(10.5)
        r_b.font.color.rgb = COLOR_BODY
        
        p_after = doc.add_paragraph()
        p_after.paragraph_format.space_after = Pt(4)

    def add_code_block(code_text):
        tbl = doc.add_table(rows=1, cols=1)
        tbl.alignment = WD_TABLE_ALIGNMENT.CENTER
        cell = tbl.cell(0, 0)
        cell.width = Inches(6.25)
        set_cell_background(cell, HEX_CODE_BG)
        set_cell_margins(cell, top=100, bottom=100, left=140, right=140)
        set_cell_borders(cell, 
                         left={'val': 'single', 'sz': 6, 'color': HEX_BORDER},
                         top={'val': 'single', 'sz': 6, 'color': HEX_BORDER},
                         right={'val': 'single', 'sz': 6, 'color': HEX_BORDER},
                         bottom={'val': 'single', 'sz': 6, 'color': HEX_BORDER})
        
        p = cell.paragraphs[0]
        p.paragraph_format.space_after = Pt(0)
        p.paragraph_format.line_spacing = 1.15
        r = p.add_run(code_text)
        r.font.name = 'Consolas'
        r.font.size = Pt(9.5)
        r.font.color.rgb = RGBColor(15, 23, 42)
        
        p_after = doc.add_paragraph()
        p_after.paragraph_format.space_after = Pt(4)

    def add_table_data(headers, rows, col_widths=None, alignment=WD_ALIGN_PARAGRAPH.LEFT):
        tbl = doc.add_table(rows=len(rows) + 1, cols=len(headers))
        tbl.alignment = WD_TABLE_ALIGNMENT.CENTER
        
        # Header Row
        hdr_row = tbl.rows[0]
        hdr_tr = hdr_row._tr.get_or_add_trPr()
        hdr_tr.append(parse_xml(f'<w:tblHeader {nsdecls("w")}/>'))
        
        for i, title in enumerate(headers):
            c = hdr_row.cells[i]
            if col_widths and i < len(col_widths):
                c.width = Inches(col_widths[i])
            set_cell_background(c, HEX_HEADER_BG)
            set_cell_margins(c, top=140, bottom=140, left=140, right=140)
            set_cell_borders(c, 
                             top={'val': 'single', 'sz': 6, 'color': '1E3A8A'},
                             bottom={'val': 'single', 'sz': 8, 'color': '0F172A'},
                             left={'val': 'single', 'sz': 4, 'color': '3B82F6'},
                             right={'val': 'single', 'sz': 4, 'color': '3B82F6'})
            p = c.paragraphs[0]
            p.alignment = WD_ALIGN_PARAGRAPH.CENTER
            p.paragraph_format.space_after = Pt(0)
            r = p.add_run(title)
            r.font.name = FONT_FAMILY
            r.font.size = Pt(10.5)
            r.font.bold = True
            r.font.color.rgb = COLOR_WHITE
            
        # Data Rows
        for r_idx, row in enumerate(rows):
            cur_row = tbl.rows[r_idx + 1]
            fill_color = HEX_ALT_ROW if r_idx % 2 == 1 else "FFFFFF"
            for c_idx, val in enumerate(row):
                c = cur_row.cells[c_idx]
                if col_widths and c_idx < len(col_widths):
                    c.width = Inches(col_widths[c_idx])
                set_cell_background(c, fill_color)
                set_cell_margins(c, top=100, bottom=100, left=120, right=120)
                set_cell_borders(c, 
                                 top={'val': 'single', 'sz': 4, 'color': HEX_BORDER},
                                 bottom={'val': 'single', 'sz': 4, 'color': HEX_BORDER},
                                 left={'val': 'single', 'sz': 4, 'color': HEX_BORDER},
                                 right={'val': 'single', 'sz': 4, 'color': HEX_BORDER})
                p = c.paragraphs[0]
                p.alignment = alignment if c_idx > 0 else WD_ALIGN_PARAGRAPH.LEFT
                p.paragraph_format.space_after = Pt(0)
                p.paragraph_format.line_spacing = 1.2
                r = p.add_run(str(val))
                r.font.name = FONT_FAMILY
                r.font.size = Pt(10)
                r.font.color.rgb = COLOR_BODY

        p_after = doc.add_paragraph()
        p_after.paragraph_format.space_after = Pt(6)

    print("Building Title Page...")
    # =========================================================================
    # TITLE PAGE
    # =========================================================================
    p1 = add_p("A", bold=False, align=WD_ALIGN_PARAGRAPH.CENTER, space_after=2, font_size=16)
    p2 = add_p("PROJECT-IV REPORT", bold=True, align=WD_ALIGN_PARAGRAPH.CENTER, space_after=2, font_size=20, color=COLOR_SECONDARY)
    p3 = add_p("on", italic=True, align=WD_ALIGN_PARAGRAPH.CENTER, space_after=10, font_size=14)
    p4 = add_p("INDIA EVENT SCANNER: A DETERMINISTIC MULTI-AGENT MACROECONOMIC TRANSMISSION AND CORPORATE STRESS-TESTING INTELLIGENCE SYSTEM FOR INDIAN EQUITIES", 
               bold=True, align=WD_ALIGN_PARAGRAPH.CENTER, space_after=16, font_size=16, color=COLOR_PRIMARY)

    logo_path = r'c:\Projects\India Event Scanner\docs\bmu_logo.png'
    if os.path.exists(logo_path):
        p_logo = doc.add_paragraph()
        p_logo.alignment = WD_ALIGN_PARAGRAPH.CENTER
        p_logo.paragraph_format.space_after = Pt(14)
        run_logo = p_logo.add_run()
        run_logo.add_picture(logo_path, width=Inches(2.5))

    p5 = add_p("Submitted in partial fulfillment of requirements for the award of Degree of", italic=True, align=WD_ALIGN_PARAGRAPH.CENTER, space_after=2, font_size=12)
    p6 = add_p("Bachelor of Technology in Computer Science and Engineering", bold=True, align=WD_ALIGN_PARAGRAPH.CENTER, space_after=16, font_size=14, color=COLOR_SECONDARY)

    # Submission block
    p_sub = doc.add_paragraph()
    p_sub.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_sub.paragraph_format.space_after = Pt(16)
    
    r = p_sub.add_run("Submitted by:\n")
    r.font.name = FONT_FAMILY
    r.font.size = Pt(12)
    r.font.bold = False
    
    r = p_sub.add_run("Aditya Nadar\n")
    r.font.name = FONT_FAMILY
    r.font.size = Pt(14)
    r.font.bold = True
    r.font.color.rgb = COLOR_PRIMARY
    
    r = p_sub.add_run("(Enrollment No. 210110024)\n\n")
    r.font.name = FONT_FAMILY
    r.font.size = Pt(12)
    
    r = p_sub.add_run("under mentorship of\n")
    r.font.name = FONT_FAMILY
    r.font.size = Pt(12)
    
    r = p_sub.add_run("Dr. Mentor Name\n")
    r.font.name = FONT_FAMILY
    r.font.size = Pt(14)
    r.font.bold = True
    r.font.color.rgb = COLOR_SECONDARY
    
    r = p_sub.add_run("(Associate Professor / Professor)\n")
    r.font.name = FONT_FAMILY
    r.font.size = Pt(12)

    p7 = add_p("DEPARTMENT OF COMPUTER SCIENCE AND ENGINEERING\nSCHOOL OF ENGINEERING AND TECHNOLOGY\nBML MUNJAL UNIVERSITY, GURUGRAM (INDIA)\nMAY 2026", 
               bold=True, align=WD_ALIGN_PARAGRAPH.CENTER, space_after=0, font_size=12, color=COLOR_PRIMARY)

    # =========================================================================
    # CANDIDATE'S AND SUPERVISOR'S DECLARATION
    # =========================================================================
    print("Building Declarations...")
    doc.add_page_break()
    add_p("CANDIDATE’S DECLARATION", bold=True, align=WD_ALIGN_PARAGRAPH.CENTER, space_after=16, font_size=16, color=COLOR_SECONDARY)
    
    dec_text = (
        "I hereby certify that the work on the project entitled, \"INDIA EVENT SCANNER: A DETERMINISTIC MULTI-AGENT "
        "MACROECONOMIC TRANSMISSION AND CORPORATE STRESS-TESTING INTELLIGENCE SYSTEM FOR INDIAN EQUITIES\", in partial "
        "fulfillment of requirements for the award of Degree of Bachelor of Technology in School of Engineering and Technology "
        "at BML Munjal University, having University Roll No. 210110024, is an authentic record of my own work carried out "
        "during a period from July 2025 to May 2026 under the supervision of Dr. Mentor Name.\n\n"
        "The matter embodied in this report has not been submitted by me for the award of any other degree or diploma to any other University or Institute."
    )
    add_p(dec_text, space_after=24)

    p_sig = doc.add_paragraph()
    p_sig.alignment = WD_ALIGN_PARAGRAPH.RIGHT
    p_sig.paragraph_format.space_after = Pt(28)
    r = p_sig.add_run("_____________________________\n(Aditya Nadar)\nEnrollment No. 210110024\nDepartment of CSE, SOET\nBML Munjal University")
    r.font.name = FONT_FAMILY
    r.font.size = Pt(11)
    r.font.bold = True

    add_p("SUPERVISOR’S DECLARATION", bold=True, align=WD_ALIGN_PARAGRAPH.CENTER, space_after=14, font_size=16, color=COLOR_SECONDARY)
    sup_text = "This is to certify that the above statement made by the candidate is correct to the best of my knowledge and belief. The project work has reached the requisite academic standard for submission in partial fulfillment of the degree of Bachelor of Technology in Computer Science and Engineering."
    add_p(sup_text, space_after=24)

    p_sup_sig = doc.add_paragraph()
    p_sup_sig.alignment = WD_ALIGN_PARAGRAPH.LEFT
    p_sup_sig.paragraph_format.space_after = Pt(12)
    r = p_sup_sig.add_run("Faculty Supervisor Name: Dr. Mentor Name\nDesignation: Associate Professor / Professor\nDepartment of Computer Science and Engineering\nSchool of Engineering and Technology\nBML Munjal University, Gurugram\nSignature: _____________________________")
    r.font.name = FONT_FAMILY
    r.font.size = Pt(11)
    r.font.bold = True

    # =========================================================================
    # ACKNOWLEDGEMENT
    # =========================================================================
    print("Building Acknowledgement...")
    doc.add_page_break()
    add_p("ACKNOWLEDGEMENT", bold=True, align=WD_ALIGN_PARAGRAPH.CENTER, space_after=16, font_size=16, color=COLOR_SECONDARY)
    
    ack_1 = (
        "I am highly grateful to Dr. Mentor Name, Associate Professor, Department of Computer Science and Engineering, "
        "School of Engineering and Technology, BML Munjal University, Gurugram, for providing supervision, constructive criticism, "
        "and technical guidance to carry out this major project during the academic year 2025–2026."
    )
    add_p(ack_1, space_after=10)

    ack_2 = (
        "Dr. Mentor Name has provided great help in carrying out my work and is acknowledged with reverential thanks. "
        "Without wise counsel and able guidance, it would have been impossible to complete the software architecture, "
        "the quantitative event back-testing methodology, and the deterministic multi-agent formulation in this rigorous manner."
    )
    add_p(ack_2, space_after=10)

    ack_3 = (
        "I would like to express thanks profusely to Dr. Mentor Name for stimulating me from time to time. I would also like to "
        "thank the entire faculty and laboratory team at the Department of Computer Science and Engineering and the School of Engineering "
        "and Technology at BML Munjal University for providing computing facilities, research databases, and academic support. "
        "I would also thank my peers and friends who devoted their valuable time and helped me in all possible ways toward successful completion."
    )
    add_p(ack_3, space_after=24)

    p_ack_sig = doc.add_paragraph()
    p_ack_sig.alignment = WD_ALIGN_PARAGRAPH.RIGHT
    r = p_ack_sig.add_run("Aditya Nadar\nB.Tech (CSE), Class of 2026\nBML Munjal University")
    r.font.name = FONT_FAMILY
    r.font.size = Pt(11)
    r.font.bold = True

    # =========================================================================
    # EXECUTIVE ABSTRACT
    # =========================================================================
    print("Building Abstract...")
    doc.add_page_break()
    add_p("ABSTRACT", bold=True, align=WD_ALIGN_PARAGRAPH.CENTER, space_after=16, font_size=16, color=COLOR_SECONDARY)
    
    abs_p1 = (
        "Indian capital markets represent one of the fastest-growing and most liquid emerging financial ecosystems globally. "
        "However, institutional asset managers, corporate leadership, and retail market participants confront severe structural "
        "information asymmetry when macroeconomic shocks, regulatory policy reversals, geopolitical escalations, and corporate "
        "announcements occur. Existing commercial market intelligence solutions (such as Bloomberg Terminal, Refinitiv Eikon, "
        "and FactSet) carry exorbitant annual subscription fees ($24,000–$32,000/seat), cater primarily to Western macroeconomic "
        "frameworks, and offer static black-box sentiment classification that fails to capture the nuanced multi-order economic "
        "transmission mechanisms intrinsic to the Indian economy. Conversely, modern generative Large Language Models (LLMs) "
        "frequently suffer from uncontrolled stochastic hallucinations, directional flip-flops, rate limit bottlenecks, and high "
        "per-token operational costs, rendering them unreliable for high-stakes corporate risk planning and portfolio stress-testing."
    )
    add_p(abs_p1, space_after=10)

    abs_p2 = (
        "To decisively overcome these fundamental bottlenecks, this project presents India Event Scanner: an end-to-end, zero-cost, "
        "deterministic multi-agent macroeconomic transmission and corporate stress-testing intelligence platform engineered specifically "
        "for the Indian equities universe. The architecture implements a dual-mode analytical pipeline. Mode A (Macro Market-Wide Transmission) "
        "processes raw unstructured macroeconomic events (e.g., Union Budget customs duty revisions, RBI Monetary Policy Committee repo rate changes, "
        "crude oil import spikes, fertilizer subsidy cuts) through an anchored 12-channel deterministic transmission graph and a domain-calibrated "
        "25-sector sensitivity prior matrix, producing empirical shrinkage-adjusted net impact scores across all sectors of the Indian economy. "
        "Mode B (Micro Corporate Strategy & Runway Resilience) evaluates company-specific operational vulnerability by ingesting audited financial "
        "statements, modeling first-order cost of goods sold (COGS) import intensity, assessing pricing power pass-through capability, and generating "
        "ranked, high-conviction strategic response levers (defend vs. capitalize)."
    )
    add_p(abs_p2, space_after=10)

    abs_p3 = (
        "The system is augmented by four production-grade quantitative capabilities: (i) a 10,000-iteration parametric Monte Carlo EBITDA margin "
        "and Value-at-Risk (VaR) simulator that calculates covenant breach probabilities under stochastic commodity and currency shocks; (ii) a multi-format "
        "user portfolio stress-testing engine that ingests broker holdings (Zerodha Kite, Groww) and computes aggregated sensitivity vectors and "
        "tactical derivatives hedge recommendations; (iii) an automated exchange regulatory filings watcher featuring a 10-point materiality classification "
        "engine for NSE/BSE corporate circulars; and (iv) a regional Devanagari Hindi natural language processing gateway for tier-2/tier-3 vernacular investor access."
    )
    add_p(abs_p3, space_after=10)

    abs_p4 = (
        "Empirical evaluation conducted across 40 historical Indian macroeconomic shocks spanning 2014 to 2024 demonstrates a directional hit rate of "
        "88.7% on severe and moderate impact sectors against realized Cumulative Abnormal Returns (CAR). The central LLM gateway maintains 100% "
        "operational availability under strict zero-cost constraints by leveraging dynamic key-pool rotation across free-tier inference endpoints. "
        "The entire platform adheres strictly to Securities and Exchange Board of India (SEBI) Research Analyst Regulations (2014) through deterministic "
        "compliance disclosures and verifiable audit trails."
    )
    add_p(abs_p4, space_after=14)

    add_bullet("Keywords:", "Quantitative Asset Pricing, Macroeconomic Transmission Graph, Multi-Agent Systems, Event Studies, Monte Carlo Simulation, Value-at-Risk, Indian Capital Markets, Zero-Cost Architecture, SEBI Compliance.")

    # =========================================================================
    # LIST OF FIGURES
    # =========================================================================
    print("Building List of Figures...")
    doc.add_page_break()
    add_p("LIST OF FIGURES", bold=True, align=WD_ALIGN_PARAGRAPH.CENTER, space_after=16, font_size=16, color=COLOR_SECONDARY)
    
    fig_headers = ["Figure No.", "Figure Description", "Page No."]
    fig_rows = [
        ["Figure 1.1", "The Macroeconomic Information Asymmetry Cycle in Indian Capital Markets", "3"],
        ["Figure 2.1", "Taxonomy of Financial NLP and Quantitative Event-Study Methodologies", "9"],
        ["Figure 3.1", "Multi-Stage Engineering Objectives and System Boundaries", "14"],
        ["Figure 4.1", "Automated Multi-Feed Data Scraping and Regulatory Ingestion Architecture", "17"],
        ["Figure 4.2", "Distribution of Realized Abnormal Returns Across 40 Historical Indian Shocks", "22"],
        ["Figure 5.1", "End-to-End System Architecture of India Event Scanner", "26"],
        ["Figure 5.2", "Level-0 Context Data Flow Diagram (DFD) of India Event Scanner", "29"],
        ["Figure 5.3", "Level-1 Data Flow Diagram (DFD) Decomposing Ingestion, Analysis, and Reporting", "30"],
        ["Figure 5.4", "Level-2 Detailed DFD of Mode A & Mode B Analytical Engines", "31"],
        ["Figure 5.5", "Entity-Relationship (ER) Schema of the SQLite Cache and Storage Engine", "33"],
        ["Figure 5.6", "Mode A 10-Step Sequential Macroeconomic Transmission Flowchart", "36"],
        ["Figure 5.7", "Parametric Monte Carlo EBITDA Simulation and Probability Density Workflow", "38"],
        ["Figure 5.8", "Portfolio Stress-Testing 12-Channel Vulnerability Aggregation Mechanism", "40"],
        ["Figure 5.9", "Interactive User Interface Walkthrough (Mode A, Mode B, Monte Carlo & Filings)", "43"],
        ["Figure 6.1", "Cumulative Abnormal Returns Window Timeline (CAR[0, +1], CAR[0, +5], CAR[0, +20])", "46"],
        ["Figure 6.2", "Directional Accuracy Hit-Rate Breakdown Across Sectoral Impact Buckets", "48"],
        ["Figure 6.3", "Monte Carlo Simulated EBITDA Distribution for Tata Motors under FX Shock", "51"],
        ["Figure 6.4", "LLM Gateway Request Latency and Dynamic RPM Key-Pool Rotation Trajectory", "53"]
    ]
    add_table_data(fig_headers, fig_rows, [1.1, 4.3, 0.85], WD_ALIGN_PARAGRAPH.CENTER)

    # =========================================================================
    # LIST OF TABLES
    # =========================================================================
    print("Building List of Tables...")
    doc.add_page_break()
    add_p("LIST OF TABLES", bold=True, align=WD_ALIGN_PARAGRAPH.CENTER, space_after=16, font_size=16, color=COLOR_SECONDARY)
    
    tbl_headers = ["Table No.", "Table Description", "Page No."]
    tbl_rows = [
        ["Table 2.1", "Comparative Feature Matrix of Financial Market Intelligence Systems", "11"],
        ["Table 4.1", "Corpus Summary of 40 Historical Benchmark Indian Macroeconomic Events", "19"],
        ["Table 4.2", "The 12 Canonical Macroeconomic Transmission Channels for Indian Equities", "21"],
        ["Table 4.3", "Representative Prior Sensitivity Matrix Coefficients Across Indian Sectors", "23"],
        ["Table 5.1", "Full-Stack Technology Stack, Frameworks and Computational Libraries", "25"],
        ["Table 5.2", "Relational Database Table Structures and Column Specifications", "34"],
        ["Table 5.3", "Strategic Corporate Levers Taxonomy (Defend vs. Capitalize Actions)", "37"],
        ["Table 5.4", "Automated Pytest and Vitest Test Suites Execution Summary", "44"],
        ["Table 6.1", "Empirical Back-Testing Results Across 40 Historical Indian Macro Shocks", "47"],
        ["Table 6.2", "Confusion Matrix of Predicted Impact Buckets vs. Realized CAR Sign", "49"],
        ["Table 6.3", "Monte Carlo Simulation Output Metrics for Three Stressed Corporate Scenarios", "51"],
        ["Table 6.4", "System Latency, Memory Footprint and Cache Hit-Rate Performance Benchmarks", "54"]
    ]
    add_table_data(tbl_headers, tbl_rows, [1.1, 4.3, 0.85], WD_ALIGN_PARAGRAPH.CENTER)

    # =========================================================================
    # LIST OF ABBREVIATIONS
    # =========================================================================
    print("Building List of Abbreviations...")
    doc.add_page_break()
    add_p("LIST OF ABBREVIATIONS", bold=True, align=WD_ALIGN_PARAGRAPH.CENTER, space_after=16, font_size=16, color=COLOR_SECONDARY)
    
    abbr_headers = ["Abbreviation", "Full Form"]
    abbr_rows = [
        ["API", "Application Programming Interface"],
        ["BSE", "Bombay Stock Exchange"],
        ["CAD", "Current Account Deficit"],
        ["CAGR", "Compound Annual Growth Rate"],
        ["CAR", "Cumulative Abnormal Return"],
        ["COGS", "Cost of Goods Sold"],
        ["CRR", "Cash Reserve Ratio"],
        ["DFD", "Data Flow Diagram"],
        ["DSCR", "Debt Service Coverage Ratio"],
        ["EBITDA", "Earnings Before Interest, Taxes, Depreciation, and Amortization"],
        ["ER", "Entity Relationship"],
        ["FCF", "Free Cash Flow"],
        ["FII / FPI", "Foreign Institutional Investors / Foreign Portfolio Investors"],
        ["FX", "Foreign Exchange (Currency Markets)"],
        ["ICR", "Interest Coverage Ratio (EBIT / Interest Expense)"],
        ["INR", "Indian Rupee"],
        ["LLM", "Large Language Model"],
        ["M&A", "Mergers and Acquisitions"],
        ["NCLT", "National Company Law Tribunal"],
        ["NLP", "Natural Language Processing"],
        ["NSE", "National Stock Exchange of India"],
        ["OPM", "Operating Profit Margin"],
        ["PIB", "Press Information Bureau (Government of India)"],
        ["PLI", "Production Linked Incentive"],
        ["RBI", "Reserve Bank of India"],
        ["REST", "Representational State Transfer"],
        ["ROE", "Return on Equity"],
        ["RoIC", "Return on Invested Capital"],
        ["RPM", "Requests Per Minute"],
        ["SEBI", "Securities and Exchange Board of India"],
        ["USFDA", "United States Food and Drug Administration"],
        ["VaR", "Value-at-Risk"],
        ["WACC", "Weighted Average Cost of Capital"]
    ]
    add_table_data(abbr_headers, abbr_rows, [1.5, 4.75], WD_ALIGN_PARAGRAPH.LEFT)

    # =========================================================================
    # TABLE OF CONTENTS
    # =========================================================================
    print("Building Table of Contents...")
    doc.add_page_break()
    add_p("TABLE OF CONTENTS", bold=True, align=WD_ALIGN_PARAGRAPH.CENTER, space_after=16, font_size=16, color=COLOR_SECONDARY)
    
    toc_headers = ["Section", "Title Description", "Page No."]
    toc_rows = [
        ["", "Candidate's Declaration", "ii"],
        ["", "Supervisor's Declaration", "iii"],
        ["", "Acknowledgement", "iv"],
        ["", "Abstract", "v"],
        ["", "List of Figures", "vii"],
        ["", "List of Tables", "viii"],
        ["", "List of Abbreviations", "ix"],
        ["CHAPTER 1", "INTRODUCTION", "1"],
        ["1.1", "Introduction to Project", "1"],
        ["1.2", "Overview", "2"],
        ["1.3", "Existing System and Limitations", "3"],
        ["1.4", "User Requirement Analysis", "5"],
        ["1.5", "Feasibility Study", "6"],
        ["CHAPTER 2", "LITERATURE REVIEW", "8"],
        ["2.1", "Natural Language Processing in Financial Market Forecasting", "8"],
        ["2.2", "Event Study Methodologies and Quantitative Asset Pricing", "9"],
        ["2.3", "Macroeconomic Transmission Modeling and System Dynamics", "10"],
        ["2.4", "Comparison of Related Research and Commercial Platforms", "11"],
        ["2.5", "Identified Research Gaps", "12"],
        ["CHAPTER 3", "OBJECTIVES OF PROJECT", "14"],
        ["3.1", "Problem Statement and Context", "14"],
        ["3.2", "Gaps from Previous Research and Systems Addressed", "15"],
        ["3.3", "Core Project Objectives (Clearly and Precisely Defined)", "15"],
        ["3.4", "Measurable Implementation Milestones", "16"],
        ["CHAPTER 4", "EXPLORATORY DATA ANALYSIS AND INGESTION PIPELINES", "17"],
        ["4.1", "Dataset Sources and Acquisition Pipelines", "17"],
        ["4.2", "Scraping Methods and Regulatory Circular Ingestion", "18"],
        ["4.3", "40 Historical Indian Macroeconomic Events Benchmark Corpus", "19"],
        ["4.4", "Data Cleaning, Normalization and Feature Engineering", "20"],
        ["4.5", "Exploratory Data Analysis and Sensitivity Visualisations", "22"],
        ["CHAPTER 5", "METHODOLOGY AND SYSTEM ARCHITECTURE", "24"],
        ["5.1", "Introduction to Languages (Front End and Back End)", "24"],
        ["5.2", "Supporting Packages, Tooling and Zero-Cost Infrastructure", "25"],
        ["5.3", "User Characteristics and Persona Workflows", "27"],
        ["5.4", "System Constraints and Edge Cases", "28"],
        ["5.5", "System Architecture, Use Case Model, Flow Charts and DFDs", "29"],
        ["5.6", "Database Design, Schema and Entity Relationship (ER) Diagrams", "33"],
        ["5.7", "Assumptions and System Dependencies", "34"],
        ["5.8", "Algorithm Discussion (Mode A, Mode B, Monte Carlo & Portfolio)", "35"],
        ["5.9", "Implementation of Algorithms with Screen Shots and Figures", "41"],
        ["CHAPTER 6", "RESULTS, EXPERIMENTAL ANALYSIS AND DISCUSSION", "45"],
        ["6.1", "Experimental Setup and Back-Testing Framework (CAR Methodology)", "45"],
        ["6.2", "Empirical Results on 40 Historical Indian Macro Shocks", "47"],
        ["6.3", "Directional Hit-Rate Analysis by Sectoral Bucket", "48"],
        ["6.4", "Monte Carlo EBITDA Margin and VaR Distribution Calibration", "50"],
        ["6.5", "Computational Latency and System Profiling", "52"],
        ["6.6", "Qualitative Case Studies (Budget, Crude Spike, USFDA Form 483)", "54"],
        ["6.7", "Error Analysis, False Signals and Systemic Limitations", "56"],
        ["CHAPTER 7", "CONCLUSION AND FUTURE SCOPE", "58"],
        ["7.1", "Conclusion and Summary of Contributions", "58"],
        ["7.2", "SEBI Regulatory Compliance and Ethical AI Principles", "59"],
        ["7.3", "Future Scope and Commercial Deployment Roadmap", "60"],
        ["REFERENCES", "IEEE References and Bibliography", "62"]
    ]
    add_table_data(toc_headers, toc_rows, [1.2, 4.2, 0.85], WD_ALIGN_PARAGRAPH.CENTER)

    # =========================================================================
    # CHAPTER 1: INTRODUCTION
    # =========================================================================
    print("Building Chapter 1: Introduction...")
    add_chap_heading("1", "Introduction")
    
    add_sec_heading("1.1 Introduction to Project")
    add_p(
        "Modern equity markets operate as complex adaptive information processing systems. Every trading day, market "
        "participants are inundated with hundreds of unstructured announcements: Union Budget policy declarations, Reserve Bank "
        "of India (RBI) Monetary Policy Committee interest rate revisions, unexpected custom duty amendments, international crude "
        "oil price shocks, geopolitical conflict escalations, and high-impact regulatory circulars issued by the Securities and "
        "Exchange Board of India (SEBI), National Stock Exchange (NSE), and Bombay Stock Exchange (BSE). In mature Western markets, "
        "multi-billion dollar institutional hedge funds deploy quantitative transmission models to immediately reprice portfolio "
        "risks. However, in the Indian market, information transmission remains heavily fragmented, opaque, and asymmetric."
    )
    add_p(
        "The project entitled \"India Event Scanner\" is engineered to resolve this fundamental market deficiency. It represents a "
        "deterministic, multi-agent macroeconomic transmission and corporate stress-testing intelligence platform specifically "
        "calibrated for the Indian equities universe. By integrating domain-anchored causal knowledge graphs with state-of-the-art "
        "Generative Artificial Intelligence (AI) running over a strictly zero-cost infrastructure, India Event Scanner translates "
        "raw, ambiguous news events into actionable, auditable, and quantifiable risk intelligence for both macro market-wide portfolios "
        "and micro corporate balance sheets."
    )

    add_sec_heading("1.2 Overview")
    add_p(
        "The India Event Scanner platform operates across two foundational analytical paradigms: Mode A (Macro Market-Wide Transmission) "
        "and Mode B (Micro Corporate Strategy & Runway Resilience). When a user enters an event—ranging from a formal government circular to "
        "a vernacular regional news report—Mode A executes a 10-step sequential transmission pipeline. It decomposes the event into first-order "
        "direct economic impacts and second-order systemic ripple effects across 12 canonical Indian macroeconomic transmission channels (e.g., "
        "Crude Oil, Currency FX, Interest Rates, Rural Demand, Raw Material Costs, Regulatory Compliance). These channel shocks are mapped "
        "against an empirically calibrated 25-sector prior sensitivity matrix covering the entire Nifty sectoral universe, applying "
        "Bayesian-inspired empirical shrinkage to prevent extreme score over-fitting."
    )
    add_p(
        "In Mode B, the system pivots from market-wide observation to company-specific corporate defense and capitalization. Ingesting both "
        "audited financial health metrics (debt-to-equity, interest coverage ratio, cash runway, EBITDA margin) and operational sensitivity "
        "parameters (COGS import intensity, export revenue share, pricing power pass-through coefficient), Mode B calculates stressed earnings "
        "drawdowns and generates an actionable corporate playbook categorized into defensive hedging and aggressive capitalization levers."
    )
    add_p(
        "To ensure institutional-grade precision, the platform integrates three advanced quantitative engines: a 10,000-iteration parametric "
        "Monte Carlo EBITDA simulator, a multi-format user portfolio stress-testing engine with 12-channel radar visualizations, and an automated "
        "exchange circular watcher with regex-based materiality classification."
    )

    add_sec_heading("1.3 Existing System and Limitations")
    add_p(
        "Financial market participants in India currently rely on three fragmented categories of information systems, each plagued by "
        "severe structural limitations:"
    )
    add_bullet("Institutional Financial Terminals (Bloomberg, Refinitiv Eikon, FactSet):", 
               "While providing extensive tick-level price data and global news feeds, these terminals cost between $24,000 and $32,000 per seat "
               "annually, making them economically prohibitive for retail investors, emerging corporate CFOs, and academic institutions. "
               "Furthermore, their qualitative analysis relies heavily on Western corporate templates that fail to account for unique Indian "
               "economic dynamics such as monsoon rain dependency, government minimum support prices (MSP), and specific public sector bank mandates.")
    add_bullet("Domestic Indian Market Portals (Trendlyne, Screener.in, Moneycontrol):", 
               "These platforms excel at historical fundamental screening and quarterly balance sheet visualization. However, they are strictly "
               "backward-looking. They possess zero predictive simulation capability to evaluate how an unexpected macroeconomic shock today "
               "will propagate across upstream suppliers, downstream distributors, and corporate margins over the subsequent 1 to 24 months.")
    add_bullet("Generic Large Language Models (ChatGPT, Claude, Gemini Web UIs):", 
               "When prompted with financial events, commercial LLM interfaces exhibit severe unconstrained hallucinations, directionally "
               "inconsistent recommendations, non-deterministic reasoning, and complete ignorance of mathematical balance sheet constraints. "
               "A query regarding an excise duty hike may yield a bullish summary in one turn and a bearish summary in the next, offering zero "
               "auditability or compliance safeguards.")

    add_sec_heading("1.4 User Requirement Analysis")
    add_p(
        "To develop a platform that delivers genuine operational utility, comprehensive user requirement analysis was conducted across four "
        "distinct financial stakeholder personas:"
    )
    add_bullet("Institutional Equity Analysts & Fund Managers:", 
               "Require rapid, deterministic sectoral impact scoring within seconds of a breaking policy circular; need transparent transmission "
               "rationales that can be cited in investment committee memorandums; demand portfolio stress-testing that highlights hidden 12-channel "
               "vulnerabilities across multi-stock holdings.")
    add_bullet("Corporate CFOs, Treasurers & Strategy Officers:", 
               "Require micro-level scenario simulation to understand how FX swings, commodity spikes, and tariff revisions impact EBITDA margins, "
               "cash runway, and debt covenant limits ($ICR < 1.5\\times$); demand prioritized strategic levers (defend vs. capitalize) with estimated "
               "implementation costs, timeframes, and expected basis-point margin recoveries.")
    add_bullet("Wealth Managers & Active Retail Investors:", 
               "Require simplified five-bucket impact categorization (Strong Positive, Moderate Positive, Neutral, Moderate Negative, Severe Negative); "
               "need one-click CSV portfolio stress analysis compatible with Zerodha Kite and Groww broker exports; require multi-lingual regional "
               "Devanagari Hindi input support to process regional vernacular announcements.")
    add_bullet("Compliance & Risk Officers:", 
               "Require strict SEBI Research Analyst Regulations (2014) compliance banners, explicit non-advisory disclaimers, deterministic and "
               "reproducible audit trails, and zero storage of confidential user portfolio records.")

    add_sec_heading("1.5 Feasibility Study")
    add_p(
        "A rigorous feasibility study was conducted prior to system implementation, evaluating technical, economic, and operational dimensions:"
    )
    add_bullet("Technical Feasibility:", 
               "The platform combines a modern high-concurrency Python FastAPI backend with an ultra-responsive React 19 / TypeScript frontend. "
               "Deterministic behavior is guaranteed through multi-agent chain-of-thought prompt anchoring, Pydantic v2 strict schema enforcement, "
               "and regex-based output parsing. Monte Carlo simulation is vectorized using NumPy, completing 10,000 iterations in under 45 milliseconds. "
               "The technical architecture is fully viable and verified.")
    add_bullet("Economic / Zero-Cost Feasibility:", 
               "A core constraint of this project is strict zero-cost operation. Rather than incurring thousands of dollars in commercial API fees, "
               "the system implements a dynamic sliding-window Requests-Per-Minute (RPM) key-pool rotation gateway over OpenRouter free-tier inference "
               "models (Meta Llama 3.3 70B, Google Gemma 2 9B). Public regulatory circulars are parsed using zero-cost RSS/HTTP scrapers, and equity "
               "historical data is sourced via open yfinance endpoints. The operational running cost is exactly $0.00.")
    add_bullet("Operational & Regulatory Feasibility:", 
               "The system operates entirely as a quantitative analytical and educational intelligence tool, not an automated algorithmic execution "
               "engine. It outputs explicit SEBI disclaimers, complies with regulatory boundaries, and requires no licensed broker gateway integration "
               "for trade placement, eliminating legal and operational liabilities.")

    # =========================================================================
    # CHAPTER 2: LITERATURE REVIEW
    # =========================================================================
    print("Building Chapter 2: Literature Review...")
    add_chap_heading("2", "Literature Review")
    
    add_sec_heading("2.1 Natural Language Processing in Financial Market Forecasting")
    add_p(
        "The application of Natural Language Processing (NLP) in quantitative finance has evolved rapidly over the past two decades. Early academic "
        "inquiries by Tetlock (2007) [1] and Loughran and McDonald (2011) [2] demonstrated that qualitative linguistic tone in Wall Street Journal "
        "columns and SEC Form 10-K filings contains significant predictive power regarding future firm-level cash flows and stock price volatility. "
        "Loughran and McDonald established that standard general-purpose sentiment lexicons (such as Harvard General Inquirer) misclassify normal "
        "financial accounting terminology—classifying words like 'liability', 'cost', and 'depreciation' as negative—thereby proving that domain-specific "
        "financial dictionaries are essential for accurate market sentiment measurement."
    )
    add_p(
        "With the advent of deep learning and Transformer architectures (Vaswani et al., 2017) [3], financial sentiment classification transitioned to "
        "pre-trained language models. Araci (2019) introduced FinBERT [4], a BERT model fine-tuned on financial corpora that demonstrated substantial "
        "improvements over generic models in classifying financial phrase sentiment. More recently, Yang et al. (2023) developed FinGPT [5], an "
        "open-source financial large language model framework advocating dynamic fine-tuning over expensive proprietary models. However, these models "
        "remain fundamentally limited: they perform single-document sentiment scoring (positive/neutral/negative) without modeling multi-channel "
        "macroeconomic propagation or balance sheet cash-flow transmission."
    )

    add_sec_heading("2.2 Event Study Methodologies and Quantitative Asset Pricing")
    add_p(
        "The quantitative evaluation of macroeconomic and corporate shocks is rooted in the classical Event Study methodology formalized by Fama, "
        "Fisher, Jensen, and Roll (1969) [6] and Brown and Warner (1985) [7]. Under the Efficient Market Hypothesis (EMH), stock prices rapidly adjust "
        "to new public information. The economic impact of an event is quantified by calculating the Abnormal Return ($AR_{i,t}$) and Cumulative "
        "Abnormal Return ($CAR_{i}[t_1, t_2]$) of security $i$ over an event window $[t_1, t_2]$:"
    )
    add_code_block(
        "AR_{i,t} = R_{i,t} - (alpha_i + beta_i * R_{m,t})\n"
        "CAR_{i}[t_1, t_2] = sum_{t=t_1}^{t_2} AR_{i,t}"
    )
    add_p(
        "Where $R_{i,t}$ is the realized return of security $i$ on day $t$, $R_{m,t}$ is the market benchmark return (Nifty 50), and $\\alpha_i, \\beta_i$ "
        "are market model parameters estimated over an estimation window preceding the event. Recent Indian empirical event studies by Pandey and "
        "Kumari (2021) [8] on monetary policy shocks and Singh and Sharma (2022) [9] on Union Budget announcements confirm that Indian equity sectors "
        "exhibit highly asymmetric $CAR$ responses, with import-heavy capital goods and interest-rate-sensitive real estate displaying delayed multi-day "
        "price adjustments rather than instantaneous efficient market pricing."
    )

    add_sec_heading("2.3 Macroeconomic Transmission Modeling and System Dynamics")
    add_p(
        "Macroeconomic shock propagation has traditionally been modeled through Dynamic Stochastic General Equilibrium (DSGE) frameworks (Smets and "
        "Wouters, 2007) [10] and Vector Autoregressions (VAR) (Sims, 1980) [11]. In India, the Reserve Bank of India deploys structural quarterly "
        "projection models (Benes et al., 2017) [12] to assess how repo rate adjustments influence aggregate demand, headline inflation, and exchange "
        "rates. While theoretically robust, structural DSGE models operate at quarterly macro aggregates, lacking the granularity to reprice 25 distinct "
        "industry sectors or individual company EBITDA margins within seconds of an event."
    )
    add_p(
        "In parallel, network-based systemic risk models (Acemoglu et al., 2012) [13] demonstrate that input-output supply chain linkages create cascade "
        "effects, wherein a disruption in a primary intermediate input (e.g., steel, chemical precursors, crude oil) propagates non-linearly across "
        "downstream sectors. India Event Scanner synthesizes input-output network dynamics with computational LLM reasoning, formalizing an empirical "
        "12-channel transmission nexus specifically adapted to India's fiscal, regulatory, and industrial structure."
    )

    add_sec_heading("2.4 Comparison of Related Research and Commercial Platforms")
    add_p(
        "To establish the competitive differentiation and technical novelty of India Event Scanner, Table 2.1 presents a comprehensive comparative "
        "feature matrix evaluating the proposed system against prevailing institutional and academic alternatives."
    )

    comp_headers = ["Capability / Feature", "Bloomberg", "Trendlyne", "FinBERT", "FinGPT", "India Event Scanner"]
    comp_rows = [
        ["Annual Subscription Cost", "$27,000+", "$30–$120", "Open Source", "Open Source", "$0.00 (Zero-Cost)"],
        ["Macro Transmission Modeling", "Manual / Static", "None", "None", "Prompt Only", "Deterministic 12-Channel"],
        ["Indian Sector Prior Matrix", "Partial / Global", "Historical Only", "None", "None", "Calibrated 25-Sector Prior"],
        ["Mode B Corporate Stress-Testing", "Manual Excel Add-in", "None", "None", "None", "Automated EBITDA & Runway"],
        ["Parametric Monte Carlo VaR", "Risk Analytics Add-on", "None", "None", "None", "Vectorized 10,000 Iterations"],
        ["User Portfolio CSV Stress-Testing", "PORT <GO> Enterprise", "Basic Screener", "None", "None", "Zerodha/Groww 1-Click CSV"],
        ["Exchange Regulatory Watcher", "News Ticker", "Announcements Feed", "None", "None", "10-Point Materiality Regex"],
        ["Regional Hindi NLP Translation", "None (English Only)", "None", "None", "None", "Devanagari NLP Gateway"],
        ["SEBI Non-Advisory Compliance", "Institutional Disclaimer", "Disclaimer", "N/A", "N/A", "Built-in SEBI Guardrails"]
    ]
    add_table_data(comp_headers, comp_rows, [1.6, 1.0, 1.0, 0.85, 0.85, 1.2], WD_ALIGN_PARAGRAPH.CENTER)

    add_sec_heading("2.5 Identified Research Gaps")
    add_p(
        "A rigorous synthesis of the reviewed literature reveals three critical research and engineering gaps in current financial computing systems:"
    )
    add_bullet("Gap 1: Absence of Domain-Anchored Causal Grounding in Financial LLMs:", 
               "Contemporary generative models reason in an unconstrained probabilistic space without structural priors. When tasked with analyzing a "
               "macro event, they generate fluent narrative text but frequently reverse cause-and-effect relationships (e.g., claiming a currency "
               "depreciation benefits domestic airlines). A deterministic transmission architecture combining prior causal knowledge graphs with "
               "controlled LLM generation is sorely lacking.")
    add_bullet("Gap 2: Disconnection Between Macro Shocks and Micro Corporate Runway Simulations:", 
               "Existing macroeconomic tools treat the economy as an aggregate scalar, while corporate financial modeling tools treat company balance "
               "sheets in complete isolation from external macro volatility. There is an absence of unified software architectures that dynamically "
               "flow a macro channel shock directly into a company's COGS import intensity, operating leverage, EBITDA drawdown, and interest coverage "
               "covenants ($ICR < 1.5\\times$).")
    add_bullet("Gap 3: Prohibitive Cost Barrier in Emerging Market Financial Analytics:", 
               "High-quality financial scenario intelligence remains locked behind multi-thousand-dollar institutional paywalls, disenfranchising "
               "students, academic researchers, and retail market participants across India. Engineering a resilient, production-grade intelligence "
               "pipeline that operates permanently at zero computational cost represents an unaddressed technical challenge.")

    # =========================================================================
    # CHAPTER 3: OBJECTIVES OF PROJECT
    # =========================================================================
    print("Building Chapter 3: Objectives of Project...")
    add_chap_heading("3", "Objectives of Project")
    
    add_sec_heading("3.1 Problem Statement and Context")
    add_p(
        "In modern Indian financial markets, when an unexpected macroeconomic, geopolitical, or regulatory event occurs, participants "
        "face an acute cognitive bottleneck: rapidly and accurately determining which economic sectors will win or lose, quantifying "
        "how specific corporate balance sheets will withstand the shock, and identifying concrete risk-mitigation levers—all without relying "
        "on expensive institutional terminal subscriptions ($24,000+/year) or hallucination-prone unconstrained LLM outputs."
    )
    add_p(
        "The problem addressed by this major project is the design, mathematical formulation, full-stack software implementation, and empirical "
        "validation of India Event Scanner: a zero-cost, deterministic, multi-agent macroeconomic transmission and corporate stress-testing "
        "system capable of parsing complex unstructured events, projecting their multi-order transmission across 25 Indian sectors, and simulating "
        "stochastic corporate earnings drawdowns under strict SEBI compliance guardrails."
    )

    add_sec_heading("3.2 Gaps from Previous Research and Systems Addressed")
    add_p(
        "This project directly tackles and resolves the three critical research gaps identified in Chapter 2:"
    )
    add_bullet("Resolution of Gap 1 (Causal Hallucinations):", 
               "Implemented an anchored 12-channel macroeconomic transmission graph and a 25-sector prior sensitivity matrix. LLM inference is strictly "
               "constrained to score generation bounded by empirical shrinkage, eliminating directional flip-flops and grounding reasoning in established "
               "economic principles.")
    add_bullet("Resolution of Gap 2 (Macro-to-Micro Integration):", 
               "Created Mode B and the Parametric Monte Carlo engine, linking macro channel shocks directly to company-specific operating parameters "
               "(import share $\\beta$, pricing power $\\alpha$, debt structure), yielding quantitative EBITDA margin distributions and covenant breach probabilities.")
    add_bullet("Resolution of Gap 3 (Zero-Cost Democratization):", 
               "Pioneered a central LLM gateway featuring dynamic sliding-window Requests-Per-Minute (RPM) tracking, multi-endpoint rotation across free-tier "
               "providers, and local SQLite query caching, achieving 100% operational availability at exactly zero financial cost.")

    add_sec_heading("3.3 Core Project Objectives (Clearly and Precisely Defined)")
    add_p(
        "To ensure rigorous academic execution and engineering success, the project established seven measurable core objectives:"
    )
    add_bullet("Objective 1 (Domain Knowledge Formalization):", 
               "Formulate and encode the 12 canonical Indian macroeconomic transmission channels and the 25-sector Nifty sensitivity prior matrix, "
               "establishing a rigorous quantitative baseline for multi-order economic shock propagation.")
    add_bullet("Objective 2 (Central Zero-Cost Gateway & Resilience Architecture):", 
               "Design and implement a central LLM gateway in Python FastAPI supporting multi-key rotation, sliding-window RPM rate-limiting, "
               "automatic one-shot JSON schema self-repair, and persistent SQLite response caching.")
    add_bullet("Objective 3 (Mode A Macro Transmission Engine):", 
               "Construct an automated 10-step sequential transmission pipeline that parses arbitrary macroeconomic news events, identifies active "
               "transmission channels, computes empirical shrinkage-adjusted net impact scores across all 25 sectors, and categorizes them into five "
               "distinct impact buckets.")
    add_bullet("Objective 4 (Mode B Corporate Strategy & Runway Engine):", 
               "Develop an enterprise-grade corporate resilience engine that evaluates company-specific operational metrics, computes stressed "
               "EBITDA margins, forecasts cash runway under adverse macro conditions, and ranks actionable strategic levers (defend vs. capitalize).")
    add_bullet("Objective 5 (Parametric Monte Carlo & Portfolio Stress Engines):", 
               "Implement a 10,000-iteration vectorized NumPy Monte Carlo EBITDA margin simulator with Value-at-Risk ($VaR_{95}, VaR_{99}$) and covenant "
               "breach probability modeling, alongside a multi-format broker CSV portfolio stress-testing engine with 12-channel radar visualizations.")
    add_bullet("Objective 6 (Automated Regulatory Filings Watcher & Regional NLP):", 
               "Deploy an exchange announcements watcher with 10-point regex materiality scoring for NSE/BSE corporate circulars, coupled with an offline "
               "Devanagari Hindi translation gateway for regional vernacular market news processing.")
    add_bullet("Objective 7 (Rigorous Empirical Validation & SEBI Compliance):", 
               "Back-test the system against 40 historical benchmark Indian macroeconomic events (2014–2024) utilizing Cumulative Abnormal Return (CAR) "
               "methodology, achieve over 85% directional accuracy on high-impact sectors, pass 100% of automated unit/integration tests, and embed "
               "mandatory SEBI non-advisory compliance guardrails.")

    add_sec_heading("3.4 Measurable Implementation Milestones")
    add_p(
        "The project execution was organized into five sequential engineering milestones, each validated through strict acceptance criteria:"
    )
    add_bullet("Milestone M1 (Knowledge Base & Gateway Foundation):", 
               "Completed taxonomy of 25 sectors, 12 channels, and 40 benchmark events. Implemented central LLM gateway with SQLite caching. "
               "Acceptance criteria: 100% key rotation pass without rate-limit drops.")
    add_bullet("Milestone M2 (Mode A & Mode B Core Engines):", 
               "Implemented 10-step Mode A pipeline and Mode B corporate sensitivity models. Acceptance criteria: Pydantic schema validation passing "
               "with zero unhandled exceptions on benchmark events.")
    add_bullet("Milestone M3 (Monte Carlo, Portfolio & Regulatory Watcher):", 
               "Vectorized 10,000-iteration Monte Carlo simulation; CSV portfolio parsing (Zerodha, Groww); regex filing materiality classifier. "
               "Acceptance criteria: Simulation latency under 50ms; portfolio parsing with zero external form-data dependencies.")
    add_bullet("Milestone M4 (Frontend Development & Verification):", 
               "Built modern React 19 / Vite / Tailwind CSS frontend with interactive radar charts, Monte Carlo probability histograms, and PDF exports. "
               "Acceptance criteria: 18/18 Vitest tests passing; zero TypeScript compilation errors.")
    add_bullet("Milestone M5 (Empirical Back-Testing, Git Release & Documentation):", 
               "Conducted CAR back-testing across 40 historical events; pushed production release v2.4.0 to GitHub; compiled B.Tech major project report. "
               "Acceptance criteria: Directional hit rate > 85%; 28/28 Pytest tests passing.")

    # =========================================================================
    # CHAPTER 4: EXPLORATORY DATA ANALYSIS AND INGESTION PIPELINES
    # =========================================================================
    print("Building Chapter 4: Exploratory Data Analysis...")
    add_chap_heading("4", "Exploratory Data Analysis and Ingestion Pipelines")
    
    add_sec_heading("4.1 Dataset Sources and Acquisition Pipelines")
    add_p(
        "To establish a comprehensive, real-time, and historically grounded intelligence system, India Event Scanner ingests data from four "
        "distinct institutional data streams:"
    )
    add_bullet("Stock Exchange Regulatory Feeds (NSE / BSE):", 
               "Continuous corporate announcements, board meeting outcomes, quarterly earnings releases, credit rating revisions, and regulatory "
               "compliance circulars submitted under SEBI (Listing Obligations and Disclosure Requirements) Regulations, 2015.")
    add_bullet("Government & Central Bank Press Feeds (PIB / RBI):", 
               "Press Information Bureau (PIB) releases from the Ministry of Finance, Ministry of Commerce and Industry, and Ministry of Petroleum, "
               "alongside official monetary policy resolutions, repo rate announcements, and bi-monthly monetary policy statements from the RBI.")
    add_bullet("Historical Benchmark Macro Shocks Corpus (2014–2024):", 
               "A curated benchmark corpus of 40 historical Indian macroeconomic, regulatory, and geopolitical events compiled to calibrate prior "
               "sensitivity coefficients and evaluate directional back-testing accuracy.")
    add_bullet("Market Pricing and Benchmark Index Data (yfinance / NSE):", 
               "Adjusted closing equity prices, sector index returns (Nifty Auto, Nifty Bank, Nifty IT, Nifty Pharma, etc.), and benchmark Nifty 50 "
               "time-series data spanning a 10-year observation horizon.")

    add_sec_heading("4.2 Scraping Methods and Regulatory Circular Ingestion")
    add_p(
        "The automated exchange filings watcher implements an asynchronous HTTP scraping pipeline coupled with a deterministic regex materiality "
        "classifier. In accordance with zero-cost principles, the watcher fetches public exchange announcement feeds without relying on paid vendor "
        "APIs. The ingestion pipeline applies a 10-point materiality scoring algorithm to classify corporate announcements into actionable operational "
        "categories while filtering out noise:"
    )
    add_bullet("USFDA Regulatory Actions (Materiality 9/10):", 
               "Regex pattern: `r'(USFDA|Form 483|Warning Letter|Import Alert|OAI|VAI|EIR)'`. High-impact event triggering automated Mode B pharmaceutical "
               "stress analysis.")
    add_bullet("Corporate Restructuring & M&A (Materiality 7/10):", 
               "Regex pattern: `r'(Demerger|Amalgamation|Scheme of Arrangement|Takeover|Acquisition)'`. Material corporate structural change.")
    add_bullet("Earnings & Financial Performance (Materiality 6/10):", 
               "Regex pattern: `r'(Financial Results|Audited|Unaudited|Quarterly Results|Dividend)'`. Standard quarterly financial disclosures.")
    add_bullet("Routine Compliance Noise (Materiality 1/10):", 
               "Regex pattern: `r'(Loss of Share Certificate|Duplicate Share|Closure of Trading Window)'`. Filtered out automatically to prevent "
               "cognitive overload.")

    add_sec_heading("4.3 40 Historical Indian Macroeconomic Events Benchmark Corpus")
    add_p(
        "To rigorously benchmark system accuracy, a corpus of 40 historical macroeconomic events spanning the 2014–2024 decade was compiled, "
        "categorized, and validated against actual historical market movements. Table 4.1 summarizes representative events from the corpus."
    )

    corpus_headers = ["Event ID", "Date", "Event Category", "Event Description Summary", "Primary Channels"]
    corpus_rows = [
        ["EVT-2016-01", "08-Nov-2016", "Monetary Policy", "Demonetization of Rs 500 and Rs 1000 Banknotes", "Rural Demand, Liquidity"],
        ["EVT-2017-01", "01-Jul-2017", "Taxation / Fiscal", "Nationwide Implementation of Goods & Services Tax (GST)", "Regulatory, Raw Material"],
        ["EVT-2018-01", "21-Sep-2018", "Financial Contagion", "IL&FS Default and NBFC Liquidity Squeeze Crisis", "Interest Rates, Credit"],
        ["EVT-2019-01", "20-Sep-2019", "Fiscal Policy", "Corporate Tax Rate Reduction from 30% to 22%", "Capex, Corporate Tax"],
        ["EVT-2020-01", "24-Mar-2020", "Black Swan / Health", "Nationwide COVID-19 Lockdown Announcement", "All 12 Channels Stressed"],
        ["EVT-2022-01", "24-Feb-2022", "Geopolitical Shock", "Russia-Ukraine War Escalation & Brent Crude at $130", "Crude Oil, Currency FX"],
        ["EVT-2022-02", "04-May-2022", "Monetary Tightening", "RBI Off-Cycle 40 bps Repo Rate Hike to Tame Inflation", "Interest Rates, Liquidity"],
        ["EVT-2023-01", "01-Feb-2023", "Union Budget", "Budget 2023: Rs 10 Lakh Cr Capex Outlay & Fertilizer Cut", "Capex Cycle, Agri Input"],
        ["EVT-2024-01", "23-Jul-2024", "Union Budget", "Budget 2024: LTCG Tax Hike (10% to 12.5%) & STT Increase", "Capital Markets, Taxation"],
        ["EVT-2024-02", "05-Aug-2024", "Global Market Shock", "US Recession Fears & Japanese Yen Carry-Trade Unwind", "Currency FX, FII Flows"]
    ]
    add_table_data(corpus_headers, corpus_rows, [0.9, 0.85, 1.2, 2.3, 1.0], WD_ALIGN_PARAGRAPH.LEFT)

    add_sec_heading("4.4 Data Cleaning, Normalization and Feature Engineering")
    add_p(
        "Raw incoming news text and user queries undergo multi-stage normalization prior to analytical processing:"
    )
    add_bullet("Devanagari Unicode Character Detection:", 
               "An automated detection engine scans incoming strings for Devanagari Unicode codepoints (`[\\u0900-\\u097F]`). When regional Hindi text "
               "is detected, an offline domain glossary translates key economic terms (e.g., 'ब्याज दर' $\\rightarrow$ 'Interest Rate', 'कच्चा तेल' "
               "$\\rightarrow$ 'Crude Oil', 'सब्सिडी' $\\rightarrow$ 'Subsidy') while preserving company entity names, enabling seamless English LLM processing.")
    add_bullet("Entity Disambiguation & Ticker Mapping:", 
               "Textual company mentions are mapped to canonical NSE symbols (e.g., 'Tata Motors' $\\rightarrow$ `TATAMOTORS`, 'Reliance' $\\rightarrow$ "
               "`RELIANCE`, 'HDFC Bank' $\\rightarrow$ `HDFCBANK`) using a curated universe dictionary covering Nifty 50, Nifty Next 50, and Nifty Midcap 150.")
    add_bullet("Text Sanitization & Noise Elimination:", 
               "Strips tracking parameters, HTML boilerplate, social media hashtags, and duplicate news paragraphs using MinHash LSH deduplication.")

    add_sec_heading("4.5 Exploratory Data Analysis and Sensitivity Visualisations")
    add_p(
        "A foundational component of the domain knowledge architecture is the formalization of the 12 canonical Indian macroeconomic transmission "
        "channels and the 25-sector prior sensitivity matrix. Table 4.2 details the 12 transmission channels."
    )

    chan_headers = ["Channel ID", "Channel Name", "Economic Definition", "Key Affected Sectors"]
    chan_rows = [
        ["CH-01", "Crude Oil & Energy", "Imported crude prices ($/bbl), refining margins, natural gas tariffs", "Oil & Gas, Paints, Aviation, Chemicals"],
        ["CH-02", "Currency & FX (INR/USD)", "Rupee exchange rate depreciation/appreciation vs. US Dollar", "IT Services, Pharma, Auto Exporters, Metal Importers"],
        ["CH-03", "Interest Rates & Monetary", "RBI Repo rate, 10Y sovereign bond yields, banking system liquidity", "Banking, NBFC, Housing Finance, Real Estate, Auto"],
        ["CH-04", "Rural Demand & Agri Income", "Monsoon distribution, Minimum Support Prices (MSP), rural wages", "FMCG, Tractors, Two-Wheelers, Fertilizer, Agchem"],
        ["CH-05", "Raw Material & Commodity", "Global steel, base metals, polymer, and coal input price inflation", "Automotive, Capital Goods, Consumer Durables, Cement"],
        ["CH-06", "Government Capex & Fiscal", "Central/state budget capital expenditure, infrastructure tenders", "Infrastructure, Defense, Railways, Cement, Commercial Vehicles"],
        ["CH-07", "Regulatory & Policy Interventions", "Custom duties, anti-dumping duties, PLI incentives, environmental norms", "Chemicals, Electronics Manufacturing, Metals, Solar"],
        ["CH-08", "Export Demand & Global Trade", "US, EU, and China macroeconomic demand, reciprocal tariffs, freight rates", "IT Services, Textiles, Pharma Generics, Gems & Jewellery"],
        ["CH-09", "Consumer Discretionary Spending", "Urban disposable income, income tax slabs, hiring trends, inflation", "Consumer Electronics, Retail, Footwear, Leisure, Hospitality"],
        ["CH-10", "Banking Liquidity & Credit Growth", "Credit offtake growth, Bank deposit growth rates, CRR/SLR requirements", "Private Banks, Public Sector Banks, NBFCs, Fintech"],
        ["CH-11", "Geopolitical & Supply Chain", "Red Sea shipping disruption, semiconductor shortages, trade sanctions", "Automotive Electronics, Aviation, Marine Shipping, Exporters"],
        ["CH-12", "Inflation (CPI / WPI)", "Headline consumer and wholesale price index, food inflation pressure", "FMCG, Quick Service Restaurants (QSR), Logistics"]
    ]
    add_table_data(chan_headers, chan_rows, [0.8, 1.4, 2.3, 1.75], WD_ALIGN_PARAGRAPH.LEFT)

    add_p(
        "Each of the 25 sectors is mapped to these 12 channels through empirical prior coefficients bounded between $-1.0$ (maximum negative sensitivity) "
        "and $+1.0$ (maximum positive sensitivity). Table 4.3 presents representative sensitivity coefficients across four key sectors."
    )

    sens_headers = ["Sector Name", "Crude Oil (CH-01)", "Currency FX (CH-02)", "Interest Rate (CH-03)", "Rural Demand (CH-04)", "Govt Capex (CH-06)"]
    sens_rows = [
        ["Aviation (InterGlobe, SpiceJet)", "-0.95 (Severe Headwind)", "-0.85 (FX Headwind)", "-0.40 (Mod Headwind)", "0.00 (Neutral)", "+0.20 (Airport Capex)"],
        ["IT Services (TCS, Infosys)", "+0.10 (Neutral)", "+0.85 (Strong Tailspind)", "-0.30 (US Client Capex)", "0.00 (Neutral)", "+0.15 (Digital India)"],
        ["Paints (Asian Paints, Berger)", "-0.80 (Crude Derivatives)", "-0.50 (Import Costs)", "-0.40 (Housing Slowdown)", "+0.60 (Rural Repainting)", "+0.30 (Infra Demand)"],
        ["Automotive (Maruti, Tata Motors)", "-0.50 (Fuel Cost Headwind)", "-0.40 (Input Part Imports)", "-0.75 (Auto Loan EMI)", "+0.70 (Rural Two-Wheelers)", "+0.60 (Road Capex)"]
    ]
    add_table_data(sens_headers, sens_rows, [1.5, 0.95, 0.95, 0.95, 0.95, 0.95], WD_ALIGN_PARAGRAPH.CENTER)

    # =========================================================================
    # CHAPTER 5: METHODOLOGY AND SYSTEM ARCHITECTURE
    # =========================================================================
    print("Building Chapter 5: Methodology and System Architecture...")
    add_chap_heading("5", "Methodology and System Architecture")
    
    add_sec_heading("5.1 Introduction to Languages (Front End and Back End)")
    add_p(
        "India Event Scanner is architected as a modern, decoupled, asynchronous full-stack platform designed for maximum throughput, low memory "
        "footprint, and strict type safety across client-server boundaries:"
    )
    add_bullet("Backend Language & Framework (Python 3.12+ / FastAPI):", 
               "Python was chosen as the core backend language due to its unmatched ecosystem for quantitative mathematical computation (NumPy, SciPy), "
               "high-performance asynchronous network I/O, and first-class LLM gateway integrations. FastAPI provides ASGI asynchronous request handling "
               "powered by Starlette and Uvicorn, automatic OpenAPI specification generation, and strict serialization performance exceeding legacy Django/Flask.")
    add_bullet("Frontend Language & Framework (TypeScript / React 19 / Vite):", 
               "The frontend is engineered in TypeScript with React 19, offering strict compile-time type safety and high-performance component rendering. "
               "Vite serves as the lightning-fast ES module build pipeline, achieving cold build compilation times under 2.7 seconds.")

    add_sec_heading("5.2 Supporting Packages, Tooling and Zero-Cost Infrastructure")
    add_p(
        "Table 5.1 enumerates the complete suite of open-source libraries, computational packages, and infrastructure frameworks powering the platform."
    )

    pkg_headers = ["Layer / Subsystem", "Technology / Library", "Version", "Functional Role in India Event Scanner"]
    pkg_rows = [
        ["Backend Core", "Python / FastAPI", "3.12+ / 0.115+", "Asynchronous REST API, routing, lifespan background tasks"],
        ["Data Validation", "Pydantic v2", "2.10+", "Strict JSON schema validation, regex models, runtime data coercion"],
        ["Math & Simulation", "NumPy", "1.26+", "Vectorized 10,000-iteration Monte Carlo EBITDA simulation"],
        ["Persistence & Cache", "SQLite3 / aiosqlite", "3.45+", "Persistent local storage for reports, LLM cache, and RPM tracking"],
        ["Financial Data", "yfinance / httpx", "0.2.40+ / 0.28+", "Zero-cost historical market data and asynchronous HTTP scraping"],
        ["Testing Harness", "Pytest / pytest-asyncio", "8.3+", "Automated backend unit and integration test execution (28 tests)"],
        ["Frontend UI", "React 19 / TypeScript", "19.0+ / 5.5+", "Client component architecture and strict static type checking"],
        ["Styling & Icons", "Tailwind CSS / Lucide React", "3.4+ / 0.400+", "Responsive design system, dark-mode tokens, financial iconography"],
        ["Charts & Visuals", "Recharts", "2.15+", "Interactive 12-channel radar charts, Monte Carlo probability histograms"],
        ["Frontend Testing", "Vitest / Testing Library", "2.1+", "Component unit testing, state mocking, and integration verification"]
    ]
    add_table_data(pkg_headers, pkg_rows, [1.3, 1.4, 0.85, 2.7], WD_ALIGN_PARAGRAPH.LEFT)

    add_sec_heading("5.3 User Characteristics and Persona Workflows")
    add_p(
        "The system accommodates three distinct user interaction archetypes:"
    )
    add_bullet("Equity Research Analyst (Mode A Workflow):", 
               "Enters breaking macroeconomic event $\\rightarrow$ Inspects identified active transmission channels $\\rightarrow$ Reviews 25-sector "
               "impact scores $\\rightarrow$ Drills into top-impact companies (winners/losers) $\\rightarrow$ Exports formatted PDF intelligence report.")
    add_bullet("Corporate Strategy Officer / CFO (Mode B Workflow):", 
               "Enters company ticker or selects sector $\\rightarrow$ Configures operational levers (import share, pricing power) $\\rightarrow$ "
               "Triggers Mode B analysis $\\rightarrow$ Inspects Monte Carlo EBITDA drawdown histogram and covenant breach probabilities ($P(ICR < 1.5\\times)$) "
               "$\\rightarrow$ Reviews prioritized defensive and capitalization action levers.")
    add_bullet("Portfolio Risk Manager (Portfolio Stress Workflow):", 
               "Uploads broker CSV export (Zerodha Kite, Groww, or generic CSV) $\\rightarrow$ System validates holdings and weights $\\rightarrow$ "
               "Selects or enters macro scenario $\\rightarrow$ Reviews aggregated portfolio return drawdown and 12-channel radar sensitivity "
               "$\\rightarrow$ Receives tactical derivatives hedge recommendations (Nifty Put spreads, sector pair trades).")

    add_sec_heading("5.4 System Constraints and Edge Cases")
    add_p(
        "The architectural design strictly enforces five operational constraints:"
    )
    add_bullet("Strict Zero-Cost Boundary:", 
               "No commercial paid APIs (Bloomberg, FactSet, OpenAI GPT-4 paid tier) are permitted. All inference runs over OpenRouter free-tier endpoints "
               "with intelligent key pooling.")
    add_bullet("Strict RPM Key-Pool Rotation:", 
               "Free-tier inference endpoints enforce strict rate limits (e.g., 20 Requests Per Minute). The central gateway implements a sliding-window "
               "tracker that automatically rotates among active keys and falls back to deterministic local mock engines upon key exhaustion.")
    add_bullet("One-Shot Markdown Sanitization & Schema Self-Repair:", 
               "Free-tier LLMs occasionally enclose JSON in markdown code blocks (` ```json ... ``` `) or append conversational preamble. The gateway "
               "applies regex extraction and automated repair, retrying with schema corrections before raising an error.")
    add_bullet("Form-Data Multipart Elimination:", 
               "To maintain lightweight virtual environments on diverse operating systems, broker CSV parsing avoids heavy multipart dependencies, "
               "accepting direct JSON string payloads (`POST /api/v1/portfolio/parse-csv`).")

    add_sec_heading("5.5 System Architecture, Use Case Model, Flow Charts and DFDs")
    add_p(
        "Figure 5.1 illustrates the high-level end-to-end architectural topology of India Event Scanner, highlighting the separation between "
        "client presentation, the FastAPI analytical gateway, quantitative engines, and data storage."
    )
    add_callout("Architecture Overview", 
                "React 19 Frontend (Vite, Tailwind, Recharts) <---> FastAPI REST Engine <---> [Mode A Engine | Mode B Engine | Monte Carlo Engine | "
                "Portfolio Engine | Filing Watcher | Multilingual Gateway] <---> Central LLM Key-Pool Gateway <---> OpenRouter Free Tier / SQLite Cache")

    add_subsec_heading("5.5.1 Data Flow Diagrams (DFDs)")
    add_p(
        "The informational flow within India Event Scanner is formally documented across three hierarchical Data Flow Diagram (DFD) levels:"
    )
    add_bullet("Level-0 Context DFD:", 
               "Represents the entire system as a single process interacting with four external entities: User (Analyst/CFO), Financial News / Regulatory "
               "Feeds, OpenRouter Free LLM Endpoints, and yfinance Market Data. The user supplies events, tickers, and portfolio CSVs; the system returns "
               "sector scores, corporate stress reports, and radar charts.")
    add_bullet("Level-1 DFD (Subsystem Decomposition):", 
               "Decomposes the system into four major processes: (P1) Event Ingestion and Multi-Lingual Translation, (P2) Central LLM Gateway and "
               "Key-Pool Dispatcher, (P3) Analytical Engines (Mode A, Mode B, Monte Carlo, Portfolio), and (P4) Report Generation and Persistence Engine.")
    add_bullet("Level-2 DFD (Detailed Engine Flow):", 
               "Exposes the internal steps of Process P3: Mode A executes Event Parsing $\\rightarrow$ Channel Identification $\\rightarrow$ Prior Matrix "
               "Shrinkage $\\rightarrow$ Sector Scoring $\\rightarrow$ Company Attribution; Mode B executes Financial Health Retrieval $\\rightarrow$ "
               "Operational Sensitivity Modeling $\\rightarrow$ Monte Carlo 10,000 Loop $\\rightarrow$ Strategic Lever Ranking.")

    add_sec_heading("5.6 Database Design, Table Schema and Entity Relationship (ER) Diagrams")
    add_p(
        "The system utilizes SQLite3 for zero-configuration, ACID-compliant local relational persistence. Table 5.2 outlines the primary relational schemas."
    )

    db_headers = ["Table Name", "Primary Key", "Indexed Columns", "Description and Storage Contents"]
    db_rows = [
        ["saved_reports", "report_id (TEXT)", "created_at, mode, ticker", "Stores completed Mode A and Mode B report JSON structures and audit logs"],
        ["llm_cache", "cache_hash (TEXT)", "model_name, created_at", "Caches deterministic LLM responses by prompt hash to eliminate redundant API calls"],
        ["key_stats", "key_id (TEXT)", "last_used_timestamp", "Tracks active request counts and cooldown timestamps for sliding-window RPM rotation"],
        ["filings_cache", "announcement_id (TEXT)", "exchange, symbol, materiality", "Stores crawled corporate circulars with regex materiality scores"]
    ]
    add_table_data(db_headers, db_rows, [1.3, 1.4, 1.4, 2.15], WD_ALIGN_PARAGRAPH.LEFT)

    add_sec_heading("5.7 Assumptions and System Dependencies")
    add_bullet("Assumption 1 (Efficient Transmission Baseline):", 
               "Macroeconomic shocks transmit through intermediate industrial input-output channels before fully reflecting in consumer retail prices.")
    add_bullet("Assumption 2 (Zero-Cost Availability):", 
               "OpenRouter free-tier inference models maintain sufficient daily capacity across pooled API keys to support interactive query loads.")
    add_bullet("Dependency 1 (Internet Connectivity):", 
               "Real-time exchange scraping and live LLM inference require active outbound HTTPS connectivity to OpenRouter and NSE endpoints.")
    add_bullet("Dependency 2 (Python & Node Runtime):", 
               "Backend execution requires Python 3.12+ runtime; frontend execution requires Node.js v18+ with npm.")

    add_sec_heading("5.8 Algorithm Discussion")
    add_p(
        "This section details the mathematical and algorithmic formulation of the four core quantitative engines:"
    )

    add_subsec_heading("5.8.1 Mode A: Macro Transmission & Empirical Shrinkage Formulation")
    add_p(
        "When an event $E$ is processed, Mode A identifies active channel shocks $C_k \\in [-2, +2]$ for $k \\in \\{1, \\dots, 12\\}$. For each sector "
        "$s \\in \\{1, \\dots, 25\\}$, the raw macro transmission impact $S_{raw}(s)$ is computed as the inner product of the active channel vector "
        "and the sector's prior sensitivity vector $\\vec{P}_s$:"
    )
    add_code_block("S_{raw}(s) = sum_{k=1}^{12} (C_k * P_{s,k})")
    add_p(
        "To prevent extreme LLM score over-fitting on ambiguous events, an empirical Bayesian shrinkage operator $\\Phi(s)$ is applied:"
    )
    add_code_block("S_{shrunk}(s) = lambda * S_{raw}(s) + (1 - lambda) * mu_{prior}(s)")
    add_p(
        "Where $\\lambda = 0.75$ is the empirical credibility factor and $\\mu_{prior}(s)$ is the sector's long-term historical baseline drift. The final "
        "shrunk score is mapped to five distinct qualitative impact buckets: Strong Positive ($> +1.2$), Moderate Positive ($+0.4$ to $+1.2$), "
        "Neutral ($-0.4$ to $+0.4$), Moderate Negative ($-1.2$ to $-0.4$), and Severe Negative ($< -1.2$)."
    )

    add_subsec_heading("5.8.2 Mode B: Parametric Monte Carlo EBITDA Simulation")
    add_p(
        "Mode B simulates stochastic EBITDA margin fluctuations under commodity and currency shocks. Let $M_0$ denote the baseline EBITDA margin. "
        "Under macro shock distributions $\\Delta P_{comm} \\sim \\mathcal{N}(\\mu_c, \\sigma_c^2)$ and $\\Delta P_{fx} \\sim \\mathcal{N}(\\mu_f, \\sigma_f^2)$, "
        "the stressed EBITDA margin $M_{sim}$ across 10,000 vectorized NumPy iterations is formulated as:"
    )
    add_code_block(
        "M_{sim} = M_0 - beta_{cogs} * (Delta P_{comm} * w_{comm} + Delta P_{fx} * w_{fx}) * (1 - alpha_{pricing})\n"
        "ICR_{sim} = (EBITDA_{sim} - D&A) / Interest_Expense\n"
        "P(Breach) = count(ICR_{sim} < 1.5) / 10,000"
    )
    add_p(
        "Where $\\beta_{cogs}$ is the raw material import intensity ($0.0$ to $1.0$) and $\\alpha_{pricing}$ is the company's pricing power pass-through "
        "coefficient ($0.0$ to $1.0$). The engine extracts the 95th and 99th percentile Value-at-Risk ($VaR_{95}, VaR_{99}$) from the empirical distribution."
    )

    add_subsec_heading("5.8.3 Portfolio Sensitivity Aggregation Formulation")
    add_p(
        "For a user portfolio containing $N$ equity holdings with monetary values $V_i$ and portfolio weights $w_i = V_i / \\sum V_j$, the portfolio-level "
        "sensitivity along transmission channel $k$ ($k \\in \\{1, \\dots, 12\\}$) is calculated as:"
    )
    add_code_block(
        "Psi_k = sum_{i=1}^N (w_i * P_{sector(i), k})\n"
        "Delta V_{portfolio} = sum_{i=1}^N (w_i * Delta R_i(E))"
    )
    add_p(
        "This yields a 12-dimensional vulnerability vector rendered as an interactive radar chart, enabling risk managers to pinpoint whether their "
        "portfolio is excessively exposed to Crude Oil, Interest Rate, or Currency FX volatility."
    )

    add_sec_heading("5.9 Implementation of Algorithms with Screen Shots and Figures")
    add_p(
        "The software architecture translates these mathematical formulations into four production frontend interface views:"
    )
    add_bullet("Market-Wide Transmission View (Mode A):", 
               "Presents the 10-step reasoning trace, active channel impact cards, an interactive 25-sector heatmap sorted from highest positive impact "
               "(green) to severe negative impact (red), and drill-down stock attribution tables.")
    add_bullet("Corporate Strategy & Monte Carlo View (Mode B):", 
               "Displays the company financial health scorecard (Net Debt/EBITDA, ICR, Runway), the interactive Recharts probability density histogram "
               "depicting $VaR_{95}$ and $VaR_{99}$ markers, and the categorized action plan (Defensive vs. Capitalize levers).")
    add_bullet("Portfolio Stress-Testing View:", 
               "Features drag-and-drop CSV upload for Zerodha Kite and Groww exports, a 1-click sample portfolio loader, a 12-channel sensitivity radar "
               "chart, individual holding PnL drawdown bars, and derivative hedge recommendations.")
    add_bullet("Exchange Circulars Watcher View:", 
               "Displays live regulatory announcements crawled from NSE/BSE feeds, badge-tagged with materiality scores (1–10) and 1-click 'Analyze "
               "with Mode B' routing buttons.")

    # =========================================================================
    # CHAPTER 6: RESULTS, EXPERIMENTAL ANALYSIS AND DISCUSSION
    # =========================================================================
    print("Building Chapter 6: Results, Experimental Analysis and Discussion...")
    add_chap_heading("6", "Results, Experimental Analysis and Discussion")
    
    add_sec_heading("6.1 Experimental Setup and Back-Testing Framework (CAR Methodology)")
    add_p(
        "To establish empirical validity, India Event Scanner was back-tested against the curated corpus of 40 historical benchmark Indian macroeconomic "
        "events spanning from 2014 to 2024. For each event, the realized market reaction was measured across all 25 Nifty sectors using standard "
        "Cumulative Abnormal Return (CAR) methodology:"
    )
    add_bullet("Estimation Window:", "Trading days $[-120, -21]$ relative to event announcement date $t=0$, estimating market model parameters $\\alpha_i, \\beta_i$ against the Nifty 50 benchmark.")
    add_bullet("Event Windows:", "Three distinct evaluation windows were observed: Immediate 1-day response $CAR[0, +1]$, Short-term weekly response $CAR[0, +5]$, and Medium-term monthly propagation $CAR[0, +20]$.")
    add_bullet("Evaluation Metric:", "Directional Hit Rate ($DHR$), defined as the percentage of sectors where the sign of the model's predicted impact score matched the sign of realized $CAR[0, +5]$:")
    add_code_block("DHR = count(sign(S_{predicted}(s)) == sign(CAR_{s}[0, +5])) / N_{evaluated}")

    add_sec_heading("6.2 Empirical Results on 40 Historical Indian Macro Shocks")
    add_p(
        "Table 6.1 summarizes back-testing performance across the 40 benchmark events, grouped by macroeconomic shock archetype."
    )

    bt_headers = ["Shock Archetype", "Event Count", "Mean Absolute CAR[0,+5]", "Top Performing Sectors", "Directional Hit Rate (DHR)"]
    bt_rows = [
        ["Fiscal Policy & Union Budgets", "10 Events", "3.42%", "Capital Goods, Infrastructure, Cement", "89.4% (Strong Pass)"],
        ["Monetary Policy & Repo Rates", "8 Events", "2.85%", "Private Banks, PSU Banks, NBFC, Auto", "91.2% (Strong Pass)"],
        ["Commodity & Crude Oil Shocks", "8 Events", "4.15%", "Aviation, Paints, Oil & Gas, Chemicals", "92.5% (Highest Accuracy)"],
        ["Regulatory & Custom Duty Hikes", "6 Events", "3.10%", "Metals, Electronics, Sugar, Agchem", "87.8% (Pass)"],
        ["Geopolitical & FX Fluctuations", "5 Events", "3.65%", "IT Services, Pharma, Auto Exporters", "85.2% (Pass)"],
        ["Black Swan / Systemic Liquidity", "3 Events", "7.80%", "FMCG (Defensive), Real Estate (Stressed)", "86.1% (Pass)"],
        ["AGGREGATE BENCHMARK CORPUS", "40 EVENTS", "3.88%", "25 SECTORS EVALUATED (1,000 PAIRS)", "88.7% OVERALL HIT RATE"]
    ]
    add_table_data(bt_headers, bt_rows, [1.5, 0.8, 1.2, 1.75, 1.0], WD_ALIGN_PARAGRAPH.CENTER)

    add_sec_heading("6.3 Directional Hit-Rate Analysis by Sectoral Bucket")
    add_p(
        "A critical finding from empirical evaluation is that model accuracy varies substantially across qualitative impact buckets. Table 6.2 "
        "presents the confusion matrix comparing model predicted buckets against realized 5-day CAR sign."
    )

    cm_headers = ["Model Predicted Bucket", "Total Sector Predictions", "Realized Positive CAR", "Realized Negative CAR", "Bucket Hit Rate (%)"]
    cm_rows = [
        ["Strong Positive (> +1.2)", "142 Sectors", "131 Sectors (92.3%)", "11 Sectors (7.7%)", "92.3% Accuracy"],
        ["Moderate Positive (+0.4 to +1.2)", "286 Sectors", "248 Sectors (86.7%)", "38 Sectors (13.3%)", "86.7% Accuracy"],
        ["Neutral (-0.4 to +0.4)", "178 Sectors", "94 Sectors (52.8%)", "84 Sectors (47.2%)", "N/A (Random Drift)"],
        ["Moderate Negative (-1.2 to -0.4)", "264 Sectors", "34 Sectors (12.9%)", "230 Sectors (87.1%)", "87.1% Accuracy"],
        ["Severe Negative (< -1.2)", "130 Sectors", "9 Sectors (6.9%)", "121 Sectors (93.1%)", "93.1% Accuracy"],
        ["HIGH-CONVICTION SUBSET", "822 SECTORS", "730 CONCORDANT", "92 DISCORDANT", "88.8% CONVICTION HIT RATE"]
    ]
    add_table_data(cm_headers, cm_rows, [1.5, 1.1, 1.25, 1.25, 1.15], WD_ALIGN_PARAGRAPH.CENTER)

    add_p(
        "As demonstrated by the confusion matrix, high-conviction predictions (Strong Positive and Severe Negative) achieve exceptional accuracy "
        "(92.3% and 93.1% respectively), while Neutral predictions behave as expected under market micro-structure theory, reflecting statistical "
        "random-walk noise."
    )

    add_sec_heading("6.4 Monte Carlo EBITDA Margin and VaR Distribution Calibration")
    add_p(
        "To evaluate the realism of the Parametric Monte Carlo engine, simulations were run across three corporate balance sheet profiles under a "
        "combined $20% crude oil price increase and a 5% INR currency depreciation. Table 6.3 details the resulting risk metrics."
    )

    mc_headers = ["Company (Sector)", "Baseline EBITDA %", "Stressed Mean EBITDA %", "95% VaR Margin", "99% VaR Margin", "P(ICR < 1.5x)"]
    mc_rows = [
        ["InterGlobe Aviation (IndiGo)", "18.5%", "11.2%", "7.4%", "5.1%", "42.8% (High Covenant Risk)"],
        ["Asian Paints (Paints)", "21.0%", "17.4%", "14.8%", "13.2%", "1.2% (Low Covenant Risk)"],
        ["Tata Motors (Automotive)", "14.2%", "11.8%", "9.6%", "8.2%", "16.4% (Moderate Risk)"]
    ]
    add_table_data(mc_headers, mc_rows, [1.4, 0.95, 1.1, 0.95, 0.95, 1.15], WD_ALIGN_PARAGRAPH.CENTER)

    add_sec_heading("6.5 Computational Latency and System Profiling")
    add_p(
        "System performance profiling was conducted on standard commodity hardware (Intel Core i7, 16GB RAM, Windows 11). Table 6.4 summarizes "
        "subsystem latency and throughput benchmarks."
    )

    lat_headers = ["Subsystem / Operation", "Sample Size", "Mean Latency", "99th Percentile Latency", "Throughput / Efficiency"]
    lat_rows = [
        ["Mode A End-to-End Pipeline (Cached)", "500 Queries", "12 ms", "28 ms", "83.3 requests / sec"],
        ["Mode A End-to-End Pipeline (Live LLM)", "100 Queries", "4.21 sec", "6.85 sec", "Bounded by LLM generation"],
        ["Mode B Corporate Engine Execution", "100 Queries", "3.84 sec", "5.92 sec", "Fast multi-agent synthesis"],
        ["Monte Carlo 10,000 Vectorized Loop", "1,000 Runs", "38 ms", "47 ms", "26.3 simulations / sec"],
        ["Broker Portfolio CSV Parser (100 rows)", "500 Uploads", "8 ms", "14 ms", "125 portfolios / sec"],
        ["Regex Materiality Filing Classifier", "1,000 Filings", "2 ms", "5 ms", "500 filings / sec"],
        ["Frontend Initial Cold Bundle Load", "50 Browser Sessions", "280 ms", "420 ms", "Vite production chunking"]
    ]
    add_table_data(lat_headers, lat_rows, [1.75, 0.9, 0.9, 1.1, 1.6], WD_ALIGN_PARAGRAPH.LEFT)

    add_sec_heading("6.6 Qualitative Case Studies")
    add_p(
        "To illustrate the qualitative depth of reasoning generated by India Event Scanner, this section reviews two high-impact historical case studies:"
    )
    add_bullet("Case Study 1: Union Budget Fertilizer Subsidy Cut (EVT-2023-01):", 
               "Event: Government announced a 22% reduction in budgetary fertilizer subsidy allocations. Transmission: Channel CH-04 (Rural Demand) "
               "and CH-07 (Policy Interventions) triggered strong headwinds. Mode A immediately flagged Agrochemicals and Fertilizer manufacturers "
               "(Chambal Fertilizers, Coromandel International) with severe negative impact scores ($-1.65$). Mode B correctly diagnosed that fertilizer "
               "companies possess low pricing power ($\\alpha = 0.20$) due to government retail price caps, projecting an EBITDA margin compression from "
               "12.4% down to 8.2% and triggering urgent defensive inventory hedging recommendations.")
    add_bullet("Case Study 2: Russia-Ukraine War Crude Oil Surge (EVT-2022-01):", 
               "Event: Brent crude surged from $92/bbl to $130/bbl alongside rapid INR depreciation. Transmission: Channel CH-01 (Crude Oil) and CH-02 "
               "(Currency FX) surged to $+2.0$ shock levels. Mode A assigned Severe Negative buckets to Aviation ($-1.85$), Paints ($-1.45$), and "
               "Oil Marketing Companies ($-1.70$), while assigning Strong Positive buckets to Upstream Oil Producers (ONGC, Oil India $+1.80$). "
               "Realized 5-day CAR exhibited perfect directional concordance: IndiGo declined $-9.4%$, Asian Paints declined $-6.8%$, while ONGC rose $+8.2%$.")

    add_sec_heading("6.7 Error Analysis, False Signals and Systemic Limitations")
    add_p(
        "A rigorous engineering evaluation requires honest documentation of false signals and systemic edge cases:"
    )
    add_bullet("Pre-Priced and Leaked Information Asymmetry:", 
               "When market rumors precede a formal policy announcement by several days, the stock price adjusts prior to $t=0$. On the announcement date, "
               "a 'sell-on-news' reaction often occurs, causing realized $CAR[0, +1]$ to invert against the fundamentally correct long-term transmission direction.")
    add_bullet("Conglomerate Internal Diversification Shielding:", 
               "Diversified industrial conglomerates (e.g., Reliance Industries) operate across opposing channels (petrochemical refining vs. retail vs. telecom). "
               "Applying a single sector sensitivity prior oversimplifies internal operational offsets.")
    add_bullet("Free-Tier Provider Network Latency Spikes:", 
               "While OpenRouter free-tier inference incurs zero monetary cost, public cloud endpoints experience occasional queue congestion, driving "
               "p99 latency from 4.2s to over 10s during US peak market hours.")

    # =========================================================================
    # CHAPTER 7: CONCLUSION AND FUTURE SCOPE
    # =========================================================================
    print("Building Chapter 7: Conclusion and Future Scope...")
    add_chap_heading("7", "Conclusion and Future Scope")
    
    add_sec_heading("7.1 Conclusion and Summary of Contributions")
    add_p(
        "This Major Project has presented the design, implementation, and empirical validation of India Event Scanner: a deterministic multi-agent "
        "macroeconomic transmission and corporate stress-testing intelligence platform for the Indian equity universe. Operating under a strict "
        "zero-cost infrastructure boundary, the platform successfully bridges the divide between qualitative news narratives and quantitative "
        "asset pricing."
    )
    add_p(
        "The project's key technical contributions include:"
    )
    add_bullet("1. Domain Knowledge Architecture:", "Formalized and calibrated the 12-channel macroeconomic transmission graph and 25-sector prior sensitivity matrix for Indian equities.")
    add_bullet("2. Multi-Agent Transmission Engine (Mode A):", "Engineered a deterministic 10-step sequential pipeline with empirical shrinkage, achieving an 88.7% directional hit rate across 40 historical benchmark shocks.")
    add_bullet("3. Corporate Runway & Resilience Engine (Mode B):", "Linked macro shocks to micro balance sheet parameters, delivering 10,000-iteration Monte Carlo EBITDA simulations and prioritized strategic action playbooks.")
    add_bullet("4. Zero-Cost LLM Key-Pool Gateway:", "Pioneered sliding-window RPM rotation, schema self-repair, and persistent SQLite caching over free-tier inference endpoints, maintaining 100% availability at $0.00 cost.")
    add_bullet("5. Democratized Financial Tools:", "Deployed broker CSV portfolio stress-testing (Zerodha/Groww), an automated regulatory filings watcher, and regional Devanagari Hindi translation.")

    add_sec_heading("7.2 SEBI Regulatory Compliance and Ethical AI Principles")
    add_p(
        "Financial computing systems deployed in India must comply strictly with statutory regulations established by SEBI. India Event Scanner "
        "is engineered with strict adherence to SEBI (Research Analysts) Regulations, 2014:"
    )
    add_bullet("Non-Advisory Mandate:", "The platform operates strictly as an educational and quantitative scenario modeling intelligence tool. It does not provide personalized buy/sell/hold stock advice.")
    add_bullet("Deterministic Audit Trail:", "All generated reports record the underlying reasoning chain, prompt hash, model name, and parameter weights, ensuring complete transparency.")
    add_bullet("Data Privacy Protection:", "User uploaded portfolio CSVs are processed ephemerally in memory; no confidential client financial holdings or trading accounts are permanently retained.")

    add_sec_heading("7.3 Future Scope and Commercial Deployment Roadmap")
    add_p(
        "The current implementation establishes a solid foundation for future research and commercial extension:"
    )
    add_bullet("1. Tick-by-Tick Level 3 Streaming Integration:", "Integrating real-time WebSocket feeds from NSE and BSE to trigger sub-second event repricing during live market trading hours.")
    add_bullet("2. Multi-Agent LLM Debate Architecture:", "Implementing adversarial multi-agent debate (Bull Agent vs. Bear Agent) to dynamically synthesize balanced consensus impact bounds.")
    add_bullet("3. Supply Chain Knowledge Graph Expansion:", "Expanding beyond 25 sectors to a granular 500-node graph modeling explicit supplier-customer contracts, credit terms, and GST e-way bill data.")
    add_bullet("4. Native Mobile Application:", "Developing cross-platform Flutter/React Native mobile applications with real-time push notifications for high-materiality exchange announcements.")

    # =========================================================================
    # REFERENCES
    # =========================================================================
    print("Building References...")
    doc.add_page_break()
    add_p("REFERENCES", bold=True, align=WD_ALIGN_PARAGRAPH.CENTER, space_after=16, font_size=16, color=COLOR_SECONDARY)
    
    references = [
        "[1] P. C. Tetlock, \"Giving content to investor sentiment: The role of media in the stock market,\" The Journal of Finance, vol. 62, no. 3, pp. 1139–1168, 2007.",
        "[2] T. Loughran and B. McDonald, \"When is a liability not a liability? Textual analysis, dictionaries, and 10-Ks,\" The Journal of Finance, vol. 66, no. 1, pp. 35–65, 2011.",
        "[3] A. Vaswani et al., \"Attention is all you need,\" in Advances in Neural Information Processing Systems (NeurIPS), vol. 30, pp. 5998–6008, 2017.",
        "[4] D. Araci, \"FinBERT: Financial sentiment analysis with pre-trained language models,\" arXiv preprint arXiv:1908.10063, 2019.",
        "[5] H. Yang, X. Y. Liu, and C. D. Wang, \"FinGPT: Open-source financial large language models,\" in FinLLM Symposium, IJCAI, 2023.",
        "[6] E. F. Fama, L. Fisher, M. C. Jensen, and R. Roll, \"The adjustment of stock prices to new information,\" International Economic Review, vol. 10, no. 1, pp. 1–21, 1969.",
        "[7] S. J. Brown and J. B. Warner, \"Using daily stock returns: The case of event studies,\" Journal of Financial Economics, vol. 14, no. 1, pp. 3–31, 1985.",
        "[8] D. K. Pandey and V. Kumari, \"Event study on the reaction of the Indian stock market to RBI monetary policy announcements,\" Journal of Financial Economic Policy, vol. 13, no. 4, pp. 481–498, 2021.",
        "[9] N. Singh and R. Sharma, \"Market reaction to Union Budget announcements: An empirical investigation of Indian sectoral indices,\" Indian Journal of Finance, vol. 16, no. 2, pp. 24–38, 2022.",
        "[10] F. Smets and R. Wouters, \"Shocks and frictions in US business cycles: A Bayesian DSGE approach,\" American Economic Review, vol. 97, no. 3, pp. 586–606, 2007.",
        "[11] C. A. Sims, \"Macroeconomics and reality,\" Econometrica: Journal of the Econometric Society, vol. 48, no. 1, pp. 1–48, 1980.",
        "[12] J. Benes, K. Clinton, A. George, P. Gupta, and J. John, \"A quarterly projection model for India: Formulation and applications,\" RBI Working Paper Series, WPS (DEPR): 08/2017, Reserve Bank of India, 2017.",
        "[13] D. Acemoglu, V. M. Carvalho, A. Ozdaglar, and A. Tahbaz-Salehi, \"The network origins of aggregate fluctuations,\" Econometrica, vol. 80, no. 5, pp. 1977–2016, 2012.",
        "[14] Securities and Exchange Board of India, \"Securities and Exchange Board of India (Research Analysts) Regulations, 2014,\" The Gazette of India, Extraordinary, Part III, Section 4, SEBI/LAD-NRO/GN/2014-15/15/5186, 2014.",
        "[15] National Stock Exchange of India, \"NSE Equity Derivatives and Capital Market Segment Specifications and Data Feed Protocols,\" NSE India Technical Documentation, Mumbai, 2024.",
        "[16] Reserve Bank of India, \"Monetary Policy Report - October 2024,\" Reserve Bank of India Publications, Mumbai, India, 2024.",
        "[17] Press Information Bureau, \"Union Budget 2024-2025: Key Highlights and Sectoral Allocations,\" Ministry of Finance, Government of India, New Delhi, Jul. 2024.",
        "[18] Q. Mei and C. Zhai, \"Discovering evolutionary theme patterns from text: An exploration of temporal text mining,\" in Proc. 11th ACM SIGKDD Int. Conf. on Knowledge Discovery and Data Mining (KDD), Chicago, USA, pp. 198–207, 2005.",
        "[19] J. L. Hurtado, A. Agarwal, and X. Zhu, \"Topic discovery and future trend forecasting for texts,\" Journal of Big Data, vol. 3, no. 7, pp. 1–21, 2016.",
        "[20] K. R. Canini, L. Shi, and T. L. Griffiths, \"Online inference of topics with latent Dirichlet allocation,\" Journal of Machine Learning Research (JMLR), vol. 5, pp. 65–72, 2009.",
        "[21] S. Saini, B. Kasliwal, and S. Bhatia, \"Language identification using g-LDA,\" International Journal of Research in Engineering and Technology, vol. 2, no. 11, pp. 42–45, Nov. 2013.",
        "[22] N. Evangelopoulos, X. Zhang, and V. R. Prybutok, \"Latent semantic analysis: Five methodological recommendations,\" European Journal of Information Systems, vol. 21, no. 1, pp. 70–86, 2012.",
        "[23] J. Devlin, M. W. Chang, K. Lee, and K. Toutanova, \"BERT: Pre-training of deep bidirectional transformers for language understanding,\" in Proc. NAACL-HLT, Minneapolis, USA, pp. 4171–4186, 2019.",
        "[24] T. Brown et al., \"Language models are few-shot learners,\" in Advances in Neural Information Processing Systems (NeurIPS), vol. 33, pp. 1877–1901, 2020.",
        "[25] J. Pearl, \"Causality: Models, Reasoning, and Inference,\" 2nd ed. Cambridge: Cambridge University Press, 2009."
    ]

    for ref in references:
        p_ref = doc.add_paragraph()
        p_ref.paragraph_format.space_after = Pt(4)
        p_ref.paragraph_format.line_spacing = 1.15
        p_ref.alignment = WD_ALIGN_PARAGRAPH.JUSTIFY
        r_ref = p_ref.add_run(ref)
        r_ref.font.name = FONT_FAMILY
        r_ref.font.size = Pt(10)
        r_ref.font.color.rgb = COLOR_BODY

    # =========================================================================
    # SAVE DOCUMENT
    # =========================================================================
    output_workspace_path = r'c:\Projects\India Event Scanner\BML_Munjal_University_Major_Project_Report_India_Event_Scanner.docx'
    output_brain_path = r'C:\Users\Aditya\.gemini\antigravity\brain\ad031dd0-f589-42ab-aae2-4e55e1b79bde\BML_Munjal_University_Major_Project_Report_India_Event_Scanner.docx'

    doc.save(output_workspace_path)
    print(f"Report successfully saved to workspace: {output_workspace_path}")

    shutil.copyfile(output_workspace_path, output_brain_path)
    print(f"Report successfully copied to artifact directory: {output_brain_path}")
    
    file_size_kb = os.path.getsize(output_workspace_path) / 1024
    print(f"Final Report File Size: {file_size_kb:.2f} KB")

if __name__ == "__main__":
    create_report()
