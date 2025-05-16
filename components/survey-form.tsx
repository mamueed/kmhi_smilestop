"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Heart, ChevronRight, ChevronLeft, Camera, X, Train, TramFrontIcon as Tram, Volume2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import Image from "next/image"

const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB
const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"]

// Update the form schema to include nolCardType
const formSchema = z.object({
  // Demographics
  transportType: z.string().min(1, { message: "Please select Metro or Tram" }),
  gender: z.string().min(1, { message: "Please select your gender" }),
  age: z.string().min(1, { message: "Please select your age group" }),
  nationality: z.string().min(1, { message: "Please enter your nationality" }),
  departureStation: z.string().min(1, { message: "Please select your departure station" }),
  arrivalStation: z.string().min(1, { message: "Please select your arrival station" }),
  nolCardType: z.string().min(1, { message: "Please select your Nol Card type" }),
  residencyStatus: z.string().min(1, { message: "Please select your residency status" }),
  frequentTraveler: z.string().min(1, { message: "Please indicate if you are a frequent traveler" }),
  frequency: z.string().min(1, { message: "Please select how often you use the Metro/Tram" }),
  timeOfDay: z.string().min(1, { message: "Please select your usual time of travel" }),

  // Survey questions
  staffAvailability: z.string().optional(),
  stationSecurity: z.string().optional(),
  trainSecurity: z.string().optional(),
  travelInfo: z.string().optional(),
  stationInfoAvailable: z.string().optional(),
  stationInfoUnderstand: z.string().optional(),
  trainInfoAvailable: z.string().optional(),
  trainInfoUnderstand: z.string().optional(),
  trainService: z.string().optional(),
  stationTemperature: z.string().optional(),
  trainTemperature: z.string().optional(),
  stationCleanliness: z.string().optional(),
  washroomsAvailable: z.string().optional(),
  washroomsMaintained: z.string().optional(),
  staffHelpfulness: z.string().optional(),
  staffProfessionalism: z.string().optional(),
  staffResponsiveness: z.string().optional(),

  // Open-ended questions
  happinessLevel: z.string().optional(),
  happinessComment: z.string().optional(),
  improvementSuggestion: z.string().optional(),

  // Photo upload
  photoComments: z.array(z.string()).optional(),
})

const stations = [
  "Rashidiya",
  "Emirates",
  "Airport Terminal 3",
  "Airport Terminal 1",
  "GGICO",
  "Deira City Centre",
  "Al Rigga",
  "Union",
  "BurJuman",
  "Al Fahidi",
  "Al Jafiliya",
  "World Trade Centre",
  "Emirates Towers",
  "Financial Centre",
  "Burj Khalifa/Dubai Mall",
  "Business Bay",
  "Noor Bank",
  "First Abu Dhabi Bank",
  "Mall of the Emirates",
  "Dubai Internet City",
  "Mashreq",
  "Dubai Marina",
  "DAMAC Properties",
  "UAE Exchange",
]

const tramStations = [
  "JLT",
  "Dubai Marina",
  "Marina Towers",
  "Mina Seyahi",
  "Media City",
  "Palm Jumeirah",
  "Knowledge Village",
  "Al Sufouh",
  "Dubai Internet City",
  "Gateway Towers",
  "Jumeirah Lakes Towers",
]

const steps = [
  { id: "demographics", title: "Your Information" },
  { id: "experience", title: "Your Experience" },
  { id: "feedback", title: "Your Feedback" },
  { id: "photos", title: "Share Photos" },
]

// Categories with numbering
const categories = [
  { id: "safety", title: "1. Safety & Security", bgColor: "bg-blue-50", textColor: "text-blue-800" },
  {
    id: "wayfinding-stations",
    title: "2. Way finding - Stations",
    bgColor: "bg-indigo-50",
    textColor: "text-indigo-800",
  },
  { id: "wayfinding-trains", title: "3. Way finding - Trains", bgColor: "bg-purple-50", textColor: "text-purple-800" },
  { id: "punctuality", title: "4. Punctuality", bgColor: "bg-cyan-50", textColor: "text-cyan-800" },
  { id: "comfort", title: "5. Comfort", bgColor: "bg-teal-50", textColor: "text-teal-800" },
  { id: "cleanliness", title: "6. Cleanliness", bgColor: "bg-green-50", textColor: "text-green-800" },
  { id: "employees", title: "7. Friendliness of Employees", bgColor: "bg-amber-50", textColor: "text-amber-800" },
  { id: "feedback", title: "8. Your Feedback", bgColor: "bg-rose-50", textColor: "text-rose-800" },
]

// Metro-specific questions
const metroQuestions = {
  safety: [
    { name: "staffAvailability", question: "Staff are available in the station" },
    { name: "stationSecurity", question: "The metro station is secure and safe" },
    { name: "trainSecurity", question: "Inside the train is safe and secure" },
  ],
  wayfindingStations: [
    {
      name: "travelInfo",
      question: "It is convenient to obtain travel information prior to the trip. (routes, coverage, timings, tariff)",
    },
    { name: "stationInfoAvailable", question: "Information in stations is easily available" },
    { name: "stationInfoUnderstand", question: "Information in stations is easy to understand" },
  ],
  wayfindingTrains: [
    { name: "trainInfoAvailable", question: "Information inside the train is easily available" },
    { name: "trainInfoUnderstand", question: "Information inside the train is easy to understand" },
  ],
  punctuality: [{ name: "trainService", question: "Train service is reliable and frequent" }],
  comfort: [
    { name: "stationTemperature", question: "The temperature and ventilation in the station are pleasant" },
    { name: "trainTemperature", question: "The temperature and ventilation in the train are pleasant" },
  ],
  cleanliness: [
    { name: "stationCleanliness", question: "The station is clean" },
    { name: "washroomsAvailable", question: "The washrooms are available" },
    { name: "washroomsMaintained", question: "The washrooms are well maintained" },
  ],
  employees: [
    { name: "staffHelpfulness", question: "The staff members are helpful and knowledgeable" },
    { name: "staffProfessionalism", question: "Staff are professional in providing services" },
    { name: "staffResponsiveness", question: "Staff attentive/responsive to your query most of the times" },
  ],
  feedback: {
    experienceQuestion: "Tell us about your experience when using the Dubai Metro",
    improvementQuestion: "What would you like to improve/enhance about Dubai Metro service?",
  },
}

// Tram-specific questions
const tramQuestions = {
  safety: [
    { name: "staffAvailability", question: "Staff are available in the station" },
    { name: "stationSecurity", question: "The station is secure and safe" },
    { name: "trainSecurity", question: "Inside the tram is safe and secure" },
  ],
  wayfindingStations: [
    {
      name: "travelInfo",
      question: "It is convenient to obtain travel information prior to the trip. (routes, coverage, timings, tariff)",
    },
    { name: "stationInfoAvailable", question: "Information in stations is easily available" },
    { name: "stationInfoUnderstand", question: "Information in stations is easy to understand" },
  ],
  wayfindingTrains: [
    { name: "trainInfoAvailable", question: "Information inside the tram is easily available" },
    { name: "trainInfoUnderstand", question: "Information inside the tram is easy to understand" },
  ],
  punctuality: [{ name: "trainService", question: "Tram service is reliable and frequent" }],
  comfort: [
    { name: "stationTemperature", question: "The temperature and ventilation in the station are pleasant" },
    { name: "trainTemperature", question: "The temperature and ventilation in the tram are pleasant" },
  ],
  cleanliness: [{ name: "stationCleanliness", question: "The station is clean" }],
  employees: [
    { name: "staffHelpfulness", question: "The staff members are helpful and knowledgeable" },
    { name: "staffProfessionalism", question: "Staff are professional in providing services" },
    { name: "staffResponsiveness", question: "Staff attentive/responsive to your query most of the times" },
  ],
  feedback: {
    experienceQuestion: "Tell us about your experience when using the Dubai Tram",
    improvementQuestion: "What would you like to improve/enhance about Dubai Tram service?",
  },
}

export default function SurveyForm() {
  const [currentStep, setCurrentStep] = useState(0)
  const [progress, setProgress] = useState(25)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [uploadedImages, setUploadedImages] = useState<{ file: File; preview: string; comment: string }[]>([])
  const [transportType, setTransportType] = useState<string>("")
  const [questions, setQuestions] = useState<any>(metroQuestions)
  const [stationList, setStationList] = useState<string[]>(stations)
  const [hearingAssistance, setHearingAssistance] = useState(false)

  // Update the form defaultValues to include nolCardType
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      transportType: "",
      gender: "",
      age: "",
      nationality: "",
      departureStation: "",
      arrivalStation: "",
      nolCardType: "",
      residencyStatus: "",
      frequentTraveler: "",
      frequency: "",
      timeOfDay: "",
      happinessComment: "",
      improvementSuggestion: "",
      photoComments: [],
    },
  })

  // Watch for changes to transportType
  const watchTransportType = form.watch("transportType")

  // Update questions and station list when transport type changes
  useEffect(() => {
    if (watchTransportType === "metro") {
      setQuestions(metroQuestions)
      setStationList(stations)
      setTransportType("metro")
    } else if (watchTransportType === "tram") {
      setQuestions(tramQuestions)
      setStationList(tramStations)
      setTransportType("tram")
    }
  }, [watchTransportType])

  // Check for hearing assistance mode from parent component
  useEffect(() => {
    const handleStorageChange = () => {
      const hearingMode = localStorage.getItem("hearingAssistance") === "true"
      setHearingAssistance(hearingMode)
    }

    window.addEventListener("storage", handleStorageChange)
    // Initial check
    setHearingAssistance(localStorage.getItem("hearingAssistance") === "true")

    return () => {
      window.removeEventListener("storage", handleStorageChange)
    }
  }, [])

  // Text-to-speech function for hearing assistance
  const speakText = (text: string) => {
    if (hearingAssistance && "speechSynthesis" in window) {
      const utterance = new SpeechSynthesisUtterance(text)
      window.speechSynthesis.speak(utterance)
    }
  }

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1)
      setProgress((currentStep + 2) * 25)

      // Announce step change for hearing assistance
      if (hearingAssistance) {
        speakText(`Moving to step ${currentStep + 2}: ${steps[currentStep + 1].title}`)
      }
    }
  }

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
      setProgress(currentStep * 25)

      // Announce step change for hearing assistance
      if (hearingAssistance) {
        speakText(`Moving back to step ${currentStep}: ${steps[currentStep - 1].title}`)
      }
    }
  }

  function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitting(true)

    // Add image data to form values
    const formData = new FormData()

    // Add form values to FormData
    Object.entries(values).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        formData.append(key, String(value))
      }
    })

    // Add images to FormData
    uploadedImages.forEach((image, index) => {
      formData.append(`image-${index}`, image.file)
      formData.append(`image-comment-${index}`, image.comment)
    })

    // Announce submission for hearing assistance
    if (hearingAssistance) {
      speakText("Submitting your survey. Please wait.")
    }

    // Simulate API call
    setTimeout(() => {
      console.log(values)
      console.log(uploadedImages)
      setIsSubmitting(false)
      setIsSubmitted(true)

      // Announce completion for hearing assistance
      if (hearingAssistance) {
        speakText("Thank you! Your survey has been submitted successfully.")
      }
    }, 1500)
  }

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0]

      if (file.size > MAX_FILE_SIZE) {
        alert("File size must be less than 5MB")
        if (hearingAssistance) {
          speakText("File size must be less than 5 megabytes")
        }
        return
      }

      if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
        alert("Only .jpg, .jpeg, .png and .webp files are accepted")
        if (hearingAssistance) {
          speakText("Only JPG, PNG and WEBP files are accepted")
        }
        return
      }

      const reader = new FileReader()
      reader.onload = () => {
        setUploadedImages([
          ...uploadedImages,
          {
            file,
            preview: reader.result as string,
            comment: "",
          },
        ])

        if (hearingAssistance) {
          speakText("Image uploaded successfully")
        }
      }
      reader.readAsDataURL(file)

      // Reset the input
      e.target.value = ""
    }
  }

  const updateImageComment = (index: number, comment: string) => {
    const newImages = [...uploadedImages]
    newImages[index].comment = comment
    setUploadedImages(newImages)
  }

  const removeImage = (index: number) => {
    setUploadedImages(uploadedImages.filter((_, i) => i !== index))

    if (hearingAssistance) {
      speakText("Image removed")
    }
  }

  if (isSubmitted) {
    return (
      <Card className="max-w-3xl mx-auto bg-gradient-to-br from-blue-50 to-indigo-50 border-none shadow-lg">
        <CardContent className="pt-6 text-center p-10">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Heart className="w-10 h-10 text-green-600" />
          </div>
          <h2 className="text-3xl font-bold mb-4 text-blue-800">Thank You!</h2>
          <p className="text-gray-700 mb-6 text-lg max-w-md mx-auto">
            Your feedback is valuable to us and will help improve the Dubai{" "}
            {transportType === "metro" ? "Metro" : "Tram"} service for everyone.
          </p>
          <Button
            onClick={() => {
              form.reset()
              setIsSubmitted(false)
              setCurrentStep(0)
              setProgress(25)
              setUploadedImages([])

              if (hearingAssistance) {
                speakText("Starting a new survey")
              }
            }}
            size="lg"
            className="bg-blue-700 hover:bg-blue-800 text-white px-8 py-2 rounded-full"
          >
            Submit Another Response
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <>
      <Card className="max-w-4xl mx-auto bg-white shadow-xl border-none overflow-hidden">
        <div className="bg-gradient-to-r from-blue-700 to-blue-900 p-6 text-white shadow-inner">
          <h2 className="text-xl font-bold font-serif">{steps[currentStep].title}</h2>
          <Progress value={progress} className="h-2 mt-4 bg-white/30" />
        </div>

        <CardContent className="p-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Step 1: Demographics */}
              {currentStep === 0 && (
                <div className="space-y-6 animate-in fade-in duration-300">
                  {/* Transport Type Selection */}
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-lg mb-6">
                    <h3 className="font-medium text-blue-800 mb-4 text-center text-lg">Select Your Transport Type</h3>
                    <FormField
                      control={form.control}
                      name="transportType"
                      render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <div className="grid grid-cols-2 gap-4">
                              <div
                                className={`flex flex-col items-center p-4 rounded-lg cursor-pointer transition-all ${
                                  field.value === "metro"
                                    ? "bg-red-100 border-2 border-red-500 shadow-md"
                                    : "bg-white border border-gray-200 hover:bg-red-50"
                                }`}
                                onClick={() => {
                                  field.onChange("metro")
                                  if (hearingAssistance) {
                                    speakText("Dubai Metro selected")
                                  }
                                }}
                                role="radio"
                                aria-checked={field.value === "metro"}
                                tabIndex={0}
                                onKeyDown={(e) => {
                                  if (e.key === "Enter" || e.key === " ") {
                                    field.onChange("metro")
                                    if (hearingAssistance) {
                                      speakText("Dubai Metro selected")
                                    }
                                  }
                                }}
                              >
                                <div className="w-16 h-16 bg-red-600 rounded-full flex items-center justify-center mb-3">
                                  <Train className="w-8 h-8 text-white" />
                                </div>
                                <span className="font-medium text-red-800">Dubai Metro</span>
                                {hearingAssistance && (
                                  <span className="sr-only">Press Enter to select Dubai Metro</span>
                                )}
                              </div>
                              <div
                                className={`flex flex-col items-center p-4 rounded-lg cursor-pointer transition-all ${
                                  field.value === "tram"
                                    ? "bg-blue-100 border-2 border-blue-500 shadow-md"
                                    : "bg-white border border-gray-200 hover:bg-blue-50"
                                }`}
                                onClick={() => {
                                  field.onChange("tram")
                                  if (hearingAssistance) {
                                    speakText("Dubai Tram selected")
                                  }
                                }}
                                role="radio"
                                aria-checked={field.value === "tram"}
                                tabIndex={0}
                                onKeyDown={(e) => {
                                  if (e.key === "Enter" || e.key === " ") {
                                    field.onChange("tram")
                                    if (hearingAssistance) {
                                      speakText("Dubai Tram selected")
                                    }
                                  }
                                }}
                              >
                                <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center mb-3">
                                  <Tram className="w-8 h-8 text-white" />
                                </div>
                                <span className="font-medium text-blue-800">Dubai Tram</span>
                                {hearingAssistance && <span className="sr-only">Press Enter to select Dubai Tram</span>}
                              </div>
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="gender"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Gender</FormLabel>
                          <Select
                            onValueChange={(value) => {
                              field.onChange(value)
                              if (hearingAssistance) {
                                speakText(`Gender: ${value}`)
                              }
                            }}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger className="bg-gray-50 border-gray-200">
                                <SelectValue placeholder="Select gender" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="male">Male</SelectItem>
                              <SelectItem value="female">Female</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="age"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Age</FormLabel>
                          <Select
                            onValueChange={(value) => {
                              field.onChange(value)
                              if (hearingAssistance) {
                                speakText(`Age group: ${value}`)
                              }
                            }}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger className="bg-gray-50 border-gray-200">
                                <SelectValue placeholder="Select age group" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="15-25">15-25</SelectItem>
                              <SelectItem value="26-35">26-35</SelectItem>
                              <SelectItem value="36-45">36-45</SelectItem>
                              <SelectItem value="46-55">46-55</SelectItem>
                              <SelectItem value="above-55">Above 55</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="nationality"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nationality</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Enter your nationality"
                              className="bg-gray-50 border-gray-200"
                              {...field}
                              onChange={(e) => {
                                field.onChange(e)
                                if (hearingAssistance && e.target.value) {
                                  speakText(`Nationality: ${e.target.value}`)
                                }
                              }}
                              aria-label="Enter your nationality"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="residencyStatus"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Residency Status</FormLabel>
                          <Select
                            onValueChange={(value) => {
                              field.onChange(value)
                              if (hearingAssistance) {
                                speakText(`Residency status: ${value}`)
                              }
                            }}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger className="bg-gray-50 border-gray-200">
                                <SelectValue placeholder="Select status" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="citizen">Citizen</SelectItem>
                              <SelectItem value="resident">Resident</SelectItem>
                              <SelectItem value="tourist">Tourist</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="departureStation"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Station of Departure</FormLabel>
                          <Select
                            onValueChange={(value) => {
                              field.onChange(value)
                              if (hearingAssistance) {
                                const stationName = stationList.find(
                                  (station) => station.toLowerCase().replace(/\s+/g, "-") === value,
                                )
                                speakText(`Departure station: ${stationName || value}`)
                              }
                            }}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger className="bg-gray-50 border-gray-200">
                                <SelectValue placeholder="Select station" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {stationList.map((station) => (
                                <SelectItem key={station} value={station.toLowerCase().replace(/\s+/g, "-")}>
                                  {station}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="arrivalStation"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Station of Arrival</FormLabel>
                          <Select
                            onValueChange={(value) => {
                              field.onChange(value)
                              if (hearingAssistance) {
                                const stationName = stationList.find(
                                  (station) => station.toLowerCase().replace(/\s+/g, "-") === value,
                                )
                                speakText(`Arrival station: ${stationName || value}`)
                              }
                            }}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger className="bg-gray-50 border-gray-200">
                                <SelectValue placeholder="Select station" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {stationList.map((station) => (
                                <SelectItem key={station} value={station.toLowerCase().replace(/\s+/g, "-")}>
                                  {station}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="nolCardType"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nol Card Type</FormLabel>
                          <Select
                            onValueChange={(value) => {
                              field.onChange(value)
                              if (hearingAssistance) {
                                speakText(`Nol card type: ${value}`)
                              }
                            }}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger className="bg-gray-50 border-gray-200">
                                <SelectValue placeholder="Select Nol Card type" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="silver">Silver</SelectItem>
                              <SelectItem value="gold">Gold</SelectItem>
                              <SelectItem value="blue">Blue</SelectItem>
                              <SelectItem value="red">Red</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <FormField
                      control={form.control}
                      name="frequentTraveler"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Are you a frequent traveler?</FormLabel>
                          <Select
                            onValueChange={(value) => {
                              field.onChange(value)
                              if (hearingAssistance) {
                                speakText(`Frequent traveler: ${value}`)
                              }
                            }}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger className="bg-gray-50 border-gray-200">
                                <SelectValue placeholder="Select option" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="yes">Yes</SelectItem>
                              <SelectItem value="no">No</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="frequency"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Frequency of using {transportType === "metro" ? "Metro" : "Tram"}</FormLabel>
                          <Select
                            onValueChange={(value) => {
                              field.onChange(value)
                              if (hearingAssistance) {
                                speakText(`Frequency: ${value.replace(/-/g, " ")}`)
                              }
                            }}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger className="bg-gray-50 border-gray-200">
                                <SelectValue placeholder="Select frequency" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="daily">Daily</SelectItem>
                              <SelectItem value="few-times-week">Few times a week</SelectItem>
                              <SelectItem value="weekly">Weekly</SelectItem>
                              <SelectItem value="monthly">Monthly</SelectItem>
                              <SelectItem value="rarely">Rarely</SelectItem>
                              <SelectItem value="first-time">First time</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="timeOfDay"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Time of the Day</FormLabel>
                          <Select
                            onValueChange={(value) => {
                              field.onChange(value)
                              if (hearingAssistance) {
                                speakText(`Time of day: ${value.replace(/-/g, " ")}`)
                              }
                            }}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger className="bg-gray-50 border-gray-200">
                                <SelectValue placeholder="Select time" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="early-morning">Early Morning (5-7 AM)</SelectItem>
                              <SelectItem value="morning-peak">Morning Peak (7-9 AM)</SelectItem>
                              <SelectItem value="mid-morning">Mid Morning (9-11 AM)</SelectItem>
                              <SelectItem value="afternoon">Afternoon (11 AM-4 PM)</SelectItem>
                              <SelectItem value="evening-peak">Evening Peak (4-8 PM)</SelectItem>
                              <SelectItem value="night">Night (8-12 AM)</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              )}

              {/* Step 2: Experience Questions - Part 1 */}
              {currentStep === 1 && (
                <div className="space-y-6 animate-in fade-in duration-300">
                  <div className="grid grid-cols-1 gap-4">
                    {/* Safety & Security */}
                    <div className={`${categories[0].bgColor} p-4 rounded-lg border-l-4 border-blue-600`}>
                      <h3 className={`font-medium ${categories[0].textColor} mb-3`}>{categories[0].title}</h3>
                      <div className="space-y-3">
                        {questions.safety.map((q: any, index: number) => (
                          <QuickRatingQuestion
                            key={index}
                            form={form}
                            name={q.name}
                            question={q.question}
                            hearingAssistance={hearingAssistance}
                            speakText={speakText}
                          />
                        ))}
                      </div>
                    </div>

                    {/* Way finding - Stations */}
                    <div className={`${categories[1].bgColor} p-4 rounded-lg border-l-4 border-indigo-600`}>
                      <h3 className={`font-medium ${categories[1].textColor} mb-3`}>{categories[1].title}</h3>
                      <div className="space-y-3">
                        {questions.wayfindingStations.map((q: any, index: number) => (
                          <QuickRatingQuestion
                            key={index}
                            form={form}
                            name={q.name}
                            question={q.question}
                            hearingAssistance={hearingAssistance}
                            speakText={speakText}
                          />
                        ))}
                      </div>
                    </div>

                    {/* Way finding - Trains */}
                    <div className={`${categories[2].bgColor} p-4 rounded-lg border-l-4 border-purple-600`}>
                      <h3 className={`font-medium ${categories[2].textColor} mb-3`}>{categories[2].title}</h3>
                      <div className="space-y-3">
                        {questions.wayfindingTrains.map((q: any, index: number) => (
                          <QuickRatingQuestion
                            key={index}
                            form={form}
                            name={q.name}
                            question={q.question}
                            hearingAssistance={hearingAssistance}
                            speakText={speakText}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 3: Experience Questions - Part 2 */}
              {currentStep === 2 && (
                <div className="space-y-6 animate-in fade-in duration-300">
                  <div className="grid grid-cols-1 gap-4">
                    {/* Punctuality */}
                    <div className={`${categories[3].bgColor} p-4 rounded-lg border-l-4 border-cyan-600`}>
                      <h3 className={`font-medium ${categories[3].textColor} mb-3`}>{categories[3].title}</h3>
                      <div className="space-y-3">
                        {questions.punctuality.map((q: any, index: number) => (
                          <QuickRatingQuestion
                            key={index}
                            form={form}
                            name={q.name}
                            question={q.question}
                            hearingAssistance={hearingAssistance}
                            speakText={speakText}
                          />
                        ))}
                      </div>
                    </div>

                    {/* Comfort */}
                    <div className={`${categories[4].bgColor} p-4 rounded-lg border-l-4 border-teal-600`}>
                      <h3 className={`font-medium ${categories[4].textColor} mb-3`}>{categories[4].title}</h3>
                      <div className="space-y-3">
                        {questions.comfort.map((q: any, index: number) => (
                          <QuickRatingQuestion
                            key={index}
                            form={form}
                            name={q.name}
                            question={q.question}
                            hearingAssistance={hearingAssistance}
                            speakText={speakText}
                          />
                        ))}
                      </div>
                    </div>

                    {/* Cleanliness */}
                    <div className={`${categories[5].bgColor} p-4 rounded-lg border-l-4 border-green-600`}>
                      <h3 className={`font-medium ${categories[5].textColor} mb-3`}>{categories[5].title}</h3>
                      <div className="space-y-3">
                        {questions.cleanliness.map((q: any, index: number) => (
                          <QuickRatingQuestion
                            key={index}
                            form={form}
                            name={q.name}
                            question={q.question}
                            hearingAssistance={hearingAssistance}
                            speakText={speakText}
                          />
                        ))}
                      </div>
                    </div>

                    {/* Friendliness of Employees */}
                    <div className={`${categories[6].bgColor} p-4 rounded-lg border-l-4 border-amber-600`}>
                      <h3 className={`font-medium ${categories[6].textColor} mb-3`}>{categories[6].title}</h3>
                      <div className="space-y-3">
                        {questions.employees.map((q: any, index: number) => (
                          <QuickRatingQuestion
                            key={index}
                            form={form}
                            name={q.name}
                            question={q.question}
                            hearingAssistance={hearingAssistance}
                            speakText={speakText}
                          />
                        ))}
                      </div>
                    </div>

                    {/* Open-ended Questions */}
                    <div className={`${categories[7].bgColor} p-4 rounded-lg border-l-4 border-rose-600`}>
                      <h3 className={`font-medium ${categories[7].textColor} mb-3`}>{categories[7].title}</h3>
                      <div className="space-y-4">
                        <FormField
                          control={form.control}
                          name="happinessLevel"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>
                                {questions.feedback.experienceQuestion}
                                {hearingAssistance && (
                                  <button
                                    type="button"
                                    className="ml-2 text-blue-600"
                                    onClick={() => speakText(questions.feedback.experienceQuestion)}
                                    aria-label="Read this question aloud"
                                  >
                                    <Volume2 className="h-4 w-4" />
                                  </button>
                                )}
                              </FormLabel>
                              <FormControl>
                                <RadioGroup
                                  onValueChange={(value) => {
                                    field.onChange(value)
                                    if (hearingAssistance) {
                                      speakText(`You selected: ${value}`)
                                    }
                                  }}
                                  defaultValue={field.value}
                                  className="flex justify-center space-x-8 pt-4"
                                >
                                  <FormItem className="flex flex-col items-center space-y-1 space-x-0">
                                    <FormControl>
                                      <RadioGroupItem value="unhappy" className="sr-only" />
                                    </FormControl>
                                    <FormLabel className="font-normal cursor-pointer">
                                      <div
                                        className={`h-16 w-16 rounded-full flex items-center justify-center ${
                                          field.value === "unhappy" ? "bg-blue-100 scale-110" : "bg-gray-100"
                                        } transition-all`}
                                      >
                                        <div
                                          className={`w-12 h-12 rounded-full border-2 ${field.value === "unhappy" ? "border-blue-500" : "border-gray-300"}`}
                                        >
                                          <svg viewBox="0 0 100 100" className="w-full h-full text-blue-500">
                                            <path
                                              d="M30,65 Q50,45 70,65"
                                              fill="none"
                                              stroke="currentColor"
                                              strokeWidth="8"
                                              strokeLinecap="round"
                                            />
                                            <circle cx="35" cy="40" r="5" fill="currentColor" />
                                            <circle cx="65" cy="40" r="5" fill="currentColor" />
                                          </svg>
                                        </div>
                                      </div>
                                    </FormLabel>
                                    <span className="text-sm font-medium">Unhappy</span>
                                  </FormItem>
                                  <FormItem className="flex flex-col items-center space-y-1 space-x-0">
                                    <FormControl>
                                      <RadioGroupItem value="neutral" className="sr-only" />
                                    </FormControl>
                                    <FormLabel className="font-normal cursor-pointer">
                                      <div
                                        className={`h-16 w-16 rounded-full flex items-center justify-center ${
                                          field.value === "neutral" ? "bg-blue-100 scale-110" : "bg-gray-100"
                                        } transition-all`}
                                      >
                                        <div
                                          className={`w-12 h-12 rounded-full border-2 ${field.value === "neutral" ? "border-blue-500" : "border-gray-300"}`}
                                        >
                                          <svg viewBox="0 0 100 100" className="w-full h-full text-blue-500">
                                            <line
                                              x1="30"
                                              y1="60"
                                              x2="70"
                                              y2="60"
                                              stroke="currentColor"
                                              strokeWidth="8"
                                              strokeLinecap="round"
                                            />
                                            <circle cx="35" cy="40" r="5" fill="currentColor" />
                                            <circle cx="65" cy="40" r="5" fill="currentColor" />
                                          </svg>
                                        </div>
                                      </div>
                                    </FormLabel>
                                    <span className="text-sm font-medium">Neutral</span>
                                  </FormItem>
                                  <FormItem className="flex flex-col items-center space-y-1 space-x-0">
                                    <FormControl>
                                      <RadioGroupItem value="happy" className="sr-only" />
                                    </FormControl>
                                    <FormLabel className="font-normal cursor-pointer">
                                      <div
                                        className={`h-16 w-16 rounded-full flex items-center justify-center ${
                                          field.value === "happy" ? "bg-blue-100 scale-110" : "bg-gray-100"
                                        } transition-all`}
                                      >
                                        <div
                                          className={`w-12 h-12 rounded-full border-2 ${field.value === "happy" ? "border-blue-500" : "border-gray-300"}`}
                                        >
                                          <svg viewBox="0 0 100 100" className="w-full h-full text-blue-500">
                                            <path
                                              d="M30,55 Q50,75 70,55"
                                              fill="none"
                                              stroke="currentColor"
                                              strokeWidth="8"
                                              strokeLinecap="round"
                                            />
                                            <circle cx="35" cy="40" r="5" fill="currentColor" />
                                            <circle cx="65" cy="40" r="5" fill="currentColor" />
                                          </svg>
                                        </div>
                                      </div>
                                    </FormLabel>
                                    <span className="text-sm font-medium">Happy</span>
                                  </FormItem>
                                </RadioGroup>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="happinessComment"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>
                                Please explain your experience
                                {hearingAssistance && (
                                  <button
                                    type="button"
                                    className="ml-2 text-blue-600"
                                    onClick={() => speakText("Please explain your experience")}
                                    aria-label="Read this question aloud"
                                  >
                                    <Volume2 className="h-4 w-4" />
                                  </button>
                                )}
                              </FormLabel>
                              <FormControl>
                                <textarea
                                  placeholder="Tell us more about your experience..."
                                  className="min-h-[80px] bg-white w-full rounded-md border border-gray-200 p-2"
                                  value={field.value}
                                  onChange={(e) => {
                                    field.onChange(e)
                                    if (hearingAssistance && e.target.value) {
                                      speakText("Text entered: " + e.target.value)
                                    }
                                  }}
                                  aria-label="Tell us more about your experience"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="improvementSuggestion"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>
                                {questions.feedback.improvementQuestion}
                                {hearingAssistance && (
                                  <button
                                    type="button"
                                    className="ml-2 text-blue-600"
                                    onClick={() => speakText(questions.feedback.improvementQuestion)}
                                    aria-label="Read this question aloud"
                                  >
                                    <Volume2 className="h-4 w-4" />
                                  </button>
                                )}
                              </FormLabel>
                              <FormControl>
                                <textarea
                                  placeholder="Share your suggestions for improvement..."
                                  className="min-h-[80px] bg-white w-full rounded-md border border-gray-200 p-2"
                                  value={field.value}
                                  onChange={(e) => {
                                    field.onChange(e)
                                    if (hearingAssistance && e.target.value) {
                                      speakText("Text entered: " + e.target.value)
                                    }
                                  }}
                                  aria-label="Share your suggestions for improvement"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 4: Photo Upload */}
              {currentStep === 3 && (
                <div className="space-y-6 animate-in fade-in duration-300">
                  <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-lg">
                    <h3 className="font-medium text-blue-800 mb-3">Share Your Photos</h3>
                    <p className="text-gray-600 mb-4">
                      Upload photos of your Dubai {transportType === "metro" ? "Metro" : "Tram"} experience and tell us
                      about them.
                    </p>

                    <div className="mb-6">
                      <label
                        htmlFor="image-upload"
                        className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-blue-300 rounded-lg cursor-pointer bg-blue-50 hover:bg-blue-100 transition-colors"
                        tabIndex={0}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === " ") {
                            document.getElementById("image-upload")?.click()
                          }
                        }}
                        role="button"
                        aria-label="Upload a photo"
                      >
                        <div className="flex flex-col items-center justify-center pt-5 pb-6">
                          <Camera className="w-8 h-8 mb-2 text-blue-500" />
                          <p className="mb-2 text-sm text-blue-700">
                            <span className="font-semibold">Click to upload</span> or drag and drop
                          </p>
                          <p className="text-xs text-blue-500">JPG, PNG or WEBP (MAX. 5MB)</p>
                        </div>
                        <input
                          id="image-upload"
                          type="file"
                          className="hidden"
                          accept="image/png, image/jpeg, image/jpg, image/webp"
                          onChange={handleImageUpload}
                          aria-label="Upload image"
                        />
                      </label>
                    </div>

                    {uploadedImages.length > 0 && (
                      <div className="space-y-4">
                        {uploadedImages.map((image, index) => (
                          <div key={index} className="bg-white p-4 rounded-lg shadow-sm">
                            <div className="flex items-start gap-4">
                              <div className="relative w-24 h-24 flex-shrink-0">
                                <Image
                                  src={image.preview || "/placeholder.svg"}
                                  alt={`Uploaded image ${index + 1}`}
                                  fill
                                  className="object-cover rounded-md"
                                />
                              </div>
                              <div className="flex-grow">
                                <div className="flex justify-between">
                                  <h4 className="font-medium text-gray-700">Photo {index + 1}</h4>
                                  <button
                                    type="button"
                                    onClick={() => removeImage(index)}
                                    className="text-red-500 hover:text-red-700"
                                    aria-label={`Remove photo ${index + 1}`}
                                  >
                                    <X className="w-4 h-4" />
                                  </button>
                                </div>
                                <textarea
                                  value={image.comment}
                                  onChange={(e) => {
                                    updateImageComment(index, e.target.value)
                                    if (hearingAssistance && e.target.value) {
                                      speakText("Comment entered: " + e.target.value)
                                    }
                                  }}
                                  placeholder="Tell us about this photo..."
                                  className="w-full mt-2 p-2 text-sm border border-gray-200 rounded-md min-h-[4rem] resize-none"
                                  aria-label={`Add a comment for photo ${index + 1}`}
                                />
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Navigation Buttons */}
              <div className="flex justify-between pt-4">
                <Button
                  type="button"
                  onClick={prevStep}
                  variant="outline"
                  disabled={currentStep === 0}
                  className="flex items-center gap-1"
                  aria-label="Go to previous step"
                >
                  <ChevronLeft className="w-4 h-4" /> Previous
                </Button>

                {currentStep < steps.length - 1 ? (
                  <Button
                    type="button"
                    onClick={nextStep}
                    className="bg-blue-700 hover:bg-blue-800 flex items-center gap-1"
                    aria-label="Go to next step"
                  >
                    Next <ChevronRight className="w-4 h-4" />
                  </Button>
                ) : (
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="bg-blue-700 hover:bg-blue-800"
                    aria-label="Submit survey"
                  >
                    {isSubmitting ? "Submitting..." : "Submit Survey"}
                  </Button>
                )}
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>

      {/* Disclaimer Section */}
      <div className="max-w-4xl mx-auto mt-6 p-4 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-600">
        <p className="font-medium mb-1">Data Privacy Notice:</p>
        <p>
          The information and photos you provide in this survey will be stored securely and used to improve Dubai
          {transportType === "metro" ? " Metro" : " Tram"} services. Your data may be shared with relevant authorities
          for service enhancement purposes. By submitting this form, you consent to the collection, storage, and use of
          your feedback as described. All personal information will be handled in accordance with applicable privacy
          laws.
        </p>
      </div>
      <div className="max-w-4xl mx-auto mt-4 p-4 text-center text-gray-500 text-sm">
        <p>
          Copyright © 2025 <span className="text-gray-700">Roads and Transport Authority</span>, all rights reserved.
        </p>
      </div>
    </>
  )
}

// Helper component for quick rating questions
function QuickRatingQuestion({
  form,
  name,
  question,
  hearingAssistance = false,
  speakText = () => {},
}: {
  form: any
  name: string
  question: string
  hearingAssistance?: boolean
  speakText?: (text: string) => void
}) {
  return (
    <div className="bg-white rounded-md p-3 shadow-sm">
      <FormField
        control={form.control}
        name={name}
        render={({ field }) => (
          <FormItem className="space-y-1">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <FormLabel className="text-sm sm:max-w-[70%] font-normal">
                {question}
                {hearingAssistance && (
                  <button
                    type="button"
                    className="ml-2 text-blue-600"
                    onClick={() => speakText(question)}
                    aria-label="Read this question aloud"
                  >
                    <Volume2 className="h-4 w-4" />
                  </button>
                )}
              </FormLabel>
              <FormControl>
                <RadioGroup
                  onValueChange={(value) => {
                    field.onChange(value)
                    if (hearingAssistance) {
                      speakText(`You selected: ${value}`)
                    }
                  }}
                  defaultValue={field.value}
                  className="flex space-x-4"
                >
                  <FormItem className="flex flex-col items-center space-y-0 space-x-0 m-0">
                    <FormControl>
                      <RadioGroupItem value="unhappy" className="sr-only" />
                    </FormControl>
                    <FormLabel className="cursor-pointer m-0">
                      <div
                        className={`h-8 w-8 rounded-full flex items-center justify-center ${
                          field.value === "unhappy" ? "bg-blue-100" : "bg-gray-100"
                        } transition-all`}
                        role="radio"
                        aria-checked={field.value === "unhappy"}
                        tabIndex={0}
                        aria-label="Unhappy"
                      >
                        <div
                          className={`w-6 h-6 rounded-full border-2 ${field.value === "unhappy" ? "border-blue-500" : "border-gray-300"}`}
                        >
                          <svg viewBox="0 0 100 100" className="w-full h-full text-blue-500">
                            <path
                              d="M30,65 Q50,45 70,65"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="8"
                              strokeLinecap="round"
                            />
                            <circle cx="35" cy="40" r="5" fill="currentColor" />
                            <circle cx="65" cy="40" r="5" fill="currentColor" />
                          </svg>
                        </div>
                      </div>
                    </FormLabel>
                  </FormItem>
                  <FormItem className="flex flex-col items-center space-y-0 space-x-0 m-0">
                    <FormControl>
                      <RadioGroupItem value="neutral" className="sr-only" />
                    </FormControl>
                    <FormLabel className="cursor-pointer m-0">
                      <div
                        className={`h-8 w-8 rounded-full flex items-center justify-center ${
                          field.value === "neutral" ? "bg-blue-100" : "bg-gray-100"
                        } transition-all`}
                        role="radio"
                        aria-checked={field.value === "neutral"}
                        tabIndex={0}
                        aria-label="Neutral"
                      >
                        <div
                          className={`w-6 h-6 rounded-full border-2 ${field.value === "neutral" ? "border-blue-500" : "border-gray-300"}`}
                        >
                          <svg viewBox="0 0 100 100" className="w-full h-full text-blue-500">
                            <line
                              x1="30"
                              y1="60"
                              x2="70"
                              y2="60"
                              stroke="currentColor"
                              strokeWidth="8"
                              strokeLinecap="round"
                            />
                            <circle cx="35" cy="40" r="5" fill="currentColor" />
                            <circle cx="65" cy="40" r="5" fill="currentColor" />
                          </svg>
                        </div>
                      </div>
                    </FormLabel>
                  </FormItem>
                  <FormItem className="flex flex-col items-center space-y-0 space-x-0 m-0">
                    <FormControl>
                      <RadioGroupItem value="happy" className="sr-only" />
                    </FormControl>
                    <FormLabel className="cursor-pointer m-0">
                      <div
                        className={`h-8 w-8 rounded-full flex items-center justify-center ${
                          field.value === "happy" ? "bg-blue-100" : "bg-gray-100"
                        } transition-all`}
                        role="radio"
                        aria-checked={field.value === "happy"}
                        tabIndex={0}
                        aria-label="Happy"
                      >
                        <div
                          className={`w-6 h-6 rounded-full border-2 ${field.value === "happy" ? "border-blue-500" : "border-gray-300"}`}
                        >
                          <svg viewBox="0 0 100 100" className="w-full h-full text-blue-500">
                            <path
                              d="M30,55 Q50,75 70,55"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="8"
                              strokeLinecap="round"
                            />
                            <circle cx="35" cy="40" r="5" fill="currentColor" />
                            <circle cx="65" cy="40" r="5" fill="currentColor" />
                          </svg>
                        </div>
                      </div>
                    </FormLabel>
                  </FormItem>
                </RadioGroup>
              </FormControl>
            </div>
          </FormItem>
        )}
      />
    </div>
  )
}
