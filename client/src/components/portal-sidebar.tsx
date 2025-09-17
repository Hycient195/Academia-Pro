"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar"
import { NavMain } from "@/components/nav-main"
import { NavSecondary } from "@/components/nav-secondary"
import { NavUser } from "@/components/nav-user"
import {
  IconSchool,
  IconUserShield,
} from "@tabler/icons-react"
import type { Icon } from "@tabler/icons-react"
import { useSelector, useDispatch } from "react-redux"
import { createSelector } from "@reduxjs/toolkit"
import type { RootState } from "@/redux/store"
import { setActiveRole } from "@/redux/slices/authSlice"
import type { User as AuthUser } from "@/redux/slices/authSlice"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export type PortalRole = "student" | "parent" | "staff" | "school-admin"

type CollapsibleMode = "offcanvas" | "icon" | "none"

const selectRoles = createSelector(
  (state: RootState) => state.auth.user?.roles,
  (roles) => roles ?? []
)

type PortalSidebarProps = React.ComponentProps<typeof Sidebar> & {
  navData: RoleConfig
  user?: {
    name: string
    email: string
    avatar: string
  }
  onLogout?: () => Promise<void>
  redirectTo?: string
}

type BaseNavItem = {
  title: string
  url: string
  icon?: Icon
  shortForm?: string
  isActive?: boolean
}
type NavItemWithChildren = BaseNavItem & {
  items: { title: string; url: string }[]
}
type NavItem = BaseNavItem | NavItemWithChildren

type SecondaryItem = {
  title: string
  url: string
  icon: Icon
  isActive?: boolean
  shortForm?: string
}

export type RoleConfig = {
  label: string
  shortLabel: string
  homeUrl: string
  collapsible: CollapsibleMode
  user: { name: string; email: string; avatar: string }
  navMain: NavItem[]
  navSecondary: SecondaryItem[]
}

export function PortalSidebar({ navData, user, onLogout, redirectTo, ...sidebarProps }: PortalSidebarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const dispatch = useDispatch()
  const roles = useSelector(selectRoles) as AuthUser["roles"]
  const activeRole = useSelector((state: RootState) => state.auth.activeRole ?? ((roles?.[0] as AuthUser["roles"][number]) ?? null))

  const roleLabel = (role: string) => {
    switch (role) {
      case "super-admin": return "Super Admin";
      case "delegated-super-admin": return "Delegated Admin";
      case "school-admin": return "School Admin";
      case "teacher": return "Teacher";
      case "student": return "Student";
      case "parent": return "Parent";
      default: return role;
    }
  }

  const roleToRoute = (role: string) => {
    switch (role) {
      case "student": return "/student/overview";
      case "parent": return "/parent/overview";
      case "staff": return "/staff/overview";
      case "school-admin": return "/school-admin/overview";
      case "super-admin": return "/super-admin/overview";
      case "delegated-super-admin": return "/super-admin/overview";
      default: return "/dashboard";
    }
  }

  const navMainWithActive: NavItem[] = navData.navMain.map((item) => {
    if ("items" in item) {
      const subActive = item.items.some((s) => s.url === pathname)
      return { ...item, isActive: subActive }
    }
    return { ...item, isActive: pathname === item.url }
  })

  const navSecondaryWithActive: SecondaryItem[] = navData.navSecondary.map((item) => ({
    ...item,
    isActive: pathname === item.url,
  }))

  return (
    <Sidebar collapsible="icon" {...sidebarProps}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              tooltip={navData.label}
              className="data-[slot=sidebar-menu-button]:!p-1.5"
            >
              <Link href={navData.homeUrl}>
                <IconSchool className="!size-5" />
                <span className="group-data-[collapsible=icon]:hidden text-base font-semibold">
                  {navData.label}
                </span>
                <span className="hidden group-data-[collapsible=icon]:inline text-xs font-medium">
                  {navData.shortLabel}
                </span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <NavMain items={navMainWithActive} />
        <NavSecondary items={navSecondaryWithActive} className="mt-auto" />
      </SidebarContent>

      <SidebarFooter>
        {roles && roles.length > 1 && (
          <SidebarMenu>
            <SidebarMenuItem>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <SidebarMenuButton
                    tooltip="Switch Dashboard"
                    className="data-[slot=sidebar-menu-button]:!p-1.5"
                  >
                    <IconUserShield className="!size-5" />
                    <span className="group-data-[collapsible=icon]:hidden text-sm">
                      {activeRole ? `Switch: ${roleLabel(activeRole as string)}` : "Switch Dashboard"}
                    </span>
                  </SidebarMenuButton>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="min-w-56">
                  <DropdownMenuLabel>Switch Dashboard</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {roles.map((r) => (
                    <DropdownMenuItem
                      key={r}
                      onClick={() => {
                        dispatch(setActiveRole(r as AuthUser["roles"][number]))
                        router.push(roleToRoute(r as string))
                      }}
                    >
                      <span className="capitalize">{roleLabel(r as string)}</span>
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </SidebarMenuItem>
          </SidebarMenu>
        )}
        <NavUser user={user ?? navData.user} onLogout={onLogout} redirectTo={redirectTo} />
      </SidebarFooter>
    </Sidebar>
  )
}

export default PortalSidebar