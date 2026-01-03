/**
 * Content Quality Analyzer
 * Analyzes blog content and provides quality scores with actionable recommendations
 */

import { analyzeInternalLinks } from './internal-linking'

/**
 * Calculate Flesch Reading Ease score
 * Score: 0-100 (higher = easier to read)
 * @param {string} text - Plain text content
 * @returns {number} Readability score
 */
function calculateReadabilityScore(text) {
    if (!text || text.trim().length === 0) return 0

    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0)
    const words = text.split(/\s+/).filter(w => w.length > 0)
    const syllables = words.reduce((count, word) => count + countSyllables(word), 0)

    if (sentences.length === 0 || words.length === 0) return 0

    const avgWordsPerSentence = words.length / sentences.length
    const avgSyllablesPerWord = syllables / words.length

    // Flesch Reading Ease formula
    const score = 206.835 - (1.015 * avgWordsPerSentence) - (84.6 * avgSyllablesPerWord)

    return Math.max(0, Math.min(100, score))
}

/**
 * Count syllables in a word (approximation)
 * @param {string} word - Word to analyze
 * @returns {number} Syllable count
 */
function countSyllables(word) {
    word = word.toLowerCase().replace(/[^a-z]/g, '')
    if (word.length <= 3) return 1

    const vowels = 'aeiouy'
    let count = 0
    let previousWasVowel = false

    for (let i = 0; i < word.length; i++) {
        const isVowel = vowels.includes(word[i])
        if (isVowel && !previousWasVowel) {
            count++
        }
        previousWasVowel = isVowel
    }

    // Adjust for silent 'e'
    if (word.endsWith('e')) {
        count--
    }

    return Math.max(1, count)
}

/**
 * Strip HTML tags and return plain text
 * @param {string} html - HTML content
 * @returns {string} Plain text
 */
function stripHtml(html) {
    if (!html) return ''
    return html
        .replace(/<script[^>]*>.*?<\/script>/gi, '')
        .replace(/<style[^>]*>.*?<\/style>/gi, '')
        .replace(/<[^>]+>/g, ' ')
        .replace(/\s+/g, ' ')
        .trim()
}

/**
 * Count headings in HTML content
 * @param {string} html - HTML content
 * @returns {Object} Heading counts by level
 */
function analyzeHeadings(html) {
    if (!html) return { h1: 0, h2: 0, h3: 0, h4: 0, total: 0 }

    const counts = {
        h1: (html.match(/<h1[^>]*>/gi) || []).length,
        h2: (html.match(/<h2[^>]*>/gi) || []).length,
        h3: (html.match(/<h3[^>]*>/gi) || []).length,
        h4: (html.match(/<h4[^>]*>/gi) || []).length
    }

    counts.total = counts.h1 + counts.h2 + counts.h3 + counts.h4

    return counts
}

/**
 * Analyze images in content
 * @param {string} html - HTML content
 * @returns {Object} Image analysis
 */
function analyzeImages(html) {
    if (!html) return { total: 0, withAlt: 0, missingAlt: 0 }

    const imgRegex = /<img[^>]*>/gi
    const images = html.match(imgRegex) || []

    const withAlt = images.filter(img => /alt=["'][^"']+["']/.test(img)).length
    const missingAlt = images.length - withAlt

    return {
        total: images.length,
        withAlt,
        missingAlt
    }
}

/**
 * Calculate keyword density
 * @param {string} text - Plain text content
 * @param {Array<string>} keywords - Keywords to analyze
 * @returns {Object} Keyword density analysis
 */
function analyzeKeywordDensity(text, keywords = []) {
    if (!text || keywords.length === 0) {
        return { densities: {}, avgDensity: 0, overused: [] }
    }

    const words = text.toLowerCase().split(/\s+/)
    const totalWords = words.length

    const densities = {}
    const overused = []

    keywords.forEach(keyword => {
        const kw = keyword.toLowerCase()
        const count = words.filter(word => word === kw).length
        const density = totalWords > 0 ? (count / totalWords) * 100 : 0

        densities[keyword] = {
            count,
            density: density.toFixed(2)
        }

        // Flag if density > 2% (over-optimization)
        if (density > 2) {
            overused.push(keyword)
        }
    })

    const avgDensity = Object.values(densities)
        .reduce((sum, kw) => sum + parseFloat(kw.density), 0) / keywords.length

    return {
        densities,
        avgDensity: avgDensity.toFixed(2),
        overused
    }
}

/**
 * Get word count targets by content type
 * @param {string} contentType - 'news' | 'blog' | 'diy' | 'recipe'
 * @returns {Object} Min and max word counts
 */
function getWordCountTarget(contentType = 'blog') {
    const targets = {
        news: { min: 400, ideal: 500, max: 800 },
        blog: { min: 1500, ideal: 2000, max: 3000 },
        diy: { min: 1000, ideal: 1500, max: 2500 },
        recipe: { min: 500, ideal: 800, max: 1500 }
    }

    return targets[contentType] || targets.blog
}

/**
 * Comprehensive content quality analysis
 * @param {Object} post - Post object with content, tags, etc.
 * @param {string} contentType - 'news' | 'blog' | 'diy' | 'recipe'
 * @returns {Object} Quality analysis with score and recommendations
 */
export function analyzeContentQuality(post, contentType = 'blog') {
    const issues = []
    const recommendations = []
    let score = 100 // Start at perfect, subtract for issues

    // 1. WORD COUNT ANALYSIS
    const plainText = stripHtml(post.content || '')
    const wordCount = plainText.split(/\s+/).filter(w => w.length > 0).length
    const target = getWordCountTarget(contentType)

    if (wordCount < target.min) {
        issues.push(`Content too short (${wordCount} words). Target: ${target.ideal}+ words.`)
        score -= 20
        recommendations.push(`Add ${target.ideal - wordCount} more words for better depth`)
    } else if (wordCount > target.max) {
        issues.push(`Content very long (${wordCount} words). Consider breaking into series.`)
        score -= 5
    } else if (wordCount < target.ideal) {
        recommendations.push(`Add ${target.ideal - wordCount} words to reach ideal length`)
        score -= 5
    }

    // 2. READABILITY ANALYSIS
    const readabilityScore = calculateReadabilityScore(plainText)

    if (readabilityScore < 50) {
        issues.push('Content is difficult to read. Simplify sentences.')
        score -= 15
        recommendations.push('Use shorter sentences and simpler words')
    } else if (readabilityScore < 60) {
        recommendations.push('Readability could be improved with shorter sentences')
        score -= 5
    }

    // 3. HEADING STRUCTURE
    const headings = analyzeHeadings(post.content || '')

    if (headings.total === 0) {
        issues.push('No headings found. Add H2/H3 for structure.')
        score -= 20
        recommendations.push('Add at least 5-8 headings (H2/H3) to organize content')
    } else if (headings.total < 5 && wordCount > 1000) {
        issues.push('Too few headings for content length.')
        score -= 10
        recommendations.push(`Add ${5 - headings.total} more headings`)
    }

    if (headings.h1 > 1) {
        issues.push('Multiple H1 tags found. Use only one H1 (title).')
        score -= 10
    }

    // 4. IMAGE ANALYSIS
    const images = analyzeImages(post.content || '')
    const recommendedImages = Math.ceil(wordCount / 500) // 1 image per 500 words

    if (images.total === 0 && wordCount > 500) {
        issues.push('No images found. Add visuals to improve engagement.')
        score -= 15
        recommendations.push(`Add ${recommendedImages} images (1 per 500 words)`)
    } else if (images.total < recommendedImages) {
        recommendations.push(`Add ${recommendedImages - images.total} more images`)
        score -= 5
    }

    if (images.missingAlt > 0) {
        issues.push(`${images.missingAlt} images missing alt text.`)
        score -= 10
        recommendations.push('Add descriptive alt text to all images')
    }

    // 5. INTERNAL LINKING
    const linkAnalysis = analyzeInternalLinks(post.content || '')

    if (linkAnalysis.internalLinks === 0) {
        issues.push('No internal links. Add 3-5 links to related content.')
        score -= 15
        recommendations.push('Add internal links to improve SEO and navigation')
    } else if (linkAnalysis.internalLinks < 3) {
        recommendations.push(`Add ${3 - linkAnalysis.internalLinks} more internal links`)
        score -= 5
    } else if (linkAnalysis.internalLinks > 10) {
        issues.push('Too many internal links. May appear spammy.')
        score -= 5
    }

    // 6. EXTERNAL LINKS (AUTHORITY)
    if (linkAnalysis.externalLinks === 0 && wordCount > 1000) {
        recommendations.push('Add 1-2 external links to authoritative sources')
        score -= 3
    }

    // 7. KEYWORD ANALYSIS (if SEO keywords provided)
    if (post.seoKeywords && post.seoKeywords.length > 0) {
        const keywordAnalysis = analyzeKeywordDensity(plainText, post.seoKeywords)

        if (keywordAnalysis.overused.length > 0) {
            issues.push(`Keywords overused: ${keywordAnalysis.overused.join(', ')}`)
            score -= 10
            recommendations.push('Reduce keyword density to 1-2%')
        }

        if (parseFloat(keywordAnalysis.avgDensity) < 0.5) {
            recommendations.push('Increase keyword usage slightly for better SEO')
            score -= 3
        }
    }

    // 8. META DESCRIPTION
    if (!post.seoDescription || post.seoDescription.length < 125) {
        issues.push('Meta description missing or too short.')
        score -= 10
        recommendations.push('Add compelling meta description (125-155 characters)')
    } else if (post.seoDescription.length > 155) {
        issues.push('Meta description too long (will be truncated).')
        score -= 5
    }

    // 9. TITLE OPTIMIZATION
    if (!post.seoTitle || post.seoTitle.length < 30) {
        recommendations.push('SEO title could be more descriptive')
        score -= 5
    } else if (post.seoTitle && post.seoTitle.length > 60) {
        issues.push('SEO title too long (will be truncated in search results)')
        score -= 5
    }

    // Final score (ensure 0-100 range)
    score = Math.max(0, Math.min(100, score))

    // Determine quality grade
    let grade, color
    if (score >= 90) {
        grade = 'Excellent'
        color = 'green'
    } else if (score >= 80) {
        grade = 'Very Good'
        color = 'green'
    } else if (score >= 70) {
        grade = 'Good'
        color = 'yellow'
    } else if (score >= 60) {
        grade = 'Fair'
        color = 'yellow'
    } else {
        grade = 'Needs Improvement'
        color = 'red'
    }

    return {
        score: Math.round(score),
        grade,
        color,
        wordCount,
        target,
        readabilityScore: Math.round(readabilityScore),
        headings,
        images,
        links: linkAnalysis,
        issues,
        recommendations,
        metrics: {
            wordCount: {
                value: wordCount,
                target: target.ideal,
                status: wordCount >= target.min && wordCount <= target.max ? 'good' : 'warning'
            },
            readability: {
                value: Math.round(readabilityScore),
                target: 60,
                status: readabilityScore >= 60 ? 'good' : 'warning'
            },
            headings: {
                value: headings.total,
                target: Math.ceil(wordCount / 200),
                status: headings.total >= 5 ? 'good' : 'warning'
            },
            images: {
                value: images.total,
                target: recommendedImages,
                status: images.total >= recommendedImages && images.missingAlt === 0 ? 'good' : 'warning'
            },
            internalLinks: {
                value: linkAnalysis.internalLinks,
                target: 5,
                status: linkAnalysis.internalLinks >= 3 ? 'good' : 'warning'
            }
        }
    }
}

/**
 * Get content quality recommendations for dashboard
 * @param {number} score - Quality score
 * @returns {string} User-friendly message
 */
export function getQualityMessage(score) {
    if (score >= 90) {
        return '🎉 Excellent! Your content is well-optimized for SEO.'
    } else if (score >= 80) {
        return '✅ Very good! Minor improvements could boost rankings.'
    } else if (score >= 70) {
        return '👍 Good! Follow recommendations to improve further.'
    } else if (score >= 60) {
        return '⚠️ Fair. Address key issues for better performance.'
    } else {
        return '❌ Needs improvement. Focus on critical issues first.'
    }
}

/**
 * Batch analyze multiple posts
 * @param {Array<Object>} posts - Array of post objects
 * @returns {Object} Aggregated quality report
 */
export function batchAnalyzeQuality(posts) {
    const analyses = posts.map(post => {
        const contentType = post.tags?.some(t => t.toLowerCase().includes('news')) ? 'news'
            : post.tags?.some(t => t.toLowerCase().includes('diy')) ? 'diy'
                : post.tags?.some(t => t.toLowerCase().includes('recipe')) ? 'recipe'
                    : 'blog'

        return {
            _id: post._id,
            title: post.title,
            slug: post.slug,
            ...analyzeContentQuality(post, contentType)
        }
    })

    const avgScore = analyses.reduce((sum, a) => sum + a.score, 0) / analyses.length

    const distribution = {
        excellent: analyses.filter(a => a.score >= 90).length,
        veryGood: analyses.filter(a => a.score >= 80 && a.score < 90).length,
        good: analyses.filter(a => a.score >= 70 && a.score < 80).length,
        fair: analyses.filter(a => a.score >= 60 && a.score < 70).length,
        poor: analyses.filter(a => a.score < 60).length
    }

    const commonIssues = analyses
        .flatMap(a => a.issues)
        .reduce((acc, issue) => {
            const key = issue.split('.')[0] // First sentence
            acc[key] = (acc[key] || 0) + 1
            return acc
        }, {})

    return {
        totalPosts: posts.length,
        avgScore: Math.round(avgScore),
        distribution,
        commonIssues: Object.entries(commonIssues)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5)
            .map(([issue, count]) => ({ issue, count })),
        postAnalyses: analyses
    }
}
