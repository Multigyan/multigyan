/**
 * Content Templates Library
 * 
 * Pre-structured templates to help users create different types of content
 * Templates include: How-To Guide, Listicle, Tutorial, Product Review, Comparison
 */

export const templates = {
    howTo: {
        id: 'howTo',
        name: 'How-To Guide',
        description: 'Step-by-step instructions to accomplish a task',
        icon: 'BookOpen',
        category: 'Educational',
        content: `<h2>Introduction</h2>
<p>Briefly explain what readers will learn and why it's useful...</p>

<h2>What You'll Need</h2>
<ul>
  <li>Item or tool 1</li>
  <li>Item or tool 2</li>
  <li>Item or tool 3</li>
</ul>

<h2>Step-by-Step Instructions</h2>

<h3>Step 1: [First Step Title]</h3>
<p>Detailed instructions for the first step...</p>

<h3>Step 2: [Second Step Title]</h3>
<p>Detailed instructions for the second step...</p>

<h3>Step 3: [Third Step Title]</h3>
<p>Detailed instructions for the third step...</p>

<h2>Tips & Best Practices</h2>
<ul>
  <li>Helpful tip 1</li>
  <li>Helpful tip 2</li>
  <li>Common mistake to avoid</li>
</ul>

<h2>Conclusion</h2>
<p>Summarize what was accomplished and next steps...</p>`
    },

    listicle: {
        id: 'listicle',
        name: 'Listicle (Top 10...)',
        description: 'Numbered list of items, tips, or recommendations',
        icon: 'List',
        category: 'Engaging',
        content: `<h2>Introduction</h2>
<p>Hook your readers with why this list matters...</p>

<h2>1. [First Item Title]</h2>
<p>Description and explanation of the first item...</p>

<h2>2. [Second Item Title]</h2>
<p>Description and explanation of the second item...</p>

<h2>3. [Third Item Title]</h2>
<p>Description and explanation of the third item...</p>

<h2>4. [Fourth Item Title]</h2>
<p>Description and explanation of the fourth item...</p>

<h2>5. [Fifth Item Title]</h2>
<p>Description and explanation of the fifth item...</p>

<h2>Conclusion</h2>
<p>Wrap up with key takeaways and a call to action...</p>`
    },

    tutorial: {
        id: 'tutorial',
        name: 'Tutorial',
        description: 'In-depth learning guide with practice exercises',
        icon: 'GraduationCap',
        category: 'Educational',
        content: `<h2>What You'll Learn</h2>
<p>By the end of this tutorial, you'll be able to...</p>
<ul>
  <li>Learning objective 1</li>
  <li>Learning objective 2</li>
  <li>Learning objective 3</li>
</ul>

<h2>Prerequisites</h2>
<p>Before starting, you should know:</p>
<ul>
  <li>Required knowledge 1</li>
  <li>Required knowledge 2</li>
</ul>

<h2>Part 1: [Topic Name]</h2>
<p>Detailed explanation with examples...</p>

<h3>Example</h3>
<p>Practical example demonstrating the concept...</p>

<h2>Part 2: [Topic Name]</h2>
<p>Build on previous knowledge...</p>

<h2>Practice Exercise</h2>
<p>Try this exercise to reinforce your learning:</p>
<ol>
  <li>Exercise step 1</li>
  <li>Exercise step 2</li>
  <li>Exercise step 3</li>
</ol>

<h2>Next Steps</h2>
<p>Continue your learning journey with...</p>`
    },

    review: {
        id: 'review',
        name: 'Product Review',
        description: 'Comprehensive product or service review',
        icon: 'Star',
        category: 'Review',
        content: `<h2>Product Overview</h2>
<p>Brief introduction to the product and what it does...</p>

<h2>Key Features</h2>
<ul>
  <li><strong>Feature 1:</strong> Description</li>
  <li><strong>Feature 2:</strong> Description</li>
  <li><strong>Feature 3:</strong> Description</li>
</ul>

<h2>Pros</h2>
<ul>
  <li>✅ Positive aspect 1</li>
  <li>✅ Positive aspect 2</li>
  <li>✅ Positive aspect 3</li>
</ul>

<h2>Cons</h2>
<ul>
  <li>❌ Negative aspect 1</li>
  <li>❌ Negative aspect 2</li>
</ul>

<h2>Performance</h2>
<p>How well does it perform in real-world use...</p>

<h2>Value for Money</h2>
<p>Is it worth the price? Who is it best for...</p>

<h2>Final Verdict</h2>
<p><strong>Rating: [X/5 stars]</strong></p>
<p>Overall recommendation and who should buy this...</p>

<h2>Where to Buy</h2>
<p>Links and pricing information...</p>`
    },

    comparison: {
        id: 'comparison',
        name: 'Comparison Post',
        description: 'Side-by-side comparison of options',
        icon: 'Scale',
        category: 'Analysis',
        content: `<h2>Introduction</h2>
<p>What are we comparing and why it matters...</p>

<h2>Quick Comparison Table</h2>
<table>
  <thead>
    <tr>
      <th>Feature</th>
      <th>Option A</th>
      <th>Option B</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>Price</td>
      <td>$XX</td>
      <td>$XX</td>
    </tr>
    <tr>
      <td>Feature 1</td>
      <td>✅ Yes</td>
      <td>❌ No</td>
    </tr>
    <tr>
      <td>Feature 2</td>
      <td>Good</td>
      <td>Excellent</td>
    </tr>
  </tbody>
</table>

<h2>Option A: Detailed Analysis</h2>
<h3>Strengths</h3>
<p>What makes Option A stand out...</p>

<h3>Weaknesses</h3>
<p>Where Option A falls short...</p>

<h2>Option B: Detailed Analysis</h2>
<h3>Strengths</h3>
<p>What makes Option B stand out...</p>

<h3>Weaknesses</h3>
<p>Where Option B falls short...</p>

<h2>Which Should You Choose?</h2>
<p><strong>Choose Option A if:</strong></p>
<ul>
  <li>Scenario 1</li>
  <li>Scenario 2</li>
</ul>

<p><strong>Choose Option B if:</strong></p>
<ul>
  <li>Scenario 1</li>
  <li>Scenario 2</li>
</ul>

<h2>Final Recommendation</h2>
<p>Our verdict and who each option is best for...</p>`
    }
}

/**
 * Get a template by ID
 * @param {string} templateId - The template identifier
 * @returns {object|null} Template object or null if not found
 */
export function getTemplate(templateId) {
    return templates[templateId] || null
}

/**
 * Get all templates as an array
 * @returns {array} Array of template objects
 */
export function getAllTemplates() {
    return Object.values(templates)
}

/**
 * Get templates by category
 * @param {string} category - Template category
 * @returns {array} Array of matching templates
 */
export function getTemplatesByCategory(category) {
    return Object.values(templates).filter(t => t.category === category)
}

/**
 * Apply template to editor
 * @param {object} editor - TipTap editor instance
 * @param {string} templateId - Template to apply
 * @returns {boolean} Success status
 */
export function applyTemplate(editor, templateId) {
    const template = getTemplate(templateId)

    if (!template || !editor) {
        return false
    }

    // Clear existing content and insert template
    editor.commands.setContent(template.content)

    // Focus editor after insertion
    editor.commands.focus('start')

    return true
}
