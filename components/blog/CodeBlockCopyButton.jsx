"use client"

import { useEffect } from 'react'
import { toast } from 'sonner'

/**
 * CodeBlockCopyButton Component
 * 
 * Adds copy buttons to all code blocks in blog posts
 * Works on any page that displays code snippets
 * 
 * Usage: Import and add <CodeBlockCopyButton /> to your page
 */
export default function CodeBlockCopyButton() {
  useEffect(() => {
    const addCopyButtons = () => {
      // Find all code blocks that don't already have copy buttons
      const codeBlocks = document.querySelectorAll('pre:not(.copy-button-added)')
      
      codeBlocks.forEach((block) => {
        // Mark as processed
        block.classList.add('copy-button-added')
        
        // Add relative positioning if not already set
        if (!block.style.position) {
          block.style.position = 'relative'
        }
        
        // Create copy button
        const button = document.createElement('button')
        button.className = 'copy-code-btn'
        button.innerHTML = `
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
          </svg>
        `
        button.title = 'Copy code'
        button.setAttribute('aria-label', 'Copy code to clipboard')
        
        // Copy functionality
        button.onclick = async (e) => {
          e.preventDefault()
          e.stopPropagation()
          
          const code = block.querySelector('code') || block
          if (code) {
            try {
              await navigator.clipboard.writeText(code.textContent)
              
              // Show success feedback
              button.innerHTML = `
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
              `
              button.style.color = '#10b981'
              
              // Reset after 2 seconds
              setTimeout(() => {
                button.innerHTML = `
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                  </svg>
                `
                button.style.color = ''
              }, 2000)
              
              toast.success('Code copied!')
            } catch (err) {
              console.error('Copy failed:', err)
              toast.error('Failed to copy code')
            }
          }
        }
        
        block.appendChild(button)
      })
    }
    
    // Run initially
    addCopyButtons()
    
    // Re-run when content changes (for dynamic content)
    const observer = new MutationObserver(addCopyButtons)
    observer.observe(document.body, {
      childList: true,
      subtree: true
    })
    
    return () => observer.disconnect()
  }, [])
  
  return (
    <>
      <style jsx global>{`
        /* Enhanced Code Block Styling for Published Posts */
        .blog-content pre,
        .prose pre {
          position: relative;
          background: #1e293b !important;
          color: #e2e8f0 !important;
          border-radius: 0.5rem;
          padding: 1rem;
          padding-top: 2.5rem;
          margin: 1.5rem 0;
          font-family: 'Courier New', Consolas, Monaco, monospace;
          font-size: 0.875rem;
          line-height: 1.6;
          overflow-x: auto;
          overflow-y: auto;
          max-height: 500px;
          border: 1px solid #334155;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }
        
        .blog-content pre code,
        .prose pre code {
          background: transparent !important;
          color: inherit !important;
          padding: 0 !important;
          white-space: pre !important;
          display: block;
          font-family: inherit;
        }
        
        /* Copy Button Styling */
        .copy-code-btn {
          position: absolute;
          top: 0.5rem;
          right: 0.5rem;
          padding: 0.5rem;
          background: rgba(30, 41, 59, 0.9);
          border: 1px solid #475569;
          border-radius: 0.375rem;
          color: #e2e8f0;
          cursor: pointer;
          transition: all 0.2s ease;
          z-index: 10;
          display: flex;
          align-items: center;
          justify-content: center;
          opacity: 0;
          transform: translateY(-5px);
        }
        
        /* Show copy button on hover */
        .blog-content pre:hover .copy-code-btn,
        .prose pre:hover .copy-code-btn,
        .copy-code-btn:focus {
          opacity: 1;
          transform: translateY(0);
        }
        
        .copy-code-btn:hover {
          background: #475569;
          border-color: #64748b;
          transform: scale(1.05);
        }
        
        .copy-code-btn:active {
          transform: scale(0.95);
        }
        
        /* Scrollbar Styling */
        .blog-content pre::-webkit-scrollbar,
        .prose pre::-webkit-scrollbar {
          width: 8px;
          height: 8px;
        }
        
        .blog-content pre::-webkit-scrollbar-track,
        .prose pre::-webkit-scrollbar-track {
          background: #0f172a;
          border-radius: 4px;
        }
        
        .blog-content pre::-webkit-scrollbar-thumb,
        .prose pre::-webkit-scrollbar-thumb {
          background: #475569;
          border-radius: 4px;
        }
        
        .blog-content pre::-webkit-scrollbar-thumb:hover,
        .prose pre::-webkit-scrollbar-thumb:hover {
          background: #64748b;
        }
        
        /* Syntax Highlighting Colors */
        .blog-content pre .hljs-keyword,
        .prose pre .hljs-keyword { 
          color: #f472b6; 
          font-weight: 600;
        }
        
        .blog-content pre .hljs-string,
        .prose pre .hljs-string { 
          color: #a3e635; 
        }
        
        .blog-content pre .hljs-number,
        .prose pre .hljs-number { 
          color: #fbbf24; 
        }
        
        .blog-content pre .hljs-comment,
        .prose pre .hljs-comment { 
          color: #94a3b8; 
          font-style: italic; 
        }
        
        .blog-content pre .hljs-function,
        .prose pre .hljs-function { 
          color: #60a5fa; 
        }
        
        .blog-content pre .hljs-variable,
        .prose pre .hljs-variable { 
          color: #e2e8f0; 
        }
        
        .blog-content pre .hljs-title,
        .prose pre .hljs-title { 
          color: #a78bfa; 
          font-weight: 600;
        }
        
        .blog-content pre .hljs-params,
        .prose pre .hljs-params { 
          color: #fb923c; 
        }
        
        .blog-content pre .hljs-attr,
        .prose pre .hljs-attr { 
          color: #34d399; 
        }
        
        .blog-content pre .hljs-tag,
        .prose pre .hljs-tag { 
          color: #f472b6; 
        }
        
        .blog-content pre .hljs-built_in,
        .prose pre .hljs-built_in { 
          color: #fbbf24; 
        }
        
        .blog-content pre .hljs-selector-tag,
        .prose pre .hljs-selector-tag { 
          color: #f472b6; 
        }
        
        .blog-content pre .hljs-selector-class,
        .prose pre .hljs-selector-class { 
          color: #a78bfa; 
        }
        
        .blog-content pre .hljs-selector-id,
        .prose pre .hljs-selector-id { 
          color: #60a5fa; 
        }
        
        /* Mobile Responsiveness */
        @media (max-width: 640px) {
          .blog-content pre,
          .prose pre {
            font-size: 0.75rem;
            padding: 0.75rem;
            padding-top: 2.25rem;
          }
          
          .copy-code-btn {
            opacity: 1; /* Always show on mobile */
          }
        }
        
        /* Dark mode support */
        @media (prefers-color-scheme: dark) {
          .blog-content pre,
          .prose pre {
            background: #0f172a !important;
            border-color: #1e293b;
          }
        }
      `}</style>
    </>
  )
}
