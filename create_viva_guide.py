# -*- coding: utf-8 -*-
"""
Generate TripMind APIs, Features & Technical Viva Preparation Guide PDF
"""
import sys
import os
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, PageBreak, KeepTogether, HRFlowable
)
from reportlab.pdfgen import canvas

class NumberedCanvas(canvas.Canvas):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self._saved_page_states = []

    def showPage(self):
        self._saved_page_states.append(dict(self.__dict__))
        self._startPage()

    def save(self):
        num_pages = len(self._saved_page_states)
        for state in self._saved_page_states:
            self.__dict__.update(state)
            self.draw_page_decorations(num_pages)
            super().showPage()
        super().save()

    def draw_page_decorations(self, page_count):
        self.saveState()
        # Top Header (pages > 1)
        if self._pageNumber > 1:
            self.setFont("Helvetica-Bold", 8)
            self.setFillColor(colors.HexColor("#1E3A8A"))
            self.drawString(40, 755, "TRIPMIND")
            self.setFont("Helvetica", 8)
            self.setFillColor(colors.HexColor("#64748B"))
            self.drawString(90, 755, "|   APIs, Architecture & Viva Defense Master Guide")
            self.setStrokeColor(colors.HexColor("#CBD5E1"))
            self.setLineWidth(0.6)
            self.line(40, 748, 572, 748)

        # Bottom Footer (all pages)
        self.setStrokeColor(colors.HexColor("#CBD5E1"))
        self.setLineWidth(0.6)
        self.line(40, 32, 572, 32)

        self.setFont("Helvetica", 8)
        self.setFillColor(colors.HexColor("#64748B"))
        self.drawString(40, 20, "TripMind - AI Smart Travel Assistant | Technical Viva Voce Defense Document")
        page_str = f"Page {self._pageNumber} of {page_count}"
        self.drawRightString(572, 20, page_str)
        self.restoreState()

def build_pdf(filename):
    doc = SimpleDocTemplate(
        filename,
        pagesize=letter,
        leftMargin=40,
        rightMargin=40,
        topMargin=46,
        bottomMargin=42
    )

    styles = getSampleStyleSheet()

    primary_color = colors.HexColor("#1E3A8A")     # Deep Navy Blue
    secondary_color = colors.HexColor("#0284C7")   # Sky Blue
    accent_green = colors.HexColor("#0F766E")      # Deep Emerald
    dark_neutral = colors.HexColor("#0F172A")      # Slate 900
    body_text_color = colors.HexColor("#334155")   # Slate 700
    table_border = colors.HexColor("#CBD5E1")

    title_style = ParagraphStyle(
        'DocTitle',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=22,
        leading=26,
        textColor=primary_color,
        spaceAfter=4
    )

    subtitle_style = ParagraphStyle(
        'DocSubtitle',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=10,
        leading=15,
        textColor=secondary_color,
        spaceAfter=12
    )

    h1_style = ParagraphStyle(
        'SectionH1',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=13,
        leading=17,
        textColor=primary_color,
        spaceBefore=12,
        spaceAfter=6,
        keepWithNext=True
    )

    q_style = ParagraphStyle(
        'QuestionStyle',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=9.5,
        leading=13.5,
        textColor=dark_neutral,
        spaceBefore=6,
        spaceAfter=3,
        keepWithNext=True
    )

    ans_style = ParagraphStyle(
        'AnswerStyle',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=8.5,
        leading=12.5,
        textColor=body_text_color,
        spaceAfter=4
    )

    callout_text = ParagraphStyle(
        'CalloutText',
        parent=styles['Normal'],
        fontName='Helvetica-Oblique',
        fontSize=8,
        leading=11.5,
        textColor=colors.HexColor("#1E293B")
    )

    meta_label = ParagraphStyle(
        'MetaLabel',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=8,
        leading=11.5,
        textColor=primary_color
    )

    table_cell = ParagraphStyle(
        'TableCell',
        parent=styles['Normal'],
        fontName='Helvetica',
        fontSize=8,
        leading=11,
        textColor=body_text_color
    )

    table_cell_bold = ParagraphStyle(
        'TableCellBold',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=8,
        leading=11,
        textColor=dark_neutral
    )

    table_header = ParagraphStyle(
        'TableHeader',
        parent=styles['Normal'],
        fontName='Helvetica-Bold',
        fontSize=8,
        leading=11,
        textColor=colors.white
    )

    story = []

    # ---------------------------------------------------------
    # HEADER BANNER
    # ---------------------------------------------------------
    story.append(Paragraph("TripMind: APIs, Architecture & Viva Defense Guide", title_style))
    story.append(Paragraph("Comprehensive Technical Evaluation of Third-Party APIs, Architecture Decisions, Trade-Offs, Pros & Cons, and Defense Q&A for Academic Viva Voce", subtitle_style))
    story.append(HRFlowable(width="100%", thickness=1.5, color=primary_color, spaceBefore=0, spaceAfter=8))

    # Metadata Card Table
    meta_data = [
        [
            Paragraph("<b>Project:</b> TripMind - AI Smart Travel Planner", meta_label),
            Paragraph("<b>Platform:</b> Full-Stack MERN + Google Gemini AI", meta_label)
        ],
        [
            Paragraph("<b>Target Domain:</b> Sri Lanka Tourism & Smart Itineraries", meta_label),
            Paragraph("<b>Purpose:</b> Viva Voce, Final Defense & Technical Evaluation", meta_label)
        ]
    ]
    meta_table = Table(meta_data, colWidths=[266, 266])
    meta_table.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,-1), colors.HexColor("#EFF6FF")),
        ('BOX', (0,0), (-1,-1), 1, colors.HexColor("#BFDBFE")),
        ('INNERGRID', (0,0), (-1,-1), 0.5, colors.HexColor("#DBEAFE")),
        ('TOPPADDING', (0,0), (-1,-1), 5),
        ('BOTTOMPADDING', (0,0), (-1,-1), 5),
        ('LEFTPADDING', (0,0), (-1,-1), 8),
        ('RIGHTPADDING', (0,0), (-1,-1), 8),
    ]))
    story.append(meta_table)
    story.append(Spacer(1, 10))

    # Helper function for Q&A Box
    def make_qa_box(q_num, category, question_text, answer_text, pro_text="", con_text="", alt_text="", defense_tip=""):
        flowables = []
        q_p = Paragraph(f"<b>[Q{q_num} - {category}]</b> {question_text}", q_style)
        flowables.append(q_p)
        flowables.append(Paragraph(answer_text, ans_style))
        
        table_rows = []
        if pro_text:
            table_rows.append([
                Paragraph("<b>Advantages (වාසි / Pros):</b>", meta_label),
                Paragraph(pro_text, ans_style)
            ])
        if con_text:
            table_rows.append([
                Paragraph("<b>Disadvantages (අවාසි / Cons):</b>", meta_label),
                Paragraph(con_text, ans_style)
            ])
        if alt_text:
            table_rows.append([
                Paragraph("<b>Better Alternatives & Why Not Used:</b>", meta_label),
                Paragraph(alt_text, ans_style)
            ])
        if defense_tip:
            table_rows.append([
                Paragraph("<b>Examiner Defense Tip (Viva Tip):</b>", meta_label),
                Paragraph(f"<i>{defense_tip}</i>", callout_text)
            ])
        
        if table_rows:
            details_table = Table(table_rows, colWidths=[145, 367])
            details_table.setStyle(TableStyle([
                ('BACKGROUND', (0,0), (-1,-1), colors.HexColor("#F8FAFC")),
                ('BOX', (0,0), (-1,-1), 0.75, colors.HexColor("#E2E8F0")),
                ('INNERGRID', (0,0), (-1,-1), 0.5, colors.HexColor("#F1F5F9")),
                ('VALIGN', (0,0), (-1,-1), 'TOP'),
                ('TOPPADDING', (0,0), (-1,-1), 4),
                ('BOTTOMPADDING', (0,0), (-1,-1), 4),
                ('LEFTPADDING', (0,0), (-1,-1), 7),
                ('RIGHTPADDING', (0,0), (-1,-1), 7),
            ]))
            flowables.append(details_table)
            flowables.append(Spacer(1, 8))
        else:
            flowables.append(Spacer(1, 6))
            
        return flowables

    # ---------------------------------------------------------
    # SECTION 1: SYSTEM ARCHITECTURE & INTEGRATED APIS OVERVIEW
    # ---------------------------------------------------------
    story.append(Paragraph("1. System Architecture & Integrated APIs Inventory", h1_style))
    story.append(Paragraph(
        "TripMind integrates 6 distinct third-party APIs and cloud services alongside its core MERN architecture. "
        "Each external dependency was selected based on strict criteria: applicability to Sri Lanka, API pricing/free-tier viability, latency, and ease of fallback.",
        ans_style
    ))
    story.append(Spacer(1, 3))

    overview_matrix = [
        [
            Paragraph("API / Service", table_header),
            Paragraph("Module in TripMind", table_header),
            Paragraph("Key Purpose", table_header),
            Paragraph("Auth & Protocol", table_header),
            Paragraph("Cost / Tier", table_header)
        ],
        [
            Paragraph("<b>Google Gemini AI</b><br/>(@google/genai)", table_cell_bold),
            Paragraph("Hotel, Food, Activity, Vehicle, Voice Services", table_cell),
            Paragraph("Generates dynamic, budget-adjusted Sri Lankan itineraries and local recommendations", table_cell),
            Paragraph("API Key / HTTPS REST", table_cell),
            Paragraph("Free Developer Tier (Google AI Studio)", table_cell)
        ],
        [
            Paragraph("<b>Amadeus Hospitality API</b><br/>(Self-Service)", table_cell_bold),
            Paragraph("amadeusService.js (Hotel Booking Engine)", table_cell),
            Paragraph("Enterprise hotel inventory, live pricing, availability by geo-coordinates", table_cell),
            Paragraph("OAuth 2.0 Client Credentials Token", table_cell),
            Paragraph("Free Sandbox Tier (2,000 req/mo)", table_cell)
        ],
        [
            Paragraph("<b>OpenStreetMap Overpass API</b>", table_cell_bold),
            Paragraph("EmergencySOSModal & SafetySOSCenter", table_cell),
            Paragraph("Real-time geospatial bounding query for nearby hospitals and clinics (20km radius)", table_cell),
            Paragraph("Public Overpass QL / REST", table_cell),
            Paragraph("100% Free / Open Source", table_cell)
        ],
        [
            Paragraph("<b>W3C Geolocation API</b>", table_cell_bold),
            Paragraph("Emergency SOS GPS Auto-Detect", table_cell),
            Paragraph("Acquires device hardware GPS coordinates (latitude, longitude, accuracy radius)", table_cell),
            Paragraph("Native Browser API (No key)", table_cell),
            Paragraph("Free / Hardware Native", table_cell)
        ],
        [
            Paragraph("<b>Pexels Image API & CDN</b>", table_cell_bold),
            Paragraph("pexelsService.js & activityImageService.js", table_cell),
            Paragraph("Dynamic high-definition photography for activities and destination headers", table_cell),
            Paragraph("API Key Header / CDN URLs", table_cell),
            Paragraph("Free Tier (200 req/hr, 20K/mo)", table_cell)
        ],
        [
            Paragraph("<b>Wikimedia Commons & Google Maps</b>", table_cell_bold),
            Paragraph("hotelImages.js, PlanTrip.jsx, TripResult.jsx", table_cell),
            Paragraph("Heritage hotel imagery and turnkey interactive navigation / route directions", table_cell),
            Paragraph("Public Media CDN & Deep Links", table_cell),
            Paragraph("100% Free / No Key Needed", table_cell)
        ]
    ]

    t_overview = Table(overview_matrix, colWidths=[90, 105, 145, 95, 95])
    t_overview.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), primary_color),
        ('GRID', (0,0), (-1,-1), 0.5, table_border),
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
        ('TOPPADDING', (0,0), (-1,-1), 4),
        ('BOTTOMPADDING', (0,0), (-1,-1), 4),
        ('LEFTPADDING', (0,0), (-1,-1), 5),
        ('RIGHTPADDING', (0,0), (-1,-1), 5),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.white, colors.HexColor("#F8FAFC")]),
    ]))
    story.append(t_overview)
    story.append(Spacer(1, 10))

    # ---------------------------------------------------------
    # SECTION 2: GOOGLE GEMINI GENERATIVE AI
    # ---------------------------------------------------------
    story.append(Paragraph("2. Google Gemini Generative AI Integration", h1_style))

    for item in make_qa_box(
        q_num=1,
        category="Generative AI",
        question_text="What exact role does Google Gemini Generative AI play in TripMind, and how is it integrated?",
        answer_text="Google Gemini AI acts as the dynamic intelligence core across 5 backend micro-services: "
                    "<b>geminiHotelService.js</b> (curates hotels by budget tiers in LKR), <b>geminiFoodService.js</b> (authentic culinary gems, e.g., local kottu, claypot rice &amp; curry), "
                    "<b>geminiActivityService.js</b> (day-by-day customized itinerary generation), <b>geminiVehicleService.js</b> (recommends scooters, tuk-tuks, or private cars based on terrain and group size), "
                    "and <b>geminiVoiceService.js</b> (voice trip assistant). It receives structured context (destination, total budget in LKR, duration, party size) and is constrained via prompt engineering to emit strict, raw JSON arrays.",
        pro_text="• <b>Contextual & Dynamic:</b> Adapts to arbitrary user budgets, group sizes, and travel styles rather than rigid static templates.<br/>"
                 "• <b>Sri Lankan Nuance:</b> High domain knowledge of Sri Lankan geographical routes, local street food, and realistic LKR rates.<br/>"
                 "• <b>Developer Tier:</b> Free tier allows 15 RPM (requests per minute) and 1,500 RPD via Google AI Studio without upfront billing.",
        con_text="• <b>Non-Deterministic Latency:</b> Takes 1.5 to 3.5 seconds to generate complex responses.<br/>"
                 "• <b>Hallucination Risk:</b> Without strict validation, LLMs can fabricate hotel names, outdated phone numbers, or invalid JSON syntax.",
        alt_text="<b>1. OpenAI GPT-4o / GPT-3.5 Turbo:</b> Excellent reasoning, but OpenAI offers NO permanent free tier for development; requires international credit card billing (USD), which is restrictive for Sri Lankan university environments.<br/>"
                 "<b>2. Anthropic Claude 3.5 Sonnet:</b> Best-in-class JSON formatting, but strictly paid API with higher per-token costs.<br/>"
                 "<b>3. Static Hardcoded Rule Engine:</b> Zero latency and free, but completely unable to handle arbitrary user constraints, custom budgets, or dynamic itinerary personalization.",
        defense_tip="Emphasize that you used Gemini because of its high multimodal/reasoning capability combined with a zero-cost API tier via Google AI Studio, making it the most viable enterprise-grade model for regional software."
    ):
        story.append(item)

    for item in make_qa_box(
        q_num=2,
        category="Generative AI Defense",
        question_text="Viva Trap Question: What if Gemini hallucinates an invalid hotel price, returns malformed JSON, or goes offline?",
        answer_text="In our architecture, <b>Gemini is NEVER a single point of failure</b>. We implemented a 3-layer defensive resilience pattern:<br/>"
                    "1. <b>Strict Prompt Schema & Regex Cleansing:</b> The prompt mandates raw JSON only. Incoming strings are stripped of markdown backticks (```json ... ```) and parsed via try/catch.<br/>"
                    "2. <b>Domain Sanitization:</b> Prices are capped and validated against the user's allocated accommodation budget (40% of total budget).<br/>"
                    "3. <b>Curated Static Fallback Catalog:</b> If Gemini times out, returns HTTP 429/500, or provides invalid JSON, the service immediately and seamlessly falls back to <b>travelCatalog.js</b> (our verified local database of Sri Lankan hotels and food spots) without crashing the frontend.",
        defense_tip="Examiners love resilience. Mentioning 'graceful degradation' and 'curated local fallback' demonstrates production-grade engineering."
    ):
        story.append(item)

    # ---------------------------------------------------------
    # SECTION 3: AMADEUS HOSPITALITY & TRAVEL API
    # ---------------------------------------------------------
    story.append(Paragraph("3. Amadeus Self-Service Hotel API Integration", h1_style))

    for item in make_qa_box(
        q_num=3,
        category="Travel GDS API",
        question_text="What is the Amadeus API and why was it chosen for hotel data? How does its authentication work?",
        answer_text="Amadeus is an industry-standard Global Distribution System (GDS) used by airlines and travel agencies globally. "
                    "In TripMind (<b>amadeusService.js</b>), it is utilized to fetch real-world hotel IDs, ratings, and live room rates based on geographic coordinates (lat/lng). "
                    "It uses the <b>OAuth 2.0 Client Credentials Grant</b> flow: the backend sends <code>AMADEUS_CLIENT_ID</code> and <code>AMADEUS_CLIENT_SECRET</code> to <code>https://test.api.amadeus.com/v1/security/oauth2/token</code> to receive an <code>access_token</code> with a 30-minute lifespan. "
                    "Our backend caches this token in memory with a 60-second expiration safety buffer to prevent redundant token requests.",
        pro_text="• <b>Enterprise Grade Data:</b> Official GDS supplier with accurate global hotel chains and verified amenities.<br/>"
                 "• <b>Token Caching:</b> Token reuse saves up to 500ms on subsequent user searches.<br/>"
                 "• <b>Generous Sandbox:</b> 2,000 free API calls every month for development.",
        con_text="• <b>Limited Sri Lankan Rural Coverage:</b> In Amadeus's test sandbox, regional boutique stays (e.g. Ella, Sigiriya guesthouses) have sparse listings compared to major cities like Colombo.<br/>"
                 "• <b>Currency Mismatch:</b> Returns prices in EUR/USD, requiring local currency conversion logic to LKR (LKR 305/USD, LKR 330/EUR).",
        alt_text="<b>1. Booking.com / Agoda Affiliate API:</b> Requires registered commercial business entity with minimum booking volumes; closed to academic projects.<br/>"
                 "<b>2. TripAdvisor RapidAPI:</b> Strict call limits (500/mo) and expensive tiering ($0.05/call thereafter).<br/>"
                 "<b>3. Google Places API:</b> Superb Sri Lankan coverage, but charges $17 to $32 per 1,000 calls for Place Details with contact/price data, posing high financial risk.",
        defense_tip="Explain that Amadeus was chosen because it represents standard aviation/hospitality enterprise architecture, and you compensated for rural sandbox limitations by pairing it with Gemini AI and local catalog fallbacks."
    ):
        story.append(item)

    # ---------------------------------------------------------
    # SECTION 4: EMERGENCY SOS & GEOSPATIAL TECHNOLOGIES
    # ---------------------------------------------------------
    story.append(Paragraph("4. Emergency SOS, OpenStreetMap Overpass API & W3C Geolocation", h1_style))

    for item in make_qa_box(
        q_num=4,
        category="Emergency SOS",
        question_text="How does the Emergency SOS Nearest Hospital Finder work? Why use OpenStreetMap Overpass API over Google Places?",
        answer_text="The Emergency SOS module (<b>EmergencySOSModal.jsx</b>) operates on a dual-trigger architecture:<br/>"
                    "1. <b>Default Mode:</b> Loads the trip's destination coordinates (e.g. Kandy: 7.2906, 80.6337) upon modal mount.<br/>"
                    "2. <b>Live GPS Mode:</b> If the user clicks the Auto-Detect button, the browser's <code>navigator.geolocation.getCurrentPosition()</code> triggers to query device hardware GPS.<br/>"
                    "Once coordinates are resolved, it submits an <b>Overpass QL</b> query to <code>https://overpass-api.de/api/interpreter</code> querying <code>node['amenity'='hospital'](around:20000, lat, lng)</code> (20 km radius). "
                    "The backend/frontend computes precise point-to-point distances using the <b>Haversine Great-Circle Formula</b>: "
                    "<code>d = 2R · arcsin(√(sin²(Δφ/2) + cos φ₁ · cos φ₂ · sin²(Δλ/2)))</code> and sorts facilities ascendingly.",
        pro_text="• <b>100% Free & Open Source:</b> No credit card, no billing, no restrictive API limits.<br/>"
                 "• <b>Comprehensive POI Data:</b> Excellent community-mapped data of Sri Lankan state hospitals (Suwa Seriya base hospitals, district general hospitals).<br/>"
                 "• <b>Hardware GPS Accuracy:</b> W3C Geolocation provides sub-10m real GPS accuracy outdoors.",
        con_text="• <b>Public Server Latency:</b> The community Overpass server (overpass-api.de) can take 2 to 6 seconds under peak load.<br/>"
                 "• <b>Browser Permission Dependency:</b> W3C Geolocation requires user permission and must be served over HTTPS in production.",
        alt_text="<b>1. Google Places Nearby Search API:</b> Ultra-fast and 99.99% uptime, but Google charges $32-$40 per 1,000 requests for places with contact numbers, which is cost-prohibitive.<br/>"
                 "<b>2. Mapbox Search API:</b> Good UI, but hospital amenity coverage in rural Sri Lanka is far inferior to OpenStreetMap.<br/>"
                 "<b>3. IP-based Geolocation (ipapi/ipinfo):</b> Completely inaccurate in Sri Lanka! Mobile IP addresses (Dialog/Mobitel) map cellular towers to Colombo even when the user is physically in Ella or Jaffna.",
        defense_tip="Emphasize why IP-based geolocation was REJECTED: cellular ISP routing in Sri Lanka makes IP geolocation useless for emergency medical dispatch, making hardware GPS the only viable choice."
    ):
        story.append(item)

    for item in make_qa_box(
        q_num=5,
        category="Emergency SOS Defense",
        question_text="Viva Trap Question: In a real life-or-death emergency, waiting 5 seconds for an Overpass API response is dangerous. How does TripMind mitigate this?",
        answer_text="We engineered a <b>Fail-Safe Regional Hospital Fallback Database (REGIONAL_HOSPITALS)</b> directly within <code>EmergencySOSModal.jsx</code>. "
                    "It pre-caches emergency contacts, direct phone numbers, and coordinates for major Sri Lankan medical hubs (National Hospital Colombo, Kandy Teaching Hospital, Karapitiya Galle, Weligama Base, Badulla Provincial, Dambulla Base). "
                    "If the Overpass API times out after 8 seconds (via <code>AbortController</code>) or encounters a network error, the app instantly and silently calculates Haversine distances to the pre-cached regional trauma centers, ensuring the user is never left without life-saving hotline and navigation access.",
        defense_tip="Showcase that you considered real-world life safety over blind API reliance. This proves mature software design thinking."
    ):
        story.append(item)

    # ---------------------------------------------------------
    # SECTION 5: MEDIA, PHOTOGRAPHY & MAPPING
    # ---------------------------------------------------------
    story.append(Paragraph("5. Media Services (Pexels, Wikimedia Commons) & Google Maps", h1_style))

    for item in make_qa_box(
        q_num=6,
        category="Photography & Media",
        question_text="How does the image pipeline work? Why use Pexels and Wikimedia Commons instead of Unsplash or Google Search API?",
        answer_text="TripMind uses a multi-tier image resolution architecture (<b>activityImageService.js</b>, <b>pexelsService.js</b>, <b>hotelImages.js</b>):<br/>"
                    "• <b>Tier 1 (Pexels API & CDN):</b> High-definition (1600px) landscape photos for generic outdoor activities (hiking, surfing, snorkeling, tea plantations). Employs an in-memory <code>Map</code> cache to minimize external network requests.<br/>"
                    "• <b>Tier 2 (Wikimedia Commons CDN):</b> Used for authentic, historical Sri Lankan heritage hotels (e.g., Queen's Hotel Kandy, Galle Face Hotel, Amangalla, Heritance Kandalama) where royalty-free, accurate architectural imagery is public domain.<br/>"
                    "• <b>Tier 3 (Local Public Assets):</b> High-speed static assets in <code>/public/images/activities/</code> ensuring offline availability.",
        pro_text="• <b>Zero Cost & Legal Compliance:</b> Both Pexels and Wikimedia Commons provide commercial-safe, royalty-free licensing without copyright risk.<br/>"
                 "• <b>High Quality CDN:</b> Direct CDN endpoints deliver pre-compressed, responsive WebP/JPEG assets.<br/>"
                 "• <b>In-Memory Caching:</b> Protects Pexels 200 req/hour limit by serving repeated queries from memory.",
        con_text="• <b>Generic Search Results:</b> Querying Pexels for 'Mirissa' may return generic tropical beaches rather than the specific Coconut Tree Hill landmark unless curated.",
        alt_text="<b>1. Unsplash API:</b> Strictly capped at 50 requests/hour for development apps (very easy to exhaust during testing).<br/>"
                 "<b>2. Google Custom Search / Image Search API:</b> Extremely strict free quota (100 queries/day total) and requires complex Google Cloud Programmable Search Engine setup.<br/>"
                 "<b>3. Storing All Images on Local Disk:</b> Bloats repository size and slows down initial web bundle delivery.",
        defense_tip="Highlight how using Wikimedia Commons solves the problem of finding exact photos of Sri Lankan heritage hotels that generic stock sites lack."
    ):
        story.append(item)

    for item in make_qa_box(
        q_num=7,
        category="Mapping Architecture",
        question_text="Why use Google Maps Embed and Deep-Linking URLs instead of installing Mapbox GL JS or the Google Maps JavaScript SDK?",
        answer_text="TripMind utilizes lightweight, zero-footprint Google Maps integration via iframe embeds (<code>https://maps.google.com/maps?q=...&output=embed</code>) and mobile universal deep links (<code>https://www.google.com/maps/dir/?api=1&destination=...</code>):<br/>"
                    "1. <b>Zero Bundle Bloat:</b> Full mapping SDKs (Mapbox GL JS or Google Maps JS SDK) add 800KB - 1.5MB of heavy JavaScript, significantly harming mobile performance and Lighthouse scores.<br/>"
                    "2. <b>Turn-by-Turn Mobile Integration:</b> Universal deep links trigger the native Google Maps app on iOS and Android devices, instantly launching real-time GPS voice navigation for the tourist.<br/>"
                    "3. <b>Cost & Billing Freedom:</b> Google Maps JavaScript SDK requires billing account linking and charges per dynamic map load, whereas standard iframe embeds and navigation intents are 100% free.",
        pro_text="• Instant native GPS navigation in the tourist's phone.<br/>• Zero impact on initial page load time.<br/>• Zero licensing cost or credit card requirement.",
        con_text="• Embedded iframes provide less custom pin clustering or interactive canvas drawing than a dedicated Mapbox canvas.",
        alt_text="<b>Mapbox GL JS:</b> Gorgeous vector styling, but requires WebGL rendering and adds significant JavaScript memory overhead on budget mobile smartphones.",
        defense_tip="Defend this as a deliberate UX optimization: tourists don't want to navigate inside a web browser; they want one click to open native Google Maps turn-by-turn navigation!"
    ):
        story.append(item)

    # ---------------------------------------------------------
    # SECTION 6: CORE STACK, SECURITY & DATABASE (MERN)
    # ---------------------------------------------------------
    story.append(Paragraph("6. Core Stack Architecture & Security (MERN, JWT, Bcrypt)", h1_style))

    for item in make_qa_box(
        q_num=8,
        category="Database & Stack",
        question_text="Why did you choose the MERN Stack (MongoDB, Express, React 19, Node.js) over SQL (PostgreSQL/MySQL) or Django/Next.js?",
        answer_text="The MERN stack was chosen specifically to handle the flexible, semi-structured nature of travel itineraries:<br/>"
                    "• <b>MongoDB / Mongoose (Document Model):</b> A trip itinerary contains nested arrays of dynamic length (Day 1, Day 2, Day N, activities, hotel recommendations, budget items). In Relational SQL, this requires 5+ joined tables (Trips, Days, Activities, Hotels, Budgets) and heavy foreign key queries. In MongoDB, an entire itinerary is stored naturally as an atomic, denormalized JSON document in a single collection.<br/>"
                    "• <b>Express 5 + Node.js (Asynchronous I/O):</b> Excellent non-blocking event-loop architecture, ideal for orchestrating multiple concurrent third-party HTTP requests (Gemini, Amadeus, Pexels) using <code>Promise.allSettled()</code>.<br/>"
                    "• <b>React 19 + Vite:</b> Ultra-fast Hot Module Replacement (HMR), component-driven state architecture, and modular client-side routing via React Router DOM v7.",
        pro_text="• <b>Single Language (JavaScript/Node.js):</b> Unified data serialization between MongoDB BSON, Express REST endpoints, and React frontend.<br/>"
                 "• <b>Schema Evolution:</b> Easy to add new fields (e.g., SOS emergency contacts or vehicle types) without executing complex SQL migration scripts.",
        con_text="• <b>No ACID Multi-Table Transactions by Default:</b> While MongoDB supports transactions, SQL is traditionally stronger for strict financial ledger systems.",
        alt_text="<b>1. PostgreSQL:</b> Superior for relational schemas, but adds ORM overhead (Prisma/TypeORM) for rapidly prototyping nested JSON itineraries.<br/>"
                 "<b>2. Next.js:</b> Great for SSR, but adds unnecessary server-side rendering complexity when TripMind is an authenticated single-page dashboard.",
        defense_tip="Explain how MongoDB's document model perfectly matches JSON-based travel itineraries without requiring complex SQL joins."
    ):
        story.append(item)

    for item in make_qa_box(
        q_num=9,
        category="Security & Auth",
        question_text="How is user security handled? Explain your JWT and Bcrypt implementation.",
        answer_text="Authentication is implemented via a stateless, cryptographically signed token architecture:<br/>"
                    "1. <b>Password Hashing (bcryptjs):</b> User passwords are never stored in plaintext. They are salted and hashed using bcrypt's adaptive key derivation function with 10 salt rounds (<code>await bcrypt.hash(password, 10)</code>), defending against rainbow table and brute-force attacks.<br/>"
                    "2. <b>Stateless JWT (jsonwebtoken):</b> Upon login, the server signs a JSON Web Token containing the user's ID, issued with an expiration time (e.g. 7 days) and signed using a secure secret (<code>process.env.JWT_SECRET</code>).<br/>"
                    "3. <b>Protected Route Middleware (authMiddleware.js):</b> Protected endpoints (such as saving trips or viewing personal trip history) verify the <code>Authorization: Bearer &lt;token&gt;</code> header before processing requests.",
        pro_text="• <b>Stateless Scalability:</b> The server does not store session states in memory, allowing easy horizontal scaling.<br/>"
                 "• <b>Cryptographic Tamper-Proofing:</b> Any alteration of user payload invalidates the digital signature.",
        con_text="• <b>Revocation Challenge:</b> Stateless JWTs cannot be instantly invalidated before expiration unless a token blacklist/Redis cache is implemented.",
        alt_text="<b>Stateful Express Sessions (express-session + Redis):</b> Stores session IDs in cookies and session data in Redis. Better for instant session invalidation, but introduces Redis infrastructure dependency and server memory overhead.",
        defense_tip="Mention that JWT was chosen for stateless RESTful compliance, allowing the backend API to easily support mobile apps in the future."
    ):
        story.append(item)

    # ---------------------------------------------------------
    # SECTION 7: VIVA DEFENSE "KILLER" QUESTIONS (TOP 10 RAPID DEFENSE)
    # ---------------------------------------------------------
    story.append(Paragraph("7. Top 10 High-Probability Viva Defense 'Killer' Questions", h1_style))
    story.append(Paragraph(
        "Examiners frequently test your deep technical comprehension by asking edge-case, architectural trade-off, and security questions. "
        "Below are model rapid answers formulated to earn top marks.",
        ans_style
    ))
    story.append(Spacer(1, 4))

    viva_rapid_qa = [
        ("V1", "Why did you use React 19 and Vite instead of Create React App (CRA)?",
         "Create React App is officially deprecated by the React team. It relies on Webpack, which is notoriously slow in large builds. Vite uses Rollup and native ES Modules with esbuild, resulting in 10x-20x faster build times, instant Hot Module Replacement (HMR), and much smaller production bundle sizes."),

        ("V2", "How do you secure your API keys (Gemini, Amadeus, Pexels) in production?",
         "All API keys are strictly quarantined in server-side environment variables via dotenv (.env) and never exposed to the frontend bundle. The frontend only talks to our Express backend; our backend acts as a secure proxy that signs and executes third-party requests."),

        ("V3", "What is the difference between synchronous and asynchronous operations in your backend?",
         "Synchronous code blocks the Node.js single-threaded event loop. In TripMind, all external API calls (Gemini, Amadeus, MongoDB queries) are strictly asynchronous using async/await and Promises, allowing Node.js to handle hundreds of concurrent user sessions without freezing."),

        ("V4", "Why does your Haversine formula use 6371 as a constant?",
         "6371 represents the mean volumetric radius of the Earth in kilometers. The Haversine formula calculates the great-circle distance between two coordinate pairs on a spherical surface, which is essential for sorting nearest hospitals accurately."),

        ("V5", "What happens if a user submits an unknown destination not in your database?",
         "TripMind handles this through a 2-tier fallback: First, Gemini AI is queried to dynamically research the unknown location. If offline, the system falls back to a generalized Sri Lanka national safety and travel dataset, preventing 404 crashes."),

        ("V6", "How do you prevent Cross-Origin Resource Sharing (CORS) errors between frontend and backend?",
         "We configured the 'cors' middleware in Express (server.js), explicitly defining allowed origins, HTTP methods (GET, POST, PUT, DELETE), and Authorization headers, preventing browser security blocks while maintaining domain safety."),

        ("V7", "Why did you store budget calculations on both the frontend and backend?",
         "The backend verifies and recalculates total budget bounds to prevent malicious client tampering with pricing payloads, while the frontend calculates dynamic estimates for immediate, interactive UI responsiveness."),

        ("V8", "Why did you choose OAuth 2.0 Client Credentials for Amadeus instead of simple API keys?",
         "Amadeus requires the OAuth 2.0 Client Credentials flow because it is an enterprise B2B standard. It issues short-lived bearer tokens (1799 seconds) rather than static keys, ensuring high security and automatic authorization rotation."),

        ("V9", "How do you handle mobile responsiveness and offline connectivity for tourists?",
         "The UI is built with CSS Flexbox/Grid and responsive breakpoints. Additionally, crucial regional emergency data and hospital contacts are bundled in the client code, so vital phone numbers remain visible even if mobile signal drops in remote areas."),

        ("V10", "If you had 3 more months to improve this project, what would be the #1 architectural enhancement?",
         "I would implement Redis caching for repeated Gemini AI itineraries and Overpass hospital queries, and integrate a WebSocket (Socket.io) pipeline for real-time live tourist tracking and automated SMS emergency dispatch via Twilio.")
    ]

    for code, q, a in viva_rapid_qa:
        row_content = [
            Paragraph(f"<b>{code}</b>", table_cell_bold),
            Paragraph(f"<b>{q}</b><br/>{a}", table_cell)
        ]
        t_row = Table([row_content], colWidths=[35, 497])
        t_row.setStyle(TableStyle([
            ('BACKGROUND', (0,0), (-1,-1), colors.HexColor("#F8FAFC")),
            ('BOX', (0,0), (-1,-1), 0.5, colors.HexColor("#CBD5E1")),
            ('VALIGN', (0,0), (-1,-1), 'TOP'),
            ('TOPPADDING', (0,0), (-1,-1), 3),
            ('BOTTOMPADDING', (0,0), (-1,-1), 3),
            ('LEFTPADDING', (0,0), (-1,-1), 6),
            ('RIGHTPADDING', (0,0), (-1,-1), 6),
        ]))
        story.append(t_row)
        story.append(Spacer(1, 3))

    story.append(Spacer(1, 8))

    # ---------------------------------------------------------
    # SECTION 8: SUMMARY COMPARISON MATRIX
    # ---------------------------------------------------------
    story.append(Paragraph("8. Master Architectural Trade-Off Matrix", h1_style))

    matrix_data = [
        [
            Paragraph("Category", table_header),
            Paragraph("Selected Technology", table_header),
            Paragraph("Rejected Alternative", table_header),
            Paragraph("Primary Reason for Decision", table_header)
        ],
        [
            Paragraph("<b>Generative AI</b>", table_cell_bold),
            Paragraph("Google Gemini 2.5 / 1.5", table_cell),
            Paragraph("OpenAI GPT-4o / Claude 3.5", table_cell),
            Paragraph("Gemini offers a high-capability free developer tier with zero upfront credit card billing in Sri Lanka.", table_cell)
        ],
        [
            Paragraph("<b>Hospitality API</b>", table_cell_bold),
            Paragraph("Amadeus Self-Service", table_cell),
            Paragraph("Google Places API", table_cell),
            Paragraph("Google charges $17-$32/1k calls for place details; Amadeus offers 2,000 free monthly calls with enterprise OAuth 2.0.", table_cell)
        ],
        [
            Paragraph("<b>Emergency SOS</b>", table_cell_bold),
            Paragraph("OpenStreetMap Overpass", table_cell),
            Paragraph("IP Geolocation APIs", table_cell),
            Paragraph("Sri Lankan mobile cellular IPs route through Colombo towers; Overpass + device GPS provides true local accuracy for free.", table_cell)
        ],
        [
            Paragraph("<b>Stock Photography</b>", table_cell_bold),
            Paragraph("Pexels API + Wikimedia", table_cell),
            Paragraph("Unsplash API", table_cell),
            Paragraph("Unsplash has a strict 50 req/hr cap; Pexels provides 200/hr + CDN caching, and Wikimedia offers public-domain heritage photos.", table_cell)
        ],
        [
            Paragraph("<b>Maps & Routing</b>", table_cell_bold),
            Paragraph("Google Maps Embed/Deep-Link", table_cell),
            Paragraph("Mapbox GL JS SDK", table_cell),
            Paragraph("Deep links trigger native mobile GPS navigation with 0KB JavaScript bundle bloat and zero API subscription costs.", table_cell)
        ],
        [
            Paragraph("<b>Database</b>", table_cell_bold),
            Paragraph("MongoDB Atlas (Mongoose)", table_cell),
            Paragraph("PostgreSQL / MySQL", table_cell),
            Paragraph("Flexible JSON document storage eliminates complex 5-table relational joins for nested, multi-day travel itineraries.", table_cell)
        ]
    ]

    t_matrix = Table(matrix_data, colWidths=[85, 110, 110, 227])
    t_matrix.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), primary_color),
        ('GRID', (0,0), (-1,-1), 0.5, table_border),
        ('VALIGN', (0,0), (-1,-1), 'TOP'),
        ('TOPPADDING', (0,0), (-1,-1), 4),
        ('BOTTOMPADDING', (0,0), (-1,-1), 4),
        ('LEFTPADDING', (0,0), (-1,-1), 5),
        ('RIGHTPADDING', (0,0), (-1,-1), 5),
        ('ROWBACKGROUNDS', (0,1), (-1,-1), [colors.white, colors.HexColor("#F8FAFC")]),
    ]))
    story.append(t_matrix)

    # Build document
    doc.build(story, canvasmaker=NumberedCanvas)
    print(f"Successfully generated {filename}")

if __name__ == "__main__":
    target_path = r"C:\Users\thaks\OneDrive\Desktop\new edition\TripMind\TripMind_APIs_Features_Viva_Guide.pdf"
    build_pdf(target_path)
