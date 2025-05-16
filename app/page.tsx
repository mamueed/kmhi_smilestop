"use client"

import SurveyForm from "@/components/survey-form"
import { AccessibilityToggle } from "@/components/accessibility-toggle"
import Image from "next/image"

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-blue-50 to-indigo-100 py-8">
      <div className="container mx-auto px-4">
        <header className="mb-12 relative">
          {/* Top bar with accessibility toggle and logo */}
          <div className="flex justify-between items-center mb-8">
            {/* Accessibility Toggle */}
            <div className="flex-grow-0">
              <AccessibilityToggle />
            </div>

            {/* RTA Logo */}
            <div className="flex-grow-0">
              <Image
                src="/images/rta-logo.png"
                alt="RTA - Roads & Transport Authority"
                width={120}
                height={40}
                className="object-contain"
                priority
              />
            </div>
          </div>

          {/* Centered app title and slogan */}
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold text-blue-800 mb-2 font-serif">Smile Stop</h1>
            <p className="text-xl text-blue-600 font-medium">Your Journey, Your Voice!</p>
          </div>

          <div className="flex justify-center">
            <div className="inline-block bg-white/80 backdrop-blur-sm px-8 py-4 rounded-xl shadow-sm mb-4">
              <div className="flex flex-wrap justify-center gap-2">
                <button className="px-5 py-2 text-sm bg-red-600 text-white rounded-full shadow-sm hover:bg-red-700 transition-colors">
                  English
                </button>
                <button className="px-5 py-2 text-sm bg-blue-600 text-white rounded-full shadow-sm hover:bg-blue-700 transition-colors">
                  العربية
                </button>
                <button className="px-5 py-2 text-sm bg-green-600 text-white rounded-full shadow-sm hover:bg-green-700 transition-colors">
                  हिन्दी
                </button>
                <button className="px-5 py-2 text-sm bg-purple-600 text-white rounded-full shadow-sm hover:bg-purple-700 transition-colors">
                  اردو
                </button>
              </div>
            </div>
          </div>
        </header>
        <SurveyForm />
      </div>
    </main>
  )
}
