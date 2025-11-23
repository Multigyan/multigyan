"use client"

import { Button } from "@/components/ui/button"
import {
    Twitter,
    Linkedin,
    Instagram,
    Youtube,
    Mail,
    MessageCircle,
    Send
} from "lucide-react"

/**
 * Stay Connected Component
 * 
 * Social media links for blog posts with colorful icons
 * Matches FloatingSocialSidebar design and URLs
 * 
 * @param {string} className - Additional CSS classes
 */
export default function StayConnected({ className = '' }) {
    const socialLinks = [
        {
            name: 'WhatsApp Channel',
            icon: MessageCircle,
            url: 'https://whatsapp.com/channel/0029VbBBdkrDOQIQFDv6Rc1v',
            bgColor: 'bg-[#25D366]',
            hoverColor: 'hover:bg-[#1DA851]'
        },
        {
            name: 'Telegram',
            icon: Send,
            url: 'https://t.me/multigyanexpert',
            bgColor: 'bg-[#0088cc]',
            hoverColor: 'hover:bg-[#006699]'
        },
        {
            name: 'Instagram',
            icon: Instagram,
            url: 'https://instagram.com/multigyan.info',
            bgColor: 'bg-gradient-to-br from-purple-600 via-pink-600 to-orange-500',
            hoverColor: 'hover:opacity-90'
        },
        {
            name: 'YouTube',
            icon: Youtube,
            url: 'https://youtube.com/@multigyan_in',
            bgColor: 'bg-red-600',
            hoverColor: 'hover:bg-red-700'
        },
        {
            name: 'LinkedIn',
            icon: Linkedin,
            url: 'https://www.linkedin.com/company/multigyan/',
            bgColor: 'bg-[#0077b5]',
            hoverColor: 'hover:bg-[#006399]'
        },
        {
            name: 'Twitter',
            icon: Twitter,
            url: 'https://twitter.com/Multigyan_in',
            bgColor: 'bg-[#1DA1F2]',
            hoverColor: 'hover:bg-[#1A91DA]'
        },
        {
            name: 'Email',
            icon: Mail,
            url: '/contact',
            bgColor: 'bg-blue-600',
            hoverColor: 'hover:bg-blue-700'
        }
    ]

    return (
        <div className={className}>
            <h3 className="text-base sm:text-lg font-bold mb-3 sm:mb-4">STAY CONNECTED</h3>
            <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
                {socialLinks.map((social) => {
                    const Icon = social.icon
                    const isExternal = social.url.startsWith('http')

                    return (
                        <a
                            key={social.name}
                            href={social.url}
                            target={isExternal ? "_blank" : undefined}
                            rel={isExternal ? "noopener noreferrer" : undefined}
                            title={social.name}
                            className={`
                flex items-center justify-center
                w-10 h-10 sm:w-11 sm:h-11
                rounded-full
                text-white
                transition-all duration-200
                ${social.bgColor}
                ${social.hoverColor}
                hover:scale-110
                shadow-md
              `}
                        >
                            <Icon className="h-5 w-5" />
                        </a>
                    )
                })}
            </div>
        </div>
    )
}
