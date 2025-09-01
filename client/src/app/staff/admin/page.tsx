"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  IconFileText,
  IconPlus,
  IconCalendar,
  IconClipboardList,
  IconDownload,
  IconUpload,
} from "@tabler/icons-react"

// Import sub-module components
import PoliciesComponent from "@/components/staff/administration/policies"
import TimetableComponent from "@/components/staff/administration/timetable"
import CurriculumComponent from "@/components/staff/administration/curriculum"
import ReportsComponent from "@/components/staff/administration/reports"

// Navigation items for sub-modules
const navItems = [
  {
    id: "policies",
    title: "Policies",
    icon: IconFileText,
    description: "School policies and guidelines",
  },
  {
    id: "timetable",
    title: "Timetable",
    icon: IconCalendar,
    description: "Class schedules and timetables",
  },
  {
    id: "curriculum",
    title: "Curriculum",
    icon: IconClipboardList,
    description: "Curriculum management and tracking",
  },
  {
    id: "reports",
    title: "Reports",
    icon: IconFileText,
    description: "Generate and manage reports",
  },
]

export default function AdminPage() {
  const [activeSubModule, setActiveSubModule] = useState("policies")

  // Handle hash-based navigation for sub-modules
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#', '')
      if (hash && ['policies', 'timetable', 'curriculum', 'reports'].includes(hash)) {
        setActiveSubModule(hash)
      }
    }

    // Check initial hash
    handleHashChange()

    // Listen for hash changes
    window.addEventListener('hashchange', handleHashChange)
    return () => window.removeEventListener('hashchange', handleHashChange)
  }, [])

  const renderSubModule = () => {
    switch (activeSubModule) {
      case "policies":
        return <PoliciesComponent />
      case "timetable":
        return <TimetableComponent />
      case "curriculum":
        return <CurriculumComponent />
      case "reports":
        return <ReportsComponent />
      default:
        return <PoliciesComponent />
    }
  }

  return (
    <div className="flex flex-1 flex-col gap-4 md:gap-6">
      <div className="flex flex-col gap-4 md:gap-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Administration</h1>
            <p className="text-muted-foreground">
              Manage school policies, timetables, curriculum, and reports
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline">
              <IconDownload className="mr-2 h-4 w-4" />
              Export Data
            </Button>
            <Button variant="outline">
              <IconUpload className="mr-2 h-4 w-4" />
              Import Data
            </Button>
          </div>
        </div>

        {/* Navigation Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {navItems.map((item) => {
            const IconComponent = item.icon
            const isActive = activeSubModule === item.id

            return (
              <Card
                key={item.id}
                className={`cursor-pointer transition-all hover:shadow-md ${
                  isActive ? 'ring-2 ring-primary shadow-md' : ''
                }`}
                onClick={() => {
                  setActiveSubModule(item.id)
                  window.location.hash = item.id
                }}
              >
                <CardHeader className="pb-3">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${
                      isActive ? 'bg-primary text-primary-foreground' : 'bg-muted'
                    }`}>
                      <IconComponent className="h-5 w-5" />
                    </div>
                    <div>
                      <CardTitle className="text-base">{item.title}</CardTitle>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <CardDescription className="text-sm">
                    {item.description}
                  </CardDescription>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* Active Sub-Module Content */}
        <div className="mt-6">
          {renderSubModule()}
        </div>
      </div>
    </div>
  )
}