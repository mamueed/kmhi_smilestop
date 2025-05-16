"use client"

import { useState, useEffect } from "react"
import { Volume2, Eye } from "lucide-react"
import { Switch } from "@/components/ui/switch"
import { cn } from "@/lib/utils"

export function AccessibilityToggle() {
  const [hearingAssistance, setHearingAssistance] = useState(false)
  const [visionAssistance, setVisionAssistance] = useState(false)

  // Apply high contrast mode for vision assistance
  useEffect(() => {
    if (visionAssistance) {
      document.documentElement.classList.add("high-contrast")
      document.documentElement.style.fontSize = "110%"
    } else {
      document.documentElement.classList.remove("high-contrast")
      document.documentElement.style.fontSize = "100%"
    }

    return () => {
      document.documentElement.classList.remove("high-contrast")
      document.documentElement.style.fontSize = "100%"
    }
  }, [visionAssistance])

  // Initialize speech synthesis for hearing assistance
  useEffect(() => {
    if (hearingAssistance) {
      // This would normally initialize text-to-speech
      console.log("Hearing assistance enabled")
      localStorage.setItem("hearingAssistance", "true")
    } else {
      localStorage.setItem("hearingAssistance", "false")
    }

    // Dispatch storage event to notify other components
    window.dispatchEvent(new Event("storage"))
  }, [hearingAssistance])

  return (
    <div className="flex items-center gap-2 bg-white p-3 rounded-lg shadow-sm">
      <div className="flex items-center space-x-2">
        <div className="flex items-center gap-1">
          <Volume2 className="h-4 w-4 text-blue-800" />
          <Switch
            id="hearing-mode"
            checked={hearingAssistance}
            onCheckedChange={setHearingAssistance}
            className={cn(hearingAssistance ? "bg-blue-600" : "bg-gray-200")}
          />
        </div>
      </div>

      <div className="flex items-center space-x-2">
        <div className="flex items-center gap-1">
          <Eye className="h-4 w-4 text-blue-800" />
          <Switch
            id="vision-mode"
            checked={visionAssistance}
            onCheckedChange={setVisionAssistance}
            className={cn(visionAssistance ? "bg-blue-600" : "bg-gray-200")}
          />
        </div>
      </div>
    </div>
  )
}
