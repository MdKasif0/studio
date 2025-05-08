
"use client"

import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { VariantProps, cva } from "class-variance-authority"
import { PanelLeft } from "lucide-react"

import { useIsMobile } from "@/hooks/use-mobile"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { Sheet, SheetContent, SheetTrigger as ShadSheetTrigger } from "@/components/ui/sheet" // Renamed to avoid conflict
import { Skeleton } from "@/components/ui/skeleton"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

const SIDEBAR_COOKIE_NAME = "sidebar_state"
const SIDEBAR_COOKIE_MAX_AGE = 60 * 60 * 24 * 7
const SIDEBAR_WIDTH = "16rem" // Default desktop width
const SIDEBAR_WIDTH_MOBILE = "18rem" // Width for mobile sheet/drawer
const SIDEBAR_WIDTH_ICON = "3.5rem" // Width for collapsed icon-only sidebar on desktop
const SIDEBAR_KEYBOARD_SHORTCUT = "b"

type SidebarContext = {
  state: "expanded" | "collapsed"
  open: boolean // Desktop sidebar state (expanded/collapsed)
  setOpen: (open: boolean) => void
  openMobile: boolean // Mobile sheet state (open/closed)
  setOpenMobile: (open: boolean) => void
  isMobile: boolean
  toggleSidebar: () => void // Toggles based on context (mobile sheet or desktop collapse)
}

const SidebarContext = React.createContext<SidebarContext | null>(null)

function useSidebar() {
  const context = React.useContext(SidebarContext)
  if (!context) {
    throw new Error("useSidebar must be used within a SidebarProvider.")
  }

  return context
}

const SidebarProvider = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div"> & {
    defaultOpen?: boolean // For desktop sidebar's initial state
    open?: boolean
    onOpenChange?: (open: boolean) => void
  }
>(
  (
    {
      defaultOpen = true,
      open: openProp,
      onOpenChange: setOpenProp,
      className,
      style,
      children,
      ...props
    },
    ref
  ) => {
    const isMobile = useIsMobile()
    const [openMobile, setOpenMobile] = React.useState(false) // For mobile Sheet

    const [_open, _setOpen] = React.useState(defaultOpen) // For desktop collapsible sidebar
    const open = openProp ?? _open
    const setOpen = React.useCallback(
      (value: boolean | ((value: boolean) => boolean)) => {
        const openState = typeof value === "function" ? value(open) : value
        if (setOpenProp) {
          setOpenProp(openState)
        } else {
          _setOpen(openState)
        }
        if (!isMobile) { // Only set cookie for desktop state
          document.cookie = `${SIDEBAR_COOKIE_NAME}=${openState}; path=/; max-age=${SIDEBAR_COOKIE_MAX_AGE}`
        }
      },
      [setOpenProp, open, isMobile]
    )

    const toggleSidebar = React.useCallback(() => {
      return isMobile
        ? setOpenMobile((current) => !current)
        : setOpen((current) => !current)
    }, [isMobile, setOpen, setOpenMobile])

    React.useEffect(() => {
      const handleKeyDown = (event: KeyboardEvent) => {
        if (
          event.key === SIDEBAR_KEYBOARD_SHORTCUT &&
          (event.metaKey || event.ctrlKey)
        ) {
          event.preventDefault()
          toggleSidebar()
        }
      }
      window.addEventListener("keydown", handleKeyDown)
      return () => window.removeEventListener("keydown", handleKeyDown)
    }, [toggleSidebar])

    // State for data-state attribute (expanded/collapsed) for desktop
    const state = open ? "expanded" : "collapsed"

    const contextValue = React.useMemo<SidebarContext>(
      () => ({
        state,
        open,
        setOpen,
        isMobile,
        openMobile,
        setOpenMobile,
        toggleSidebar,
      }),
      [state, open, setOpen, isMobile, openMobile, setOpenMobile, toggleSidebar]
    )

    return (
      <SidebarContext.Provider value={contextValue}>
        <TooltipProvider delayDuration={0}>
          <div
            style={
              {
                "--sidebar-width": SIDEBAR_WIDTH,
                "--sidebar-width-icon": SIDEBAR_WIDTH_ICON,
                "--sidebar-width-mobile": SIDEBAR_WIDTH_MOBILE,
                ...style,
              } as React.CSSProperties
            }
            className={cn(
              "group/sidebar-wrapper flex min-h-svh w-full",
              // "has-[[data-variant=inset]]:bg-sidebar-DEFAULT", // This might be too broad
              className
            )}
            ref={ref}
            {...props}
          >
            {children}
          </div>
        </TooltipProvider>
      </SidebarContext.Provider>
    )
  }
)
SidebarProvider.displayName = "SidebarProvider"

// This is the main sidebar component for Desktop
const Sidebar = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"aside"> & { // Changed to aside for semantics
    side?: "left" | "right"
    variant?: "sidebar" | "floating" | "inset" // Inset variant might be interesting
    collapsible?: "icon" | "none" // Offcanvas removed for desktop, handled by sheet for mobile
  }
>(
  (
    {
      side = "left",
      variant = "sidebar", // Default to standard sidebar
      collapsible = "icon", // Default to icon collapse for desktop
      className,
      children,
      ...props
    },
    ref
  ) => {
    const { state, isMobile } = useSidebar() // Don't need openMobile/setOpenMobile here

    if (isMobile) { // Mobile sidebar is handled by TopAppBar/BottomNav/Sheet, not this component
      return null
    }
    
    // Desktop Sidebar Logic
    return (
      <aside // Changed div to aside
        ref={ref}
        className={cn(
          "group hidden md:flex flex-col h-svh bg-sidebar text-sidebar-foreground transition-all duration-300 ease-in-out z-20",
          // Handle width based on state (expanded/collapsed)
          state === "expanded" ? "w-[--sidebar-width]" : "w-[--sidebar-width-icon]",
          side === "left" ? "border-r border-sidebar-border" : "border-l border-sidebar-border", // Apply border
          variant === "floating" && "m-2 rounded-lg shadow-lg border-sidebar-border",
          variant === "inset" && "border-none", // Inset might be within SidebarInset
          collapsible === "none" && "w-[--sidebar-width]!", // Force width if not collapsible
          className
        )}
        data-state={state}
        data-collapsible={collapsible}
        data-variant={variant}
        data-side={side}
        {...props}
      >
        {children}
      </aside>
    )
  }
)
Sidebar.displayName = "Sidebar"


const SidebarTrigger = React.forwardRef< // This trigger can be used for desktop sidebar collapse/expand if needed
  React.ElementRef<typeof Button>,
  React.ComponentProps<typeof Button>
>(({ className, onClick, ...props }, ref) => {
  const { toggleSidebar, isMobile } = useSidebar()

  if(isMobile) return null; // This trigger isn't for the mobile sheet

  return (
    <Button
      ref={ref}
      data-sidebar="trigger"
      variant="ghost"
      size="icon"
      className={cn("h-8 w-8 text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground", className)} // Adjusted size and colors
      onClick={(event) => {
        onClick?.(event)
        toggleSidebar()
      }}
      {...props}
    >
      <PanelLeft className="h-5 w-5"/>
      <span className="sr-only">Toggle Sidebar</span>
    </Button>
  )
})
SidebarTrigger.displayName = "SidebarTrigger"


// SidebarInset is the main content area beside the sidebar
const SidebarInset = React.forwardRef<
  HTMLDivElement, // Changed to div, main is for the primary content block within this
  React.ComponentProps<"div">
>(({ className, ...props }, ref) => {
  const { state, isMobile } = useSidebar();
  if(isMobile) { // On mobile, SidebarInset is not used; main content is directly in MobileLayout
    return <div ref={ref} className={cn("flex-1", className)} {...props} />;
  }
  return (
    <div // This div wraps the header and main content for desktop
      ref={ref}
      className={cn(
        "flex-1 flex flex-col h-svh overflow-hidden transition-[margin-left] duration-300 ease-in-out",
        // Adjust margin based on sidebar state (no adjustment if always icon sidebar)
        // state === 'expanded' ? "md:ml-[--sidebar-width]" : "md:ml-[--sidebar-width-icon]",
        className
      )}
      {...props}
    />
  )
})
SidebarInset.displayName = "SidebarInset"


const SidebarHeader = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div">
>(({ className, ...props }, ref) => {
  const { state } = useSidebar();
  return (
    <div
      ref={ref}
      data-sidebar="header"
      className={cn(
        "flex flex-col shrink-0",
        state === 'expanded' ? "p-4" : "p-2 items-center", // Adjust padding for collapsed state
        className
        )}
      {...props}
    />
  )
})
SidebarHeader.displayName = "SidebarHeader"

const SidebarFooter = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div">
>(({ className, ...props }, ref) => {
   const { state } = useSidebar();
  return (
    <div
      ref={ref}
      data-sidebar="footer"
      className={cn(
        "flex flex-col shrink-0 mt-auto", 
        state === "expanded" ? "p-4 border-t border-sidebar-border" : "p-2 items-center border-t border-sidebar-border",
        className
      )}
      {...props}
    />
  )
})
SidebarFooter.displayName = "SidebarFooter"

const SidebarSeparator = React.forwardRef<
  React.ElementRef<typeof Separator>,
  React.ComponentProps<typeof Separator>
>(({ className, ...props }, ref) => {
  const { state } = useSidebar();
  return (
    <Separator
      ref={ref}
      data-sidebar="separator"
      className={cn(
        state === "expanded" ? "mx-4 my-2" : "my-2", // Adjust margin for collapsed state
        "bg-sidebar-border", 
        className
        )}
      {...props}
    />
  )
})
SidebarSeparator.displayName = "SidebarSeparator"

const SidebarContent = React.forwardRef<
  HTMLDivElement,
  React.ComponentProps<"div">
>(({ className, ...props }, ref) => {
  return (
    <div
      ref={ref}
      data-sidebar="content"
      className={cn(
        "flex-1 overflow-y-auto overflow-x-hidden", // Allow vertical scroll
        "scrollbar-thin scrollbar-thumb-muted scrollbar-track-transparent", // Custom scrollbar styling
        className
      )}
      {...props}
    />
  )
})
SidebarContent.displayName = "SidebarContent"


const SidebarMenu = React.forwardRef<
  HTMLUListElement,
  React.ComponentProps<"ul">
>(({ className, ...props }, ref) => {
  const { state } = useSidebar();
  return (
  <ul
    ref={ref}
    data-sidebar="menu"
    className={cn(
      "flex w-full min-w-0 flex-col gap-1", 
      state === "expanded" ? "px-2 py-2" : "px-1 py-2 items-center",
      className
      )}
    {...props}
  />
  )
})
SidebarMenu.displayName = "SidebarMenu"

const SidebarMenuItem = React.forwardRef<
  HTMLLIElement,
  React.ComponentProps<"li">
>(({ className, ...props }, ref) => (
  <li
    ref={ref}
    data-sidebar="menu-item"
    className={cn("group/menu-item relative w-full", className)} // Ensure item takes full width
    {...props}
  />
))
SidebarMenuItem.displayName = "SidebarMenuItem"


const sidebarMenuButtonVariants = cva(
  "peer/menu-button flex w-full items-center gap-2 overflow-hidden rounded-md p-2 text-left text-sm outline-none ring-sidebar-ring transition-colors duration-150 ease-in-out hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus-visible:ring-2 focus-visible:ring-sidebar-ring active:bg-sidebar-accent/80 active:text-sidebar-accent-foreground disabled:pointer-events-none disabled:opacity-50 data-[active=true]:bg-sidebar-primary data-[active=true]:text-sidebar-primary-foreground data-[active=true]:font-medium group-data-[state=collapsed]:justify-center group-data-[state=collapsed]:px-0 group-data-[state=collapsed]:py-2 group-data-[state=collapsed]:h-auto [&>svg]:size-5 [&>svg]:shrink-0 group-data-[state=expanded]:[&>span]:opacity-100 group-data-[state=collapsed]:[&>span]:opacity-0 group-data-[state=collapsed]:[&>span]:w-0 group-data-[state=collapsed]:[&>span]:hidden",
  {
    variants: {
      variant: {
        default: "",
      },
      size: { // Size might not be needed if we standardize
        default: "h-9",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

const SidebarMenuButton = React.forwardRef<
  HTMLButtonElement,
  React.ComponentProps<"button"> & {
    asChild?: boolean
    isActive?: boolean
    tooltip?: string | React.ComponentProps<typeof TooltipContent>
  } & VariantProps<typeof sidebarMenuButtonVariants>
>(
  (
    {
      asChild = false,
      isActive = false,
      variant = "default",
      size = "default",
      tooltip,
      className,
      children,
      ...props
    },
    ref
  ) => {
    const Comp = asChild ? Slot : "button"
    const { isMobile, state } = useSidebar()

    const buttonContent = (
      <Comp
        ref={ref}
        data-sidebar="menu-button"
        data-active={isActive}
        className={cn(sidebarMenuButtonVariants({ variant, size }), className)}
        {...props}
      >
        {children}
      </Comp>
    )

    if (!tooltip || state === "expanded" || isMobile) { // Show tooltip only when collapsed and not on mobile
      return buttonContent;
    }
    
    // Tooltip logic for collapsed desktop sidebar
    if (typeof tooltip === "string") {
      tooltip = { children: tooltip };
    }

    return (
      <Tooltip>
        <TooltipTrigger asChild>{buttonContent}</TooltipTrigger>
        <TooltipContent
          side="right"
          align="center"
          sideOffset={6}
          className={cn(
            "ml-1 bg-sidebar text-sidebar-foreground border-sidebar-border text-xs px-2 py-1 rounded", // Use sidebar theme vars
            tooltip.className // Allow overriding className from props
          )}
          {...tooltip}
        />
      </Tooltip>
    )
  }
)
SidebarMenuButton.displayName = "SidebarMenuButton"

// Other sub-components like SidebarGroup, SidebarInput etc. can be added here if needed,
// following the pattern of adjusting styles based on `state` (expanded/collapsed).

export {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  // SidebarGroup,
  // SidebarGroupAction,
  // SidebarGroupContent,
  // SidebarGroupLabel,
  SidebarHeader,
  // SidebarInput,
  SidebarInset,
  SidebarMenu,
  // SidebarMenuAction,
  // SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  // SidebarMenuSkeleton,
  // SidebarMenuSub,
  // SidebarMenuSubButton,
  // SidebarMenuSubItem,
  SidebarProvider,
  // SidebarRail, // Removed as it's for a specific type of resizable sidebar
  SidebarSeparator,
  SidebarTrigger, // This is the desktop sidebar trigger
  ShadSheetTrigger, // Exporting the renamed ShadCN trigger for mobile sheet if used elsewhere
  useSidebar,
}
