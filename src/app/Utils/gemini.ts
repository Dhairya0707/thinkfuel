import { GoogleGenerativeAI } from "@google/generative-ai";

// Initialize the Gemini API with your API key
const genAI = new GoogleGenerativeAI("your_key here");

// System prompt for idea generation
// const IDEA_GENERATION_PROMPT = `You are an expert idea generator and business consultant. Your task is to generate detailed, innovative business ideas based on the given area and subcategory.

// Generate a comprehensive analysis of the idea in HTML format that is compatible with TipTap editor. Use the following structure with emojis for better visual appeal:

// <h1>🚀 [Idea Name]</h1>

// <h2>🎯 Problem Statement</h2>
// <p>[Describe the problem or need this idea addresses]</p>

// <h2>💡 Solution Overview</h2>
// <p>[Detailed description of the solution]</p>

// <h2>👥 Target Market</h2>
// <ul>
//   <li>🎯 Primary audience</li>
//   <li>📊 Market size and potential</li>
//   <li>👤 Key demographics</li>
// </ul>

// <h2>⚙️ Technical Stack</h2>
// <ul>
//   <li>🎨 Frontend technologies</li>
//   <li>🔧 Backend technologies</li>
//   <li>☁️ Infrastructure requirements</li>
//   <li>🔌 Third-party integrations</li>
// </ul>

// <h2>✨ Key Features</h2>
// <ol>
//   <li>[Feature 1]</li>
//   <li>[Feature 2]</li>
//   <li>[Feature 3]</li>
// </ol>

// <h2>💰 Monetization Strategy</h2>
// <ul>
//   <li>💵 Primary revenue streams</li>
//   <li>🏷️ Pricing models</li>
//   <li>💎 Additional revenue opportunities</li>
// </ul>

// <h2>🏆 Competitive Advantage</h2>
// <ul>
//   <li>⭐ Unique selling points</li>
//   <li>🎯 Market differentiation</li>
//   <li>🛡️ Barriers to entry</li>
// </ul>

// <h2>⚠️ Implementation Challenges</h2>
// <ul>
//   <li>🔧 Technical challenges</li>
//   <li>🌊 Market challenges</li>
//   <li>📦 Resource requirements</li>
// </ul>

// <h2>📈 Success Metrics</h2>
// <ul>
//   <li>📊 Key performance indicators</li>
//   <li>🎯 Growth targets</li>
//   <li>🏆 Milestones</li>
// </ul>

// <h2>📋 Next Steps</h2>
// <ul>
//   <li>⚡ Immediate actions</li>
//   <li>🎯 Short-term goals</li>
//   <li>🔮 Long-term vision</li>
// </ul>

// do not bound yourself just get best output results this is just demo but follow the formate according to the current situtuion for best results

// Make the analysis detailed and practical, focusing on real-world implementation and market potential. Use proper HTML tags and formatting that is compatible with TipTap editor. Keep the points concise and impactful.`;

const IDEA_GENERATION_PROMPT = `You are an expert idea generator, business consultant, and product strategist. Based on the provided area and subcategory, generate an original, innovative, and practical business idea that has strong real-world potential.

Present the idea as a comprehensive HTML document suitable for rendering in a TipTap editor. Use well-structured HTML with semantic tags and emoji-enhanced headings for visual engagement.

⚠️ IMPORTANT:
- While the following format is a guideline, you are free to adapt the structure, merge sections, or emphasize different aspects based on the situation.
- Think creatively, like a real founder brainstorming with investors or customers.
- Your priority is clarity, uniqueness, feasibility, and presentation quality.
- Use clean, valid HTML. Avoid markdown or code fences.

### 📄 Recommended (Flexible) Structure:

<h1>🚀 [Idea Name]</h1>

<h2>🎯 Problem Statement</h2>
<p>[Clearly define the problem or unmet need in the chosen area]</p>

<h2>💡 Solution Overview</h2>
<p>[Describe your innovative and practical solution]</p>

<h2>👥 Target Market</h2>
<ul>
  <li>🎯 Primary audience</li>
  <li>📊 Market size and opportunity</li>
  <li>🧠 User personas (if helpful)</li>
</ul>

<h2>⚙️ Tech Stack</h2>
<ul>
  <li>Frontend technologies</li>
  <li>Backend technologies</li>
  <li>Infra & APIs</li>
</ul>

<h2>✨ Key Features</h2>
<ol>
  <li>Feature 1</li>
  <li>Feature 2</li>
  <li>Feature 3</li>
</ol>

<h2>💰 Revenue Model</h2>
<ul>
  <li>Monetization method(s)</li>
  <li>Pricing strategy</li>
</ul>

<h2>🏆 Competitive Edge</h2>
<ul>
  <li>What makes it different or better</li>
  <li>Barriers to entry</li>
</ul>

<h2>⚠️ Implementation Considerations</h2>
<ul>
  <li>Challenges & solutions</li>
  <li>Resource needs</li>
</ul>

<h2>📈 Success Metrics</h2>
<ul>
  <li>KPIs</li>
  <li>Milestones</li>
</ul>

<h2>📋 Suggested Roadmap</h2>
<ul>
  <li>Short-term goals</li>
  <li>Long-term vision</li>
</ul>

✅ You are NOT required to strictly follow this structure. If the context calls for a different approach, adapt creatively — merge, split, or rename sections as needed. The final goal is a professional, creative, and actionable idea presentation.

Keep the tone professional yet friendly. Use concise, impactful writing.`;

export async function generateIdeas(
  area: string,
  subcategory: string,
  additionalContext: string = ""
) {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    const prompt = `${IDEA_GENERATION_PROMPT}

Area: ${area}
Subcategory: ${subcategory}
${additionalContext ? `Additional Context: ${additionalContext}` : ""}

Generate ONE detailed business idea that combines the area and subcategory. Focus on depth and practicality. Make sure to provide comprehensive analysis for each section.  `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // Clean up the response by removing markdown code block markers
    const cleanedText = text.replace(/```html\n?|\n?```/g, "").trim();

    // Return a single idea
    return [cleanedText];
  } catch (error) {
    console.error("Error generating ideas:", error);
    throw new Error("Failed to generate ideas");
  }
}
