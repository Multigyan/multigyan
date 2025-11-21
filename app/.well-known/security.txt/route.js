import { NextResponse } from 'next/server'

export function GET() {
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.multigyan.in'
    const currentYear = new Date().getFullYear()
    const expiryDate = new Date()
    expiryDate.setFullYear(expiryDate.getFullYear() + 1) // Expires in 1 year

    const securityTxt = `# Security Policy for Multigyan
# Last Updated: ${new Date().toISOString().split('T')[0]}
# Expires: ${expiryDate.toISOString().split('T')[0]}

Contact: mailto:security@multigyan.in
Contact: ${siteUrl}/contact
Expires: ${expiryDate.toISOString()}
Preferred-Languages: en, hi
Canonical: ${siteUrl}/.well-known/security.txt

# Encryption
# If you have a PGP key, add it here:
# Encryption: https://www.multigyan.in/pgp-key.txt

# Policy
Policy: ${siteUrl}/security-policy

# Acknowledgments
Acknowledgments: ${siteUrl}/security-acknowledgments

# Hiring
# Hiring: ${siteUrl}/careers

# Please report security vulnerabilities responsibly.
# We appreciate your efforts to improve our security.
# We will respond to valid reports within 48 hours.

# Scope:
# - All subdomains of multigyan.in
# - All production services
# - Mobile applications (if applicable)

# Out of Scope:
# - Social engineering attacks
# - Physical attacks
# - Denial of Service (DoS/DDoS)
# - Spam or social media issues

# Safe Harbor:
# We support safe harbor for security researchers who:
# - Make a good faith effort to avoid privacy violations
# - Do not exploit vulnerabilities beyond proof of concept
# - Report vulnerabilities promptly
# - Keep vulnerability details confidential until resolved

# Thank you for helping keep Multigyan and our users safe!
`

    return new NextResponse(securityTxt, {
        status: 200,
        headers: {
            'Content-Type': 'text/plain; charset=utf-8',
            'Cache-Control': 'public, max-age=86400, stale-while-revalidate=604800'
        }
    })
}
