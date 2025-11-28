"use client"

import AdSense from "@/components/AdSense"
import TOCMobileCollapsible from "@/components/blog/TOCMobileCollapsible"

/**
 * BlogPostContent Component
 * Displays the featured image, mobile TOC, and article content with ads
 */
export default function BlogPostContent({ post, headings, activeId, scrollToHeading, beforeAd, afterAd }) {
    return (
        <>
            {/* Featured Image */}
            {post.featuredImageUrl && (
                <div className="mb-6 sm:mb-8 rounded-lg overflow-hidden bg-muted" itemProp="image" itemScope itemType="https://schema.org/ImageObject">
                    <img
                        src={post.featuredImageUrl}
                        alt={post.featuredImageAlt || post.title}
                        className="w-full h-auto"
                        loading="eager"
                        style={{ maxHeight: '400px', objectFit: 'contain' }}
                        itemProp="url"
                    />
                    <meta itemProp="width" content="1200" />
                    <meta itemProp="height" content="630" />
                </div>
            )}

            {/* Mobile Collapsible TOC */}
            <TOCMobileCollapsible
                headings={headings}
                activeId={activeId}
                onItemClick={scrollToHeading}
            />

            {/* Top Ad - After Featured Image, Before Content */}
            <div className="my-8">
                <AdSense
                    adSlot="2469893467"
                    adFormat="auto"
                    adStyle={{ display: 'block', textAlign: 'center' }}
                />
            </div>

            {/* Blog Content with Middle Ad */}
            <div className="blog-content mb-8 sm:mb-12" itemProp="articleBody">
                <style jsx global>{`
        .blog-content {
          font-size: 0.938rem;
          line-height: 1.7;
          color: var(--foreground);
        }

        @media (min-width: 640px) {
          .blog-content {
            font-size: 1.063rem;
            line-height: 1.8;
          }
        }

        .blog-content h1 {
          font-size: 1.75rem;
          font-weight: 700;
          margin-top: 2rem;
          margin-bottom: 1rem;
          line-height: 1.3;
          color: var(--foreground);
        }

        @media (min-width: 640px) {
          .blog-content h1 {
            font-size: 2.5rem;
            margin-top: 2.5rem;
            margin-bottom: 1.5rem;
            line-height: 1.2;
          }
        }

        .blog-content h2 {
          font-size: 1.5rem;
          font-weight: 700;
          margin-top: 1.75rem;
          margin-bottom: 1rem;
          line-height: 1.3;
          color: var(--foreground);
          border-bottom: 2px solid var(--border);
          padding-bottom: 0.5rem;
        }

        @media (min-width: 640px) {
          .blog-content h2 {
            font-size: 2rem;
            margin-top: 2rem;
            margin-bottom: 1.25rem;
          }
        }

        .blog-content h3 {
          font-size: 1.25rem;
          font-weight: 600;
          margin-top: 1.5rem;
          margin-bottom: 0.75rem;
          line-height: 1.4;
          color: var(--foreground);
        }

        @media (min-width: 640px) {
          .blog-content h3 {
            font-size: 1.5rem;
            margin-top: 1.75rem;
            margin-bottom: 1rem;
          }
        }

        .blog-content p {
          margin-bottom: 1.25rem;
          line-height: 1.7;
        }

        @media (min-width: 640px) {
          .blog-content p {
            margin-bottom: 1.5rem;
            line-height: 1.8;
          }
        }

        .blog-content img {
          max-width: 100%;
          height: auto;
          border-radius: 0.5rem;
          margin: 1.5rem 0;
          box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);
        }

        .blog-content ul, .blog-content ol {
          margin: 1.25rem 0;
          padding-left: 1.5rem;
        }

        .blog-content li {
          margin-bottom: 0.5rem;
        }

        .blog-content blockquote {
          border-left: 4px solid var(--primary);
          padding-left: 1rem;
          margin: 1.5rem 0;
          font-style: italic;
          color: var(--muted-foreground);
        }

        .blog-content code {
          background: var(--muted);
          padding: 0.2rem 0.4rem;
          border-radius: 0.25rem;
          font-size: 0.875em;
        }

        .blog-content pre {
          background: var(--muted);
          padding: 1rem;
          border-radius: 0.5rem;
          overflow-x: auto;
          margin: 1.5rem 0;
        }

        .blog-content pre code {
          background: none;
          padding: 0;
        }
        `}</style>

                {/* Content before ad */}
                <div dangerouslySetInnerHTML={{ __html: beforeAd }} />

                {/* Middle Ad */}
                {afterAd && (
                    <div className="my-12">
                        <AdSense
                            adSlot="8523786134"
                            adFormat="auto"
                            adStyle={{ display: 'block', textAlign: 'center' }}
                        />
                    </div>
                )}

                {/* Content after ad */}
                {afterAd && <div dangerouslySetInnerHTML={{ __html: afterAd }} />}
            </div>

            {/* Bottom Ad */}
            <div className="my-8">
                <AdSense
                    adSlot="5577678801"
                    adFormat="auto"
                    adStyle={{ display: 'block', textAlign: 'center' }}
                />
            </div>
        </>
    )
}
