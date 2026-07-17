FORMAT & PRESENTATION RULES (APPLY TO YOUR ENTIRE RESPONSE)

Executive Summary First: Begin with a “⚡ EXECUTIVE SUMMARY” box containing exactly 3 bullet points: the single most important accounting distortion, the most underappreciated qualitative insight, and the highest-conviction anomaly vs. peers.

Callout Boxes: At the end of every major section, add a “🔎 KEY TAKEAWAY” box (one to two lines in bold) that crystallizes the one thing that must be remembered. Use markdown blockquotes (the `>` symbol) EXCLUSIVELY for these Callout Boxes. DO NOT use `>` for regular lists, numbers, or standard text.

Tables Over Text: For comparisons, accounting policies, and peer divergences, always use a markdown table (columns: Item, [Company], [Peer 1], [Peer 2], Insight). Never bury comparative data in paragraphs.

Bold Key Figures & Signals: Every time you present a normalized metric, a red flag, or a critical anomaly, bold it. Prefix red flags with 🚩, hidden assets with 💎, and accounting distortions with ⚠️.

Bulleted Insights Only: No paragraph longer than 3 sentences. Use short, bullet-point style sentences that get straight to the point.

Cite Sources & Dates: ALWAYS specify the source of your data and the timeframe/date (e.g., "According to 2023 World Bank data...", "Based on recent EDGAR filings...", "yfinance trailing EPS..."). Never present a number without its context.

Consistent Heading Hierarchy: Use exactly the numbered headings I provide below. You MUST format them as markdown level 2 headings (e.g. `## 1. SECTOR DYNAMICS & UNSPOKEN TRUTHS`). Make sub-points with bold titles and then bullets.

Visual Separation: Use a --- line between major sections.

Interactive Charts: Whenever you have multi-year or multi-period data (revenue, margins, cash flow, EPS, debt, etc.), you MUST output an interactive chart using this EXACT format immediately after the relevant paragraph or table. The chart REPLACES a static table for time-series data. Use the JSON schema below precisely inside a markdown code block with the language `chart`:

```chart
{
  "title": "A clear, insight-driven title for this chart",
  "subtitle": "A one-line explanation of what this shows",
  "type": "bar" | "line" | "composed",
  "data": [
    { "name": "FY2020", "Revenue": 100, "Net Income": 20 },
    { "name": "FY2021", "Revenue": 130, "Net Income": 25 }
  ],
  "series": [
    { "key": "Revenue", "type": "bar", "color": "#60a5fa" },
    { "key": "Net Income", "type": "line", "color": "#a78bfa" }
  ],
  "yAxisLabel": "USD billions",
  "source": "Source: yfinance / EDGAR 10-K"
}
```
Rules for charts:

"type": "composed" allows mixing bars and lines in the same chart (e.g., absolute values as bars, ratios/percentages as a line).

Use "bar" for single metric comparisons, "line" for trend-only data, "composed" for dual-metric insights.

Data keys in "series" must exactly match keys in "data" objects.

Include at least 3 and at most 8 data points per chart.

Always include a "source" field citing where the numbers came from.

Emit 2–4 charts across the full report for the most impactful metrics (revenue trend, margin evolution, peer comparison, cash flow). Do not overuse.

By following these rules, your output will be instantly understood by a time-constrained professional and will clearly trace facts back to their source.

0. ACCOUNTING LENS & NORMALIZATION (MUST BE PRESENTED FIRST)
Immediately flag any material distortions in [Company]’s reported financials (and those of the auto-selected peers) that stem from accounting principles. Quantify their impact where possible. This lens must color everything that follows.

Capitalization vs. expensing policies (R&D, software, customer acquisition costs) and how they artificially inflate margins or ROIC.

Revenue recognition (gross vs. net, long-term contracts, bill-and-hold) and its effect on growth quality.

Non-GAAP adjustments: identify the ones that genuinely reflect recurring economics vs. those that mask structural costs (e.g., “adjusted” SBC, restructuring charges that repeat).

Lease, pension, or off-balance-sheet items that distort leverage and capital turns.

M&A accounting: earnouts, contingent consideration, purchase price allocation, and hidden “cookie jar” reserves.

For each distortion, explain how the economic reality differs and state the normalized metric you’ll use in the rest of the analysis.

1. SECTOR DYNAMICS & UNSPOKEN TRUTHS
Reveal the qualitative and structural forces shaping the industry that most analyses overlook.

Value chain power shifts: Who is truly capturing the economics—suppliers, customers, a hidden intermediary? Identify margin squeeze or expansion points that are not obvious from aggregate data.

Disruption vectors: Technologies, business models, or regulatory changes that are currently under the surface but will re-draw competitive boundaries within 3–5 years.

Misdiagnosed growth: Distinguish between sector tailwinds that flatter all players and genuine company-specific superiority. Which “growth” is merely cyclical or passive?

Ecosystem dependencies: Hidden single points of failure (e.g., one key supplier, one platform, one customer segment) that traditional sector maps miss.

2. COMPANY DEEP DIVE: QUALITY, MOAT & HIDDEN RISKS
Go beyond ratios. Dissect the economic engine.

True return on incremental invested capital (ROIIC): Strip out accounting noise. Is growth creating value or destroying it? How much of historical returns came from multiple expansion or financial engineering vs. operational excellence?

Unit economics deconstruction: If the business has a unit (subscriber, order, vehicle, square foot), derive implied unit CAC, churn, LTV, and payback using reported data and footnotes. Highlight divergence between headline revenue growth and unit profitability.

Cash flow quality forensics: Analyze the divergence between GAAP operating cash flow and true free cash flow available to equity, adjusting for stock-based compensation (is it real cash?), capitalized intangibles, and abnormal working capital swings. Is conversion accelerating or decelerating, and why?

Management signal analysis: Based on language in earnings calls, shareholder letters, and footnotes (tone, shifts in emphasis, changes in incentive metrics), infer what management truly believes and where they may be masking concern.

Hidden liabilities & assets: Underfunded pensions, litigation quality, “other” line items in the balance sheet that have grown disproportionately, or intellectual property that is undervalued because it’s internally generated.

3. PEER RELATIVE ANOMALIES & DIVERGENCE ANALYSIS
Compare [Company] against the auto-selected peers on normalized, non-obvious dimensions.

Adjusted performance surface: Plot peers on dimensions like “organic growth quality vs. economic ROIC” rather than headline P/E. Which company’s valuation multiple embeds a growth expectation that is mathematically impossible given their reinvestment rate and returns?

Accounting policy divergence table: Explicitly list where [Company] and peers use different policies (e.g., FIFO vs. LIFO, capex vs. opex for software, different depreciation lives) and the quantified impact on relative margins, ROA, and leverage. Who looks best only because of accounting?

Capital allocation pattern recognition: Over the last 5 years, map each company’s use of cash flow (capex, R&D, M&A, buybacks, dividends). Identify the contrarian allocator. Who is overpaying for M&A? Who is underinvesting for future growth?

Efficiency frontier contradictions: Find the company that seems to violate the trade-off between growth and profitability. Is it a genuine outlier or a temporary artifact of accounting/sector cycle? Deconstruct the anomaly.

4. FORWARD-LOOKING SIGNALS & ASYMMETRY IDENTIFICATION
Project 12–24 months ahead, focusing on what is mispriced.

Earnings revision catalysts: Spot the unreported leading indicator (internal KPIs you can back-calculate, supplier commentary, patent filings, hiring trends) that will drive the next 3 earnings revisions.

Bull & Bear Base Rates: Not just scenarios, but assign rough probabilities to non-consensus outcomes based on historical analogs and current setup. Where is the distribution of outcomes unusually fat-tailed?

Balance-sheet optionality: Does the company have latent capacity (underlevered balance sheet, hidden real estate, non-core assets) that can be unlocked in a specific scenario?

Red flag that would break the thesis: What single data point, if it appeared, would invalidate the entire long or short case for this company relative to peers?

5. SYNTHESIS: THE ONE-PAGER NO ONE ELSE HAS
Deliver a concise, integrative conclusion:

The single most misunderstood number in [Company]’s story (and why).

The one qualitative factor (cultural, regulatory, competitive) that quant models cannot capture.

The most dangerous consensus belief to bet against.

The “anomaly pair trade” insight: Which peer would you pair against [Company] in a long/short book to isolate a specific mispricing factor?

6. SYSTEMIC CONTRADICTIONS & ABSTRACTION LENS
Task: Analyze the provided information (financial statements, text, system descriptions) through a systems-thinking lens to extract non-obvious patterns, systemic contradictions, and counterintuitive insights that challenge the superficial narrative.

Approach: Look for divergences (variables moving in opposite directions), contrast the headline story with underlying structural mechanics, and identify feedback loops or paradoxes. Focus on insights not already captured by the earlier sections.

Output Formatting Requirements (For this section):

Present the findings as numbered "Insights."

Give each insight a bold, descriptive headline summarizing the core strategic takeaway.

Back up every claim with specific data points, quotes, or logical proofs directly extracted from the provided source material.

Conclude this section with a concise "Summary of Hidden Patterns" markdown table mapping the specific observation to its broader strategic meaning.

7. UNCHARTED TERRITORY: AI'S FREE-CHOICE INSIGHT
Now, present any additional, non-obvious insight of your choosing that is not covered above but squarely falls under “not visible to the naked eye,” forward-thinking, and expert-level. You have complete freedom in format and label (give this section a creative, descriptive title that fits the insight). This could be:

A wildcard risk or opportunity that no consensus model captures.

A hidden operational or cultural link that explains performance better than financials.

A narrative that connects seemingly unrelated data points into an investable thesis.

A description of an unusual pattern you’ve noticed (without needing to reference any specific dataset names).
Maintain clarity and bold any key revelations, but beyond that, the structure is yours.

