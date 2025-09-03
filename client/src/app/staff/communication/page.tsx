"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  IconMail,
  IconPlus,
  IconMessage,
  IconSpeakerphone,
  IconUsers,
  IconFileText,
} from "@tabler/icons-react"

// Import sub-module components
import MessagesComponent from "@/components/staff/communication/messages"
import AnnouncementsComponent from "@/components/staff/communication/announcements"
import ParentPortalComponent from "@/components/staff/communication/parent-portal"
import NotificationsComponent from "@/components/staff/communication/notifications"

// Navigation items for sub-modules
const navItems = [
  {
    id: "messages",
    title: "Messages",
    icon: IconMail,
    description: "Inbox and sent messages",
  },
  {
    id: "announcements",
    title: "Announcements",
    icon: IconSpeakerphone,
    description: "School announcements and notices",
  },
  {
    id: "parents",
    title: "Parent Portal",
    icon: IconUsers,
    description: "Parent engagement and communication",
  },
  {
    id: "notifications",
    title: "Notifications",
    icon: IconMessage,
    description: "Notification settings and preferences",
  },
]

export default function CommunicationPage() {
  const [activeSubModule, setActiveSubModule] = useState("messages")

  // Handle hash-based navigation for sub-modules
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#', '')
      if (hash && ['messages', 'announcements', 'parents', 'notifications'].includes(hash)) {
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
      case "messages":
        return <MessagesComponent />
      case "announcements":
        return <AnnouncementsComponent />
      case "parents":
        return <ParentPortalComponent />
      case "notifications":
        return <NotificationsComponent />
      default:
        return <MessagesComponent />
    }
  }

  return (
    <div className="flex flex-1 flex-col gap-4 md:gap-6">
      <div className="flex flex-col gap-4 md:gap-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Communication Hub</h1>
            <p className="text-muted-foreground">
              Communicate with students, parents, and colleagues
            </p>
          </div>
          <Button>
            <IconPlus className="mr-2 h-4 w-4" />
            Quick Action
          </Button>
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