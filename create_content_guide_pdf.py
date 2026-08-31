#!/usr/bin/env python3
"""
Generate a PDF guide for MetrologyAI SIH 2026 PPT content.
Includes all 8 sections with exact text, placement instructions,
and diagram/flowchart specifications.
"""

from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.colors import HexColor, black, white
from reportlab.lib.units import inch, cm
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle,
    PageBreak, HRFlowable, KeepTogether
)
from reportlab.lib.enums import TA_LEFT, TA_CENTER, TA_JUSTIFY

# Colors
NAVY = HexColor('#002B5C')
BLUE = HexColor('#0070C0')
GREEN = HexColor('#00A65A')
RED = HexColor('#CC0000')
ORANGE = HexColor('#FF8C00')
LIGHT_BLUE = HexColor('#D6EAF8')
LIGHT_GREEN = HexColor('#E8F5E9')
LIGHT_RED = HexColor('#FFEBEE')
LIGHT_ORANGE = HexColor('#FFF3E0')
DARK_GRAY = HexColor('#333333')
GRAY = HexColor('#666666')
SAFFRON = HexColor('#FF9933')

def create_pdf():
    doc = SimpleDocTemplate(
        "MetrologyAI_SIH_PPT_Content_Guide.pdf",
        pagesize=A4,
        rightMargin=1.5*cm,
        leftMargin=1.5*cm,
        topMargin=1.5*cm,
        bottomMargin=1.5*cm,
    )

    styles = getSampleStyleSheet()
    
    # Custom styles
    title_style = ParagraphStyle(
        'CustomTitle', parent=styles['Title'],
        fontSize=22, textColor=NAVY, spaceAfter=6,
        fontName='Helvetica-Bold'
    )
    subtitle_style = ParagraphStyle(
        'CustomSubtitle', parent=styles['Title'],
        fontSize=16, textColor=BLUE, spaceAfter=4,
        fontName='Helvetica-Bold'
    )
    heading_style = ParagraphStyle(
        'CustomHeading', parent=styles['Heading1'],
        fontSize=14, textColor=NAVY, spaceBefore=12, spaceAfter=6,
        fontName='Helvetica-Bold'
    )
    subheading_style = ParagraphStyle(
        'CustomSubHeading', parent=styles['Heading2'],
        fontSize=12, textColor=BLUE, spaceBefore=8, spaceAfter=4,
        fontName='Helvetica-Bold'
    )
    body_style = ParagraphStyle(
        'CustomBody', parent=styles['Normal'],
        fontSize=10, textColor=DARK_GRAY, spaceAfter=3,
        leading=14, fontName='Helvetica'
    )
    bullet_style = ParagraphStyle(
        'CustomBullet', parent=styles['Normal'],
        fontSize=10, textColor=DARK_GRAY, spaceAfter=2,
        leading=14, leftIndent=15, fontName='Helvetica'
    )
    instruction_style = ParagraphStyle(
        'Instruction', parent=styles['Normal'],
        fontSize=10, textColor=ORANGE, spaceAfter=4,
        leading=14, fontName='Helvetica-Bold',
        leftIndent=10, rightIndent=10,
        borderWidth=1, borderColor=ORANGE, borderPadding=5,
        backColor=LIGHT_ORANGE
    )
    diagram_style = ParagraphStyle(
        'Diagram', parent=styles['Normal'],
        fontSize=10, textColor=BLUE, spaceAfter=4,
        leading=14, fontName='Helvetica-Bold',
        leftIndent=10, rightIndent=10,
        borderWidth=1, borderColor=BLUE, borderPadding=5,
        backColor=LIGHT_BLUE
    )
    note_style = ParagraphStyle(
        'Note', parent=styles['Normal'],
        fontSize=9, textColor=GRAY, spaceAfter=3,
        leading=12, fontName='Helvetica-Oblique'
    )

    story = []

    # ============================================================
    # COVER PAGE
    # ============================================================
    story.append(Spacer(1, 1.5*inch))
    story.append(Paragraph("METROLOGYAI", title_style))
    story.append(Paragraph("SIH 2026 PPT Content Guide", subtitle_style))
    story.append(Spacer(1, 0.3*inch))
    story.append(HRFlowable(width="100%", thickness=2, color=NAVY))
    story.append(Spacer(1, 0.2*inch))
    story.append(Paragraph("Problem Statement ID: PS26034", body_style))
    story.append(Paragraph("Team ID: 57893 | Team Name: Zillion MindsSashakt", body_style))
    story.append(Paragraph("Theme: Software | Category: Software", body_style))
    story.append(Spacer(1, 0.3*inch))
    story.append(Paragraph(
        "This document contains all content for the SIH 2026 presentation. "
        "Each section maps to a specific slide. Follow the placement instructions "
        "for flowcharts, diagrams, and visual elements.",
        body_style
    ))
    story.append(Spacer(1, 0.2*inch))
    story.append(Paragraph(
        "SLIDE MAP: Slide 1 (Title) → Slide 2 (Problem/Solution/Unique) → "
        "Slide 3 (Technical) → Slide 4 (Feasibility) → Slide 5 (Impact) → "
        "Slide 6 (References)",
        note_style
    ))
    story.append(PageBreak())

    # ============================================================
    # SLIDE 1: TITLE PAGE
    # ============================================================
    story.append(Paragraph("SLIDE 1: TITLE PAGE", title_style))
    story.append(HRFlowable(width="100%", thickness=1, color=NAVY))
    story.append(Spacer(1, 0.2*inch))

    story.append(Paragraph("CONTENT TO PASTE:", heading_style))
    
    title_content = [
        ["Field", "Content"],
        ["Problem Statement ID", "PS26034"],
        ["Problem Statement Title", "AI-Assisted Legal Metrology Compliance Inspection System"],
        ["Theme", "Software"],
        ["PS Category", "Software"],
        ["Team ID", "57893"],
        ["Team Name", "Zillion MindsSashakt"],
    ]
    
    t = Table(title_content, colWidths=[2.5*inch, 4.5*inch])
    t.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), NAVY),
        ('TEXTCOLOR', (0, 0), (-1, 0), white),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, -1), 10),
        ('FONTNAME', (0, 1), (0, -1), 'Helvetica-Bold'),
        ('GRID', (0, 0), (-1, -1), 0.5, GRAY),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('TOPPADDING', (0, 0), (-1, -1), 4),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 4),
        ('LEFTPADDING', (0, 0), (-1, -1), 6),
    ]))
    story.append(t)
    story.append(Spacer(1, 0.2*inch))

    story.append(Paragraph("PLACEMENT INSTRUCTIONS:", subheading_style))
    story.append(Paragraph(
        "• Use the existing SIH template layout (hexagons, SIH brain logo already present)",
        bullet_style
    ))
    story.append(Paragraph(
        "• Replace 'Problem Statement ID –' with 'Problem Statement ID – PS26034'",
        bullet_style
    ))
    story.append(Paragraph(
        "• Replace 'Team ID-' with 'Team ID – 57893'",
        bullet_style
    ))
    story.append(Paragraph(
        "• Replace 'Team Name' with 'Team Name – Zillion MindsSashakt'",
        bullet_style
    ))
    story.append(PageBreak())

    # ============================================================
    # SLIDE 2: PROBLEM + SOLUTION + UNIQUE SOLUTIONS
    # ============================================================
    story.append(Paragraph("SLIDE 2: PROBLEM + SOLUTION + UNIQUE SOLUTIONS", title_style))
    story.append(HRFlowable(width="100%", thickness=1, color=NAVY))
    story.append(Spacer(1, 0.2*inch))

    story.append(Paragraph(
        "TITLE: METROLOGYAI",
        subheading_style
    ))
    story.append(Spacer(1, 0.1*inch))

    # SECTION A: Understanding the Problem
    story.append(Paragraph("SECTION A: Understanding the Problem (Left Column)", heading_style))
    story.append(Paragraph("— Paste as bullet points —", note_style))
    
    problems = [
        "01 — Manual Inspection: Inspectors manually examine packaged commodity labels, making repetitive checks time-consuming.",
        "02 — Multi-Surface Declarations: Required information may appear on different sides of the package.",
        "03 — Real-World Image Issues: Blur, glare, perspective distortion, and small text reduce readability.",
        "04 — Uncertain AI Results: A system may confuse an unreadable declaration with a genuinely missing one.",
        "05 — Fragmented Verification: Physical packaging, online listings, and historical data need separate comparison.",
    ]
    for p in problems:
        story.append(Paragraph(f"• {p}", bullet_style))
    
    story.append(Spacer(1, 0.1*inch))
    story.append(Paragraph(
        "QUOTE (at bottom of problem section):",
        note_style
    ))
    story.append(Paragraph(
        "<i>\"The challenge is not simply reading a label — it is producing a reliable, explainable inspection decision.\"</i>",
        body_style
    ))
    story.append(Spacer(1, 0.15*inch))

    # SECTION B: Our Solution
    story.append(Paragraph("SECTION B: Our Solution (Center Column)", heading_style))
    story.append(Paragraph("— Paste as bullet points —", note_style))
    
    solutions = [
        "Takes product images (multi-view) → AI reads all visible text → Extracts 11 mandatory declaration fields",
        "Validates each field against 11 Legal Metrology rules",
        "Calculates compliance score (0-100) with evidence chain for every finding",
        "Detects label anomalies (tampering, overlays, altered MRP)",
        "Prioritizes inspection risk (low / medium / high)",
        "Inspector reviews, corrects, and makes final decision",
        "Saves all data to database and generates digital PDF report",
    ]
    for s in solutions:
        story.append(Paragraph(f"• {s}", bullet_style))
    
    story.append(Spacer(1, 0.1*inch))
    story.append(Paragraph(
        "QUOTE (at bottom of solution section):",
        note_style
    ))
    story.append(Paragraph(
        "<i>\"AI assists the inspection; the inspector makes the final decision.\"</i>",
        body_style
    ))
    story.append(Spacer(1, 0.15*inch))

    # SECTION C: Unique Solutions
    story.append(Paragraph("SECTION C: Our Unique Solutions (Right Column)", heading_style))
    story.append(Paragraph("— Paste as compact cards —", note_style))
    
    uniques = [
        ("Multi-View Intelligence", "Analyzes front, back, side, top, and bottom package views simultaneously."),
        ("Missing ≠ Unreadable", "Separates absent declarations from low-confidence detection."),
        ("Adaptive Re-Capture", "Identifies poor image quality and recommends specific improvements."),
        ("Evidence Chain", "Links every finding to image evidence, OCR text, field, and rule."),
        ("Risk Prioritization", "AI scores every inspection for risk level (low/medium/high)."),
        ("Human-in-the-Loop", "Inspector corrections trigger automatic smart revalidation."),
    ]
    for title, desc in uniques:
        story.append(Paragraph(f"<b>{title}</b>: {desc}", bullet_style))
    
    story.append(Spacer(1, 0.15*inch))

    # DIAGRAM INSTRUCTION
    story.append(Paragraph("DIAGRAM: USP Cards (Right Side)", diagram_style))
    story.append(Paragraph(
        "Create 4 rounded rectangle cards arranged in a 2×2 grid on the right side of the slide:",
        body_style
    ))
    story.append(Paragraph("• Card 1 (Top-Left): Real-time compliance scoring", bullet_style))
    story.append(Paragraph("• Card 2 (Top-Right): Evidence-backed findings for every violation", bullet_style))
    story.append(Paragraph("• Card 3 (Bottom-Left): Multi-view package analysis", bullet_style))
    story.append(Paragraph("• Card 4 (Bottom-Right): Inspector corrections with auto-revalidation", bullet_style))
    story.append(Paragraph(
        "Use light blue fill with colored borders. Label above: \"USPs {\"",
        note_style
    ))
    story.append(PageBreak())

    # ============================================================
    # SLIDE 3: TECHNICAL APPROACH
    # ============================================================
    story.append(Paragraph("SLIDE 3: TECHNICAL APPROACH", title_style))
    story.append(HRFlowable(width="100%", thickness=1, color=NAVY))
    story.append(Spacer(1, 0.2*inch))

    story.append(Paragraph(
        "TITLE: TECHNICAL APPROACH",
        subheading_style
    ))

    # SECTION A: Methodology
    story.append(Paragraph("SECTION A: Methodology (Top — Horizontal Process)", heading_style))
    story.append(Paragraph(
        "Create a horizontal flow with 7 numbered steps connected by arrows:",
        instruction_style
    ))
    
    methodology = [
        ("01", "CAPTURE", "Multi-view product images"),
        ("02", "QUALITY CHECK", "Blur + glare + visibility analysis"),
        ("03", "EXTRACT", "AI Vision + OCR via Gemini API"),
        ("04", "STRUCTURE", "11 declaration fields extracted"),
        ("05", "VALIDATE", "11 Legal Metrology rules checked"),
        ("06", "EVIDENCE", "Findings linked to source + rule"),
        ("07", "REPORT", "Inspector review + PDF report"),
    ]
    
    meth_data = [["Step", "Action", "Description"]]
    for num, action, desc in methodology:
        meth_data.append([num, action, desc])
    
    t = Table(meth_data, colWidths=[0.6*inch, 1.3*inch, 3.5*inch])
    t.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), NAVY),
        ('TEXTCOLOR', (0, 0), (-1, 0), white),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, -1), 9),
        ('FONTNAME', (0, 1), (0, -1), 'Helvetica-Bold'),
        ('FONTNAME', (1, 1), (1, -1), 'Helvetica-Bold'),
        ('TEXTCOLOR', (0, 1), (0, -1), NAVY),
        ('GRID', (0, 0), (-1, -1), 0.5, GRAY),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('TOPPADDING', (0, 0), (-1, -1), 3),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 3),
        ('LEFTPADDING', (0, 0), (-1, -1), 4),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [white, LIGHT_BLUE]),
    ]))
    story.append(t)
    story.append(Spacer(1, 0.15*inch))

    # SECTION B: Technical Approach
    story.append(Paragraph("SECTION B: Technical Approach (Left — Bullets)", heading_style))
    
    tech_approach = [
        "Image Acquisition — Capture product package images and optional e-commerce listing screenshots.",
        "Image Quality Analysis — Client-side canvas: blur (Laplacian variance), brightness, glare (bright pixel ratio), resolution, aspect ratio.",
        "AI Vision + OCR — Google Gemini Vision API extracts 11 fields with confidence scores (0-100). Multi-model fallback: tries 4 models if one fails.",
        "Structured Extraction — 40+ field name aliases normalized. Fields: Product Name, Manufacturer, Net Quantity, MRP, Consumer Care, Dates, Country, Batch, FSSAI, Veg/Non-Veg.",
        "Compliance Engine — 11 rules with severity levels. Weighted scoring across 7 categories. Status: Compliant (≥80) / Review Required / Non-Compliant.",
        "Evidence Engine — Every finding linked to: Image Region → OCR Text → Field → Rule → Validation → Decision.",
    ]
    for item in tech_approach:
        story.append(Paragraph(f"• {item}", bullet_style))
    story.append(Spacer(1, 0.15*inch))

    # SECTION C: Tech Stack
    story.append(Paragraph("SECTION C: Tech Stack (Bottom)", heading_style))
    
    tech_stack = [
        ["Layer", "Technology"],
        ["Frontend", "React 19 + TypeScript + Vite + Tailwind CSS + shadcn/ui + Lucide Icons"],
        ["Backend", "Convex (Serverless) — Actions, Mutations, Queries"],
        ["Database", "Convex DB — 3 tables: users, inspections, ecommerceComparisons"],
        ["AI / Vision", "Google Gemini Vision API (4-model fallback, temp 0.1, 4096 tokens)"],
        ["Auth", "Convex Auth — Email OTP + Anonymous Login"],
        ["Analytics", "Recharts (bar, pie, line charts)"],
        ["Deployment", "Freebuff Platform (auto-deploy)"],
    ]
    
    t = Table(tech_stack, colWidths=[1.2*inch, 5.0*inch])
    t.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), NAVY),
        ('TEXTCOLOR', (0, 0), (-1, 0), white),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, -1), 9),
        ('FONTNAME', (0, 1), (0, -1), 'Helvetica-Bold'),
        ('TEXTCOLOR', (0, 1), (0, -1), BLUE),
        ('GRID', (0, 0), (-1, -1), 0.5, GRAY),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('TOPPADDING', (0, 0), (-1, -1), 3),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 3),
        ('LEFTPADDING', (0, 0), (-1, -1), 4),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [white, LIGHT_BLUE]),
    ]))
    story.append(t)
    story.append(Spacer(1, 0.15*inch))

    # FLOWCHART INSTRUCTION
    story.append(Paragraph("DIAGRAM: Pipeline Flowchart (Right Side)", diagram_style))
    story.append(Paragraph(
        "Create a vertical flowchart on the right side with 7 rounded rectangles connected by down arrows:",
        body_style
    ))
    story.append(Paragraph("IMAGE → QUALITY CHECK → AI VISION + OCR → RULE VALIDATION → SCORE + EVIDENCE → INSPECTOR REVIEW → PDF REPORT", body_style))
    story.append(Paragraph(
        "Use different colors: Light Blue (start), Light Green (quality), Light Orange (AI), Light Red (rules), Light Blue (score), Light Green (review), Light Orange (report). Connect with navy down arrows.",
        note_style
    ))
    story.append(PageBreak())

    # ============================================================
    # SLIDE 4: FEASIBILITY AND VIABILITY
    # ============================================================
    story.append(Paragraph("SLIDE 4: FEASIBILITY AND VIABILITY", title_style))
    story.append(HRFlowable(width="100%", thickness=1, color=NAVY))
    story.append(Spacer(1, 0.2*inch))

    # SECTION A: Feasibility
    story.append(Paragraph("SECTION A: Feasibility Analysis (Left Column)", heading_style))
    
    feasibility = [
        ("01", "Technology", "Gemini Vision API is production-ready. React + Convex are proven frameworks. No experimental technology required."),
        ("02", "Data", "Product label images are easy to collect. 11 mandatory declarations publicly documented in Legal Metrology Rules 2011."),
        ("03", "Architecture", "AI extraction and rule validation are modular, independently testable components. Clean API boundaries."),
        ("04", "Deployment", "Web-based — works on desktop, tablet, mobile. No app install. Cloud-hosted. Auto-deployment on code changes."),
        ("05", "Scalability", "New categories added by updating RULE_REQUIREMENTS config. New fields added through configuration. Scales with Convex cloud."),
    ]
    
    feas_data = [["#", "Area", "Analysis"]]
    for num, area, analysis in feasibility:
        feas_data.append([num, area, analysis])
    
    t = Table(feas_data, colWidths=[0.5*inch, 1.2*inch, 4.5*inch])
    t.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), NAVY),
        ('TEXTCOLOR', (0, 0), (-1, 0), white),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, -1), 9),
        ('FONTNAME', (0, 1), (0, -1), 'Helvetica-Bold'),
        ('FONTNAME', (1, 1), (1, -1), 'Helvetica-Bold'),
        ('GRID', (0, 0), (-1, -1), 0.5, GRAY),
        ('VALIGN', (0, 0), (-1, -1), 'TOP'),
        ('TOPPADDING', (0, 0), (-1, -1), 3),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 3),
        ('LEFTPADDING', (0, 0), (-1, -1), 4),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [white, LIGHT_BLUE]),
    ]))
    story.append(t)
    story.append(Spacer(1, 0.15*inch))

    # SECTION B: What Ifs
    story.append(Paragraph("SECTION B: What Ifs...? — Challenge → Mitigation (Center)", heading_style))
    
    whatifs = [
        ("AI misreads text", "Confidence scoring (0-100) + evidence chain + inspector correction"),
        ("Image is blurry", "Client-side quality detection + adaptive recapture recommendations"),
        ("Declaration on another side", "Multi-view analysis (up to 6 package views)"),
        ("Regulations change", "Version-controlled rule engine — update rules without code changes"),
        ("AI produces false finding", "Human-in-the-loop verification — inspector makes final call"),
        ("API fails", "Multi-model fallback (4 Gemini models tried in sequence)"),
    ]
    
    whatif_data = [["Challenge", "Mitigation"]]
    for challenge, mitigation in whatifs:
        whatif_data.append([challenge, mitigation])
    
    t = Table(whatif_data, colWidths=[2.0*inch, 4.2*inch])
    t.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), NAVY),
        ('TEXTCOLOR', (0, 0), (-1, 0), white),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, -1), 9),
        ('FONTNAME', (0, 1), (0, -1), 'Helvetica-Bold'),
        ('GRID', (0, 0), (-1, -1), 0.5, GRAY),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('TOPPADDING', (0, 0), (-1, -1), 3),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 3),
        ('LEFTPADDING', (0, 0), (-1, -1), 4),
        ('ROWBACKGROUNDS', (0, 1), (-1, -1), [white, LIGHT_ORANGE]),
    ]))
    story.append(t)
    story.append(Spacer(1, 0.15*inch))

    # SECTION C: Before vs After
    story.append(Paragraph("SECTION C: Before MetrologyAI → After MetrologyAI (Bottom)", heading_style))
    
    before_after = [
        ["", "Before MetrologyAI", "After MetrologyAI"],
        ["Reading", "Manual label reading", "AI-assisted OCR + Vision extraction"],
        ["Validation", "Manual rule checking", "Automated 11-rule compliance engine"],
        ["Evidence", "Scattered, paper-based", "Evidence-linked digital findings"],
        ["Reporting", "Manual documentation", "Structured digital PDF reports"],
        ["Risk", "Inspector-led prioritization", "AI-scored risk assessment"],
    ]
    
    t = Table(before_after, colWidths=[1.0*inch, 2.5*inch, 2.5*inch])
    t.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), NAVY),
        ('TEXTCOLOR', (0, 0), (-1, 0), white),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, -1), 9),
        ('FONTNAME', (0, 1), (0, -1), 'Helvetica-Bold'),
        ('BACKGROUND', (1, 1), (1, -1), LIGHT_RED),
        ('BACKGROUND', (2, 1), (2, -1), LIGHT_GREEN),
        ('GRID', (0, 0), (-1, -1), 0.5, GRAY),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('TOPPADDING', (0, 0), (-1, -1), 3),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 3),
        ('LEFTPADDING', (0, 0), (-1, -1), 4),
    ]))
    story.append(t)
    story.append(PageBreak())

    # ============================================================
    # SLIDE 5: IMPACT AND BENEFITS
    # ============================================================
    story.append(Paragraph("SLIDE 5: IMPACT AND BENEFITS", title_style))
    story.append(HRFlowable(width="100%", thickness=1, color=NAVY))
    story.append(Spacer(1, 0.2*inch))

    # SECTION A: Inspector Benefits
    story.append(Paragraph("SECTION A: Inspector Benefits (Left Column)", heading_style))
    
    inspector = [
        "Faster inspection — AI reads 11 fields in seconds, not minutes",
        "Better accuracy — Confidence scores show what is reliable",
        "Complete evidence — Every finding linked to source image and rule",
        "Risk prioritization — Focus on high-risk products first",
        "Smart revalidation — Corrections automatically update compliance status",
        "Audit trail — Complete record of every decision made",
    ]
    for item in inspector:
        story.append(Paragraph(f"• {item}", bullet_style))
    story.append(Spacer(1, 0.1*inch))

    # SECTION B: Operational Benefits
    story.append(Paragraph("SECTION B: Operational Benefits (Center Column)", heading_style))
    
    operational = [
        "Consistent checking — Same 11 rules applied every time",
        "Reduced false positives — Missing vs unreadable distinction",
        "Scalable — Supports more inspections without proportional staff increase",
        "Data-driven — Analytics show patterns across inspections",
        "Versioned rules — New categories added through configuration",
        "Multi-view analysis — One inspection covers entire package",
    ]
    for item in operational:
        story.append(Paragraph(f"• {item}", bullet_style))
    story.append(Spacer(1, 0.1*inch))

    # SECTION C: Social & Economic Benefits
    story.append(Paragraph("SECTION C: Social & Economic Benefits (Right Column)", heading_style))
    
    social = [
        "Better consumer protection through consistent enforcement",
        "Faster detection of non-compliant products",
        "Digital evidence supports legal proceedings",
        "Prevents consumers from buying mislabeled products",
        "Supports government Digital India initiative",
        "Transparent, explainable AI decisions",
    ]
    for item in social:
        story.append(Paragraph(f"• {item}", bullet_style))
    story.append(Spacer(1, 0.15*inch))

    # CHART INSTRUCTION
    story.append(Paragraph("DIAGRAM: Impact Bar Chart (Bottom or Right)", diagram_style))
    story.append(Paragraph(
        "Create a horizontal bar chart with 5 impact dimensions:",
        body_style
    ))
    
    chart_data = [
        ["Dimension", "Proportional %", "Color"],
        ["Inspection Efficiency", "35%", "Green"],
        ["Evidence & Traceability", "25%", "Blue"],
        ["Inspector Assistance", "20%", "Saffron/Orange"],
        ["Consistency", "10%", "Navy"],
        ["Digital Documentation", "10%", "Gray"],
    ]
    
    t = Table(chart_data, colWidths=[2.0*inch, 1.2*inch, 1.5*inch])
    t.setStyle(TableStyle([
        ('BACKGROUND', (0, 0), (-1, 0), NAVY),
        ('TEXTCOLOR', (0, 0), (-1, 0), white),
        ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
        ('FONTSIZE', (0, 0), (-1, -1), 9),
        ('GRID', (0, 0), (-1, -1), 0.5, GRAY),
        ('VALIGN', (0, 0), (-1, -1), 'MIDDLE'),
        ('TOPPADDING', (0, 0), (-1, -1), 3),
        ('BOTTOMPADDING', (0, 0), (-1, -1), 3),
    ]))
    story.append(t)
    story.append(Paragraph(
        "Note: Label as \"Illustrative impact priorities\" — do NOT claim exact percentages as measured results.",
        note_style
    ))
    story.append(PageBreak())

    # ============================================================
    # SLIDE 6: RESEARCH AND REFERENCES
    # ============================================================
    story.append(Paragraph("SLIDE 6: RESEARCH AND REFERENCES", title_style))
    story.append(HRFlowable(width="100%", thickness=1, color=NAVY))
    story.append(Spacer(1, 0.2*inch))

    # SECTION A: Legal References
    story.append(Paragraph("SECTION A: Legal & Regulatory References (Left Column)", heading_style))
    
    legal = [
        "01 — Legal Metrology Act, 2009 — Government of India legislation governing weights and measures",
        "02 — Legal Metrology (Packaged Commodities) Rules, 2011 — Mandatory declarations on pre-packaged goods",
        "03 — Department of Consumer Affairs — Legal Metrology Division (legalmetrology.nic.in)",
        "04 — Official Gazette Notifications — Amendments and updates to packaged commodity rules",
    ]
    for item in legal:
        story.append(Paragraph(f"• {item}", bullet_style))
    story.append(Spacer(1, 0.1*inch))

    # SECTION B: Research Areas
    story.append(Paragraph("SECTION B: Research Areas (Center Column)", heading_style))
    
    research = [
        "Computer Vision & OCR — Scene-text recognition for product label analysis",
        "Multimodal AI — Vision-language models for regulatory compliance",
        "Explainable AI — Confidence scoring and evidence-based decision support",
        "Human-AI Interaction — Inspector-in-the-loop verification patterns",
    ]
    for item in research:
        story.append(Paragraph(f"• {item}", bullet_style))
    story.append(Spacer(1, 0.1*inch))

    # SECTION C: Technology References
    story.append(Paragraph("SECTION C: Technology References (Right Column)", heading_style))
    
    tech_refs = [
        "React — react.dev",
        "TypeScript — typescriptlang.org",
        "Vite — vitejs.dev",
        "Tailwind CSS — tailwindcss.com",
        "Convex — convex.dev",
        "Google Gemini Vision API — ai.google.dev",
        "Recharts — recharts.org",
        "shadcn/ui — ui.shadcn.com",
    ]
    for item in tech_refs:
        story.append(Paragraph(f"• {item}", bullet_style))
    story.append(Spacer(1, 0.1*inch))

    # SECTION D: Placeholders
    story.append(Paragraph("PLACEHOLDERS (Bottom)", heading_style))
    story.append(Paragraph(
        "• [ADD VERIFIED RESEARCH PAPERS OR ACADEMIC REFERENCES HERE]",
        bullet_style
    ))
    story.append(Paragraph(
        "• [ADD ANY ADDITIONAL TECHNOLOGY DOCUMENTATION LINKS HERE]",
        bullet_style
    ))
    story.append(Paragraph(
        "Note: Do NOT fabricate paper titles, authors, statistics, or URLs.",
        note_style
    ))

    # ============================================================
    # FINAL NOTES
    # ============================================================
    story.append(PageBreak())
    story.append(Paragraph("IMPORTANT NOTES FOR PPT CREATION", title_style))
    story.append(HRFlowable(width="100%", thickness=2, color=NAVY))
    story.append(Spacer(1, 0.2*inch))
    
    notes = [
        ("Preserve SIH Template", "Keep the blue footer, team name oval, SIH logo, hexagons, and slide dimensions unchanged."),
        ("Editable Shapes", "All flowcharts, diagrams, and tables must be created as editable PowerPoint shapes, not images."),
        ("No AI Remarks", "Do NOT include any \"Generated by AI\" or tool branding."),
        ("No Fake Claims", "Do NOT invent accuracy percentages, processing times, or cost savings."),
        ("Legal Disclaimer", "Describe as \"AI-assisted inspection and decision-support system\" — NOT as official government authority."),
        ("Readability", "Font sizes must be readable when projected. Avoid tiny text. Short sentences > paragraphs."),
        ("Alignment", "Check every slide for equal spacing, consistent margins, no overlapping elements."),
        ("File Format", "Save as .pptx (editable) and upload as PDF to the SIH portal."),
    ]
    
    for title, desc in notes:
        story.append(Paragraph(f"<b>{title}</b>", subheading_style))
        story.append(Paragraph(desc, body_style))
        story.append(Spacer(1, 0.05*inch))

    # Build PDF
    doc.build(story)
    print("PDF created: MetrologyAI_SIH_PPT_Content_Guide.pdf")


if __name__ == '__main__':
    create_pdf()
