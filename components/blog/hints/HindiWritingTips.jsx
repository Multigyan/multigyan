"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Lightbulb, CheckCircle2, AlertCircle } from "lucide-react"

/**
 * HindiWritingTips Component
 * Shows helpful tips when writing Hindi blog posts
 */
export default function HindiWritingTips() {
  return (
    <Card className="bg-gradient-to-br from-orange-50/50 to-amber-50/50 border-orange-200/50">
      <CardHeader>
        <CardTitle className="text-sm flex items-center gap-2">
          <Lightbulb className="h-4 w-4 text-orange-600" />
          हिंदी ब्लॉग लिखने के सुझाव
        </CardTitle>
        <CardDescription className="text-xs">
          Hindi Blog Writing Tips
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* SEO Tips */}
        <Alert className="bg-green-50/50 border-green-200">
          <CheckCircle2 className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-xs space-y-1">
            <p className="font-semibold text-green-900">SEO के लिए:</p>
            <ul className="space-y-1 ml-2">
              <li>• शीर्षक में मुख्य keyword जरूर शामिल करें</li>
              <li>• अंग्रेजी keywords को देवनागरी में न लिखें</li>
              <li>• उदाहरण: "PMAY 2025" (सही) vs "पीएमएवाई" (गलत)</li>
            </ul>
          </AlertDescription>
        </Alert>

        {/* Tag Tips */}
        <Alert className="bg-blue-50/50 border-blue-200">
          <CheckCircle2 className="h-4 w-4 text-blue-600" />
          <AlertDescription className="text-xs space-y-1">
            <p className="font-semibold text-blue-900">Tags के लिए:</p>
            <ul className="space-y-1 ml-2">
              <li>• हिंदी और अंग्रेजी tags मिलाकर use करें</li>
              <li>• उदाहरण: "PMAY Hindi, सब्सिडी, Government Schemes"</li>
              <li>• Popular अंग्रेजी terms को English में ही रखें</li>
            </ul>
          </AlertDescription>
        </Alert>

        {/* Content Tips */}
        <Alert className="bg-purple-50/50 border-purple-200">
          <CheckCircle2 className="h-4 w-4 text-purple-600" />
          <AlertDescription className="text-xs space-y-1">
            <p className="font-semibold text-purple-900">Content लिखते समय:</p>
            <ul className="space-y-1 ml-2">
              <li>• सरल और स्पष्ट भाषा का उपयोग करें</li>
              <li>• Technical terms को brackets में explain करें</li>
              <li>• उदाहरण: "सब्सिडी (Subsidy)"</li>
              <li>• हर paragraph को छोटा रखें (3-4 lines)</li>
            </ul>
          </AlertDescription>
        </Alert>

        {/* Common Mistakes */}
        <Alert className="bg-amber-50/50 border-amber-200">
          <AlertCircle className="h-4 w-4 text-amber-600" />
          <AlertDescription className="text-xs space-y-1">
            <p className="font-semibold text-amber-900">इन गलतियों से बचें:</p>
            <ul className="space-y-1 ml-2">
              <li>❌ शीर्षक में केवल हिंदी (SEO के लिए अच्छा नहीं)</li>
              <li>✅ मिक्स करें: "PMAY 2025: सब्सिडी की पूरी जानकारी"</li>
              <li>❌ बहुत लंबे sentences</li>
              <li>✅ छोटे, clear sentences</li>
            </ul>
          </AlertDescription>
        </Alert>

        {/* Quick Checklist */}
        <div className="bg-white/50 p-3 rounded-lg border border-gray-200 space-y-2">
          <p className="text-xs font-semibold text-gray-900">Quick Checklist:</p>
          <div className="space-y-1 text-xs text-gray-700">
            <div className="flex items-start gap-2">
              <CheckCircle2 className="h-3 w-3 mt-0.5 text-green-600 flex-shrink-0" />
              <span>Title में year या number (2025, Top 10)</span>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle2 className="h-3 w-3 mt-0.5 text-green-600 flex-shrink-0" />
              <span>English post से link किया है?</span>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle2 className="h-3 w-3 mt-0.5 text-green-600 flex-shrink-0" />
              <span>3-5 mixed language tags added</span>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle2 className="h-3 w-3 mt-0.5 text-green-600 flex-shrink-0" />
              <span>Featured image का Hindi alt text</span>
            </div>
            <div className="flex items-start gap-2">
              <CheckCircle2 className="h-3 w-3 mt-0.5 text-green-600 flex-shrink-0" />
              <span>300+ words का content</span>
            </div>
          </div>
        </div>

        {/* Example Section */}
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-3 rounded-lg border border-blue-200 space-y-2">
          <p className="text-xs font-semibold text-gray-900">✨ Perfect Example:</p>
          <div className="space-y-2 text-xs">
            <div>
              <p className="font-medium text-blue-900">Title:</p>
              <p className="text-gray-700 bg-white px-2 py-1 rounded mt-1">
                "PMAY 2025: सब्सिडी, स्टेटस और आवेदन की पूरी जानकारी"
              </p>
            </div>
            <div>
              <p className="font-medium text-blue-900">Tags:</p>
              <div className="flex flex-wrap gap-1 mt-1">
                <span className="bg-blue-100 text-blue-800 px-2 py-0.5 rounded text-xs">PMAY Hindi</span>
                <span className="bg-blue-100 text-blue-800 px-2 py-0.5 rounded text-xs">सब्सिडी</span>
                <span className="bg-blue-100 text-blue-800 px-2 py-0.5 rounded text-xs">CLSS</span>
                <span className="bg-blue-100 text-blue-800 px-2 py-0.5 rounded text-xs">Government Schemes</span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
