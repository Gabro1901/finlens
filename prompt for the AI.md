FORMAT & PRESENTATION RULES (APPLY TO YOUR ENTIRE RESPONSE)

Analytical Neutrality Directive: Throughout this analysis, maintain strict intellectual neutrality. Be equally rigorous in identifying downside risks and upside opportunities. Do not default to a constructive, skeptical, or contrarian tone. When consensus is correct, say so. When reality is more nuanced than consensus, explain in which direction and by how much. The goal is accuracy, not novelty. It is acceptable — and preferred — to conclude "no compelling mispricing exists," "the data is insufficient to draw this conclusion," or "this company is fairly valued" when the evidence supports that. Never manufacture a finding, anomaly, or trade idea to fill a section.

Calibration Anchor: Your analytical starting point should be that the market's current valuation approximately reflects available information, and that the company is roughly fairly valued. Deviations from this baseline — in either direction — require specific, well-evidenced justification. The burden of proof lies on the claim that something is mispriced, not on the claim that it is fairly priced.

Executive Summary First: Begin with a "⚡ EXECUTIVE SUMMARY" box containing exactly 3 bullet points: the single most important accounting distortion, the most underappreciated qualitative insight, and the highest-conviction anomaly vs. peers (if one exists; otherwise, state that no material anomaly was identified).

Callout Boxes: At the end of every major section, add a "🔎 KEY TAKEAWAY" box (one to two lines in bold) that crystallizes the one thing that must be remembered. Use markdown blockquotes (the `>` symbol) EXCLUSIVELY for these Callout Boxes. DO NOT use `>` for regular lists, numbers, or standard text.

Tables Over Text: For comparisons, accounting policies, and peer divergences, always use a markdown table (columns: Item, [Company], [Peer 1], [Peer 2], Insight). Never bury comparative data in paragraphs.

Bold Key Figures & Signals: Every time you present a normalized metric, a red flag, or a critical anomaly, bold it. Prefix red flags with 🚩, hidden assets with 💎, hidden liabilities with ⚠️, and accounting distortions (whether aggressive or conservative) with 📐.

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

COMPANY OVERVIEW & STOCK PERFORMANCE (MUST BE PRESENTED BEFORE THE EXECUTIVE SUMMARY)
Provide a brief, summarizing presentation of the company and its core business based on the company description provided.
Immediately following this summary, you MUST output an interactive chart showing the 5-year stock price history using the `chart` format provided. Use a "line" chart for the stock price.

0. ACCOUNTING LENS & NORMALIZATION (MUST BE PRESENTED FIRST)
Assess whether material distortions exist in [Company]'s reported financials (and those of the auto-selected peers) that stem from accounting principles. If no material distortions are present, state that clearly and move on. Distortions can cut both ways — aggressive policies inflate results, while conservative policies may understate them. Quantify their impact where possible. This lens must color everything that follows.

Capitalization vs. expensing policies (R&D, software, customer acquisition costs) and how they artificially inflate or deflate margins or ROIC. Note where a company expenses items that create durable long-term assets, as this may understate true economic earnings.

Revenue recognition (gross vs. net, long-term contracts, bill-and-hold) and its effect on growth quality.

Non-GAAP adjustments: identify the ones that genuinely reflect recurring economics vs. those that mask structural costs (e.g., "adjusted" SBC, restructuring charges that repeat). Also note where GAAP itself may paint an overly pessimistic picture (e.g., heavy non-cash charges on a cash-generative business).

Lease, pension, or off-balance-sheet items that distort leverage and capital turns.

M&A accounting: earnouts, contingent consideration, purchase price allocation, and hidden "cookie jar" reserves.

For each distortion, explain how the economic reality differs — whether it is better or worse than reported — and state the normalized metric you'll use in the rest of the analysis.

1. SECTOR DYNAMICS & UNSPOKEN TRUTHS
Reveal the qualitative and structural forces shaping the industry that most analyses overlook.

Value chain power shifts: Who is truly capturing the economics—suppliers, customers, a hidden intermediary? Identify margin squeeze or expansion points that are not obvious from aggregate data.

Disruption vectors: Technologies, business models, or regulatory changes that are currently under the surface but will re-draw competitive boundaries within 3–5 years.

Misdiagnosed growth or decline: Distinguish between sector tailwinds that flatter all players and genuine company-specific superiority. Which "growth" is merely cyclical or passive? Equally, identify where the market may be dismissing genuine company-specific strength as merely cyclical, or where temporary headwinds are being mistaken for structural decline.

Ecosystem dependencies: Hidden single points of failure (e.g., one key supplier, one platform, one customer segment) that traditional sector maps miss.

2. COMPANY DEEP DIVE: QUALITY, MOAT & HIDDEN RISKS
Go beyond ratios. Dissect the economic engine.

True return on invested capital (ROIC) proxy & Cash Conversion: Interpret the ROIC proxy, accruals ratio, and CapEx intensity provided in the Normalized Accounting section. Is growth creating value or destroying it? How much of historical returns came from multiple expansion or financial engineering vs. operational excellence? Do not attempt to calculate these metrics from raw tables.

Unit economics insights: If the business has a unit (subscriber, order, vehicle, square foot), extract qualitative insights from the MD&A text regarding CAC, churn, LTV, and payback trends. Highlight divergence between headline revenue growth and unit profitability without attempting to mathematically derive them from non-existent data.

Cash flow quality forensics: Interpret the FCF Conversion Ratio provided in the Normalized Accounting section. Is conversion accelerating or decelerating, and why? Rely on the provided metrics and accounting adjustments to evaluate cash flow quality rather than doing arithmetic from raw tables.

Management signal analysis: Based on language in earnings calls, shareholder letters, and footnotes (tone, shifts in emphasis, changes in incentive metrics), infer what management truly believes and where they may be masking concern or understating positive developments.

Hidden liabilities & assets: Underfunded pensions, litigation quality, "other" line items in the balance sheet that have grown disproportionately, or intellectual property that is undervalued because it's internally generated. Evaluate both directions: liabilities that could crystallize unexpectedly AND assets that are carried at zero or far below fair value.

3. PEER RELATIVE ANOMALIES & DIVERGENCE ANALYSIS
Compare [Company] against the auto-selected peers on normalized, non-obvious dimensions.

Adjusted performance surface: Plot peers on dimensions like "organic growth quality vs. economic ROIC" rather than headline P/E. Which company's valuation multiple embeds a growth expectation that is mathematically impossible given their reinvestment rate and returns? Conversely, which company's multiple embeds an expectation that is far too pessimistic relative to its demonstrated fundamentals?

Accounting policy divergence table: Explicitly list where [Company] and peers use different policies (e.g., FIFO vs. LIFO, capex vs. opex for software, different depreciation lives) and the quantified impact on relative margins, ROA, and leverage. Who looks best only because of accounting, and who looks worst only because of accounting?

Capital allocation pattern recognition: Over the last 5 years, map each company's use of cash flow (capex, R&D, M&A, buybacks, dividends). Identify the contrarian allocator. Who is overpaying for M&A? Who is underinvesting for future growth? Conversely, which acquisitions have been genuinely accretive or strategically transformative, and whose organic reinvestment is bearing fruit that the market undervalues?

Efficiency frontier contradictions: Find the company that seems to violate the trade-off between growth and profitability. Is it a genuine outlier driven by structural competitive advantage, or a temporary artifact of aggressive accounting, unsustainable margins, or cyclical peak earnings? Deconstruct the anomaly with evidence.

4. FORWARD-LOOKING SIGNALS & ASYMMETRY IDENTIFICATION
Project 12–24 months ahead, focusing on what is mispriced.

Earnings revision & consensus trends: Analyze the provided Analyst Consensus & Estimates tables (if available). How do forward revenue and EPS estimates compare to historical growth? Are expectations overly optimistic or pessimistic given the macro and qualitative signals?

Bear & Bull Base Rates: Not just scenarios, but assign rough probabilities to non-consensus outcomes based on historical analogs and current setup. Develop the bear case with equal depth and specificity as the bull case. Where is the distribution of outcomes unusually fat-tailed, and in which direction?

Balance-sheet optionality & vulnerability: Does the company have latent capacity (underlevered balance sheet, hidden real estate, non-core assets) that can be unlocked in a specific scenario? Equally, does it carry latent liabilities, contingent exposures, or off-balance-sheet risks that could crystallize under stress (e.g., guarantees, variable-interest entities, pending litigation, regulatory fines)?

Red flag that would break the thesis: What single data point, if it appeared, would invalidate the entire long case for this company relative to peers? And what single data point would invalidate the bear case?

Analyst Consensus vs. Reality: Compare the provided target prices and recent analyst ratings (upgrades/downgrades) against your findings. Is the street consensus missing something, or are they spot on? If consensus is correct, say so explicitly rather than manufacturing a contrarian take.

5. SYNTHESIS: THE MOST IMPORTANT CONCLUSIONS
Deliver a concise, integrative conclusion — whether novel or consensus-confirming:

The single most misunderstood number in [Company]'s story — whether the market is overestimating or underestimating it — and why.

The one qualitative factor (cultural, regulatory, competitive) that quant models cannot capture.

The most dangerous consensus belief — whether bullish or bearish — and the evidence that challenges it.

Relative value assessment: Evaluate whether a genuine mispricing exists between [Company] and its peers. If — and only if — the evidence supports one, construct a long/short pair trade to isolate the specific factor, being explicit about which side [Company] falls on and why. If no compelling mispricing exists, state that explicitly. Do not construct a trade idea to fill this section.

6. SYSTEMIC CONTRADICTIONS & ABSTRACTION LENS
Task: Analyze the provided information (financial statements, text, system descriptions) through a systems-thinking lens to extract non-obvious patterns, systemic contradictions, and counterintuitive insights that challenge the superficial narrative.

Approach: Look for divergences (variables moving in opposite directions), contrast the headline story with underlying structural mechanics, and identify feedback loops or paradoxes. Also look for underappreciated coherences — where multiple data points quietly reinforce a thesis that the market hasn't fully priced. Focus on insights not already captured by the earlier sections.

Output Formatting Requirements (For this section):

Present the findings as numbered "Insights."

Give each insight a bold, descriptive headline summarizing the core strategic takeaway.

Back up every claim with specific data points, quotes, or logical proofs directly extracted from the provided source material.

Conclude this section with a concise "Summary of Hidden Patterns" markdown table mapping the specific observation to its broader strategic meaning.

7. ADDITIONAL ANALYSIS: AI'S FREE-CHOICE INSIGHT
If — after completing all prior sections — you have identified an additional insight that is not already covered above, present it here. This should be a genuinely material observation, not a forced novelty. You have complete freedom in format and label (give this section a descriptive title that fits the insight). This could be:

A wildcard risk or opportunity that no consensus model captures.

A hidden operational or cultural link that explains performance — or underperformance — better than financials.

A narrative that connects seemingly unrelated data points into an investable thesis, whether long or short.

A description of an unusual pattern you've noticed (without needing to reference any specific dataset names).
Maintain clarity and bold any key revelations, but beyond that, the structure is yours. If no genuinely non-obvious insight emerges from the data, state that plainly. Do not fabricate novelty or force a contrarian take for its own sake.
