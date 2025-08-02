'use client'

import {
  CopyIcon,
  DotIcon,
  Edit,
  EllipsisIcon,
  LayersIcon,
  PlusIcon,
  SaveIcon,
  TrashIcon,
  UploadIcon,
  ZapIcon,
} from 'lucide-react'
import React from 'react'
import { DefaultEditView, Form, PublishButton, SaveButton, useTranslation } from '@payloadcms/ui'
import { Toggle } from '@/components/ui/toggle'
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'
import { SaveDraftButton } from '../payload-ui/SaveDraftButton'

// Context for passing selected state to children
const ToolContext = React.createContext<{ selected: boolean }>({ selected: false })

export function ToolbarWrapper({ children }: { children: React.ReactNode }) {
  return <div className="flex items-center border border-border rounded-lg ">{children}</div>
}

export function Group({ children }: { children: React.ReactNode }) {
  return <div className="flex items-center space-x-1 m-0.5">{children}</div>
}

interface TopRowProps {
  children?: React.ReactNode
  variant?: 'text' | 'dot'
  color?: string
}

export function TopRow({ children, variant = 'text', color = 'bg-green-400' }: TopRowProps) {
  return (
    <div className="relative">
      <div className="text-xs u-text-style- opacity-0 pointer-events-none">-</div>
      {children ? children : null}
    </div>
  )
}

export function TopRowDot({ children, color = 'bg-green-400' }: TopRowProps) {
  return (
    <div className="w-full absolute top-1/2 right-0 bottom-0">
      <div className="flex justify-end">
        <div className={`w-1.5 h-1.5 ${color} rounded-full`} />
      </div>
    </div>
  )
}

interface BottomRowProps {
  children?: React.ReactNode
}

export function BottomRow({ children }: BottomRowProps) {
  return children ? (
    <div className="text-xs u-text-style-">{children}</div>
  ) : (
    <div className="text-xs u-text-style- opacity-0 pointer-events-none">-</div>
  )
}

interface IconSlotProps {
  children: React.ReactNode
  selected?: boolean
}

export function IconSlot({ children }: IconSlotProps) {
  const { selected } = React.useContext(ToolContext)

  // Check if the child is a React element (likely an icon)
  const isIcon = React.isValidElement(children) && typeof children.type !== 'string'

  if (isIcon && children.props) {
    // Clone the element and merge the className
    const iconClasses = selected ? 'w-4 h-4 text-foreground' : 'w-4 h-4 text-muted-foreground'

    return (
      <div className="flex items-center justify-center">
        {React.cloneElement(children as React.ReactElement<any>, {
          className: `${iconClasses} ${(children.props as any).className || ''}`.trim(),
        })}
      </div>
    )
  }

  return <div className="flex items-center justify-center">{children}</div>
}

interface ToolProps {
  children: React.ReactNode
  variant?: 'default' | 'toggle' | 'shadcn-toggle'
  selected?: boolean
  disabled?: boolean
  onClick?: () => void
}

const Tool = React.forwardRef<HTMLButtonElement, ToolProps>(
  ({ children, variant = 'default', selected = false, disabled = false, onClick }, ref) => {
    const baseClasses = 'w-8 flex flex-col items-center relative p-1 gap-1 rounded-sm !border-none'

    if (variant === 'shadcn-toggle') {
      return (
        <ToolContext.Provider value={{ selected }}>
          <Toggle
            ref={ref}
            pressed={selected}
            onPressedChange={onClick}
            className="flex-col h-auto p-1"
            disabled={disabled}
          >
            {children}
          </Toggle>
        </ToolContext.Provider>
      )
    }

    if (variant === 'toggle') {
      const toggleClasses = selected
        ? 'bg-primary text-primary-foreground hover:bg-primary/90'
        : 'hover:bg-muted'

      const disabledClasses = disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'

      return (
        <ToolContext.Provider value={{ selected }}>
          <button
            ref={ref}
            className={`${baseClasses} ${toggleClasses} ${disabledClasses} transition-colors`}
            onClick={() => {
              if (!disabled) {
                console.log('clicked')
                onClick?.()
              }
            }}
            disabled={disabled}
          >
            {children}
          </button>
        </ToolContext.Provider>
      )
    }

    const disabledClasses = disabled
      ? 'opacity-50 cursor-not-allowed'
      : 'cursor-pointer hover:bg-muted'

    return (
      <ToolContext.Provider value={{ selected }}>
        <button
          ref={ref}
          className={`${baseClasses} ${disabledClasses}`}
          onClick={() => {
            if (!disabled) {
              onClick?.()
            }
          }}
          disabled={disabled}
        >
          {children}
        </button>
      </ToolContext.Provider>
    )
  },
)

Tool.displayName = 'Tool'

// Tooltip Tool wrapper
interface TooltipToolProps {
  children: React.ReactNode
  tooltip: React.ReactNode
}

export function TooltipTool({ children, tooltip }: TooltipToolProps) {
  return (
    <Tooltip delayDuration={0}>
      <TooltipTrigger asChild>{children}</TooltipTrigger>
      <TooltipContent>{tooltip}</TooltipContent>
    </Tooltip>
  )
}

// New ToggleGroup Tool component
interface ToggleGroupToolProps {
  children: React.ReactNode
  value: string
  'aria-label': string
}

function ToggleGroupTool({ children, value, 'aria-label': ariaLabel }: ToggleGroupToolProps) {
  return (
    <ToggleGroupItem value={value} aria-label={ariaLabel} className="h-auto p-1 flex-col">
      {children}
    </ToggleGroupItem>
  )
}

// Dropdown Tool component
interface DropdownToolProps {
  children: React.ReactNode
  dropdownItems: React.ReactNode
}

function DropdownTool({ children, dropdownItems }: DropdownToolProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <div className="w-8 flex flex-col items-center relative p-1 gap-1 rounded-sm hover:bg-muted cursor-pointer">
          {children}
        </div>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="p-1">
        {dropdownItems}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export default function Toolbar(props: DocumentViewClientProps) {
  const [selectedTool, setSelectedTool] = React.useState<string | null>(null)
  const [singleSelectValue, setSingleSelectValue] = React.useState<string>('')
  const [multiSelectValues, setMultiSelectValues] = React.useState<string[]>([])
  const { t } = useTranslation()

  return (
    <>
      <Form>
        <TooltipProvider>
          <div className="flex flex-col gap-4 m-4">
            {/* Original variants */}
            <ToolbarWrapper>
              <Group>
                <SaveDraftButton />
                <TooltipTool tooltip={t('version:saveDraft')}>
                  <PublishButton />
                </TooltipTool>
                {/* <TooltipTool tooltip="Upload">
                    <Tool
                      variant="toggle"
                      selected={selectedTool === 'upload'}
                      onClick={() => setSelectedTool(selectedTool === 'upload' ? null : 'upload')}
                    >
                      <TopRow>2</TopRow>
                      <IconSlot>
                        <UploadIcon />
                      </IconSlot>
                      <BottomRow></BottomRow>
                    </Tool>
                  </TooltipTool> */}
                <TooltipTool tooltip="More Options">
                  <DropdownTool
                    dropdownItems={
                      <div className="flex items-center space-x-1">
                        <Tool>
                          <TopRow variant="dot" color="bg-blue-400" />
                          <IconSlot>
                            <PlusIcon />
                          </IconSlot>
                          <BottomRow>Create new</BottomRow>
                        </Tool>
                        <Tool>
                          <TopRow variant="text">3</TopRow>
                          <IconSlot>
                            <CopyIcon />
                          </IconSlot>
                          <BottomRow>Duplicate</BottomRow>
                        </Tool>
                        <Tool>
                          <TopRow color="bg-yellow-400" />
                          <IconSlot>
                            <TrashIcon />
                          </IconSlot>
                          <BottomRow>Delete</BottomRow>
                        </Tool>
                      </div>
                    }
                  >
                    <TopRow color="bg-red-400" />
                    <IconSlot>
                      <EllipsisIcon />
                    </IconSlot>
                    <BottomRow></BottomRow>
                  </DropdownTool>
                </TooltipTool>
              </Group>
              <Group>
                <TooltipTool tooltip="Views">
                  <DropdownTool
                    dropdownItems={
                      <div className="flex items-center space-x-1">
                        <Tool>
                          <TopRow variant="dot" color="bg-blue-400" />
                          <IconSlot>
                            <Edit />
                          </IconSlot>
                          <BottomRow>Edit</BottomRow>
                        </Tool>
                        <Tool>
                          <TopRow variant="text">3</TopRow>
                          <IconSlot>
                            <LayersIcon />
                          </IconSlot>
                          <BottomRow>Versions</BottomRow>
                        </Tool>
                        <Tool>
                          <TopRow color="bg-yellow-400" />
                          <IconSlot>
                            <ZapIcon />
                          </IconSlot>
                          <BottomRow>API</BottomRow>
                        </Tool>
                      </div>
                    }
                  >
                    <TopRow color="bg-red-400" />
                    <IconSlot>
                      <EllipsisIcon />
                    </IconSlot>
                    <BottomRow></BottomRow>
                  </DropdownTool>
                </TooltipTool>
              </Group>
            </ToolbarWrapper>

            {/* Shadcn Toggle variant */}
            {/* <ToolbarWrapper title="Shadcn Toggle:">
                <Group>
                  <TooltipTool tooltip={t('version:saveDraft')}>
                    <Tool
                      variant="shadcn-toggle"
                      selected={selectedTool === 'save1'}
                      onClick={() => setSelectedTool(selectedTool === 'save1' ? null : 'save1')}
                    >
                      <TopRow variant="dot" color="bg-green-400" />
                      <IconSlot>
                        <SaveIcon />
                      </IconSlot>
                      <BottomRow>30s</BottomRow>
                    </Tool>
                  </TooltipTool>
                  <TooltipTool tooltip="Upload">
                    <Tool
                      variant="shadcn-toggle"
                      selected={selectedTool === 'upload1'}
                      onClick={() => setSelectedTool(selectedTool === 'upload1' ? null : 'upload1')}
                    >
                      <TopRow variant="text">2</TopRow>
                      <IconSlot>
                        <UploadIcon />
                      </IconSlot>
                      <BottomRow></BottomRow>
                    </Tool>
                  </TooltipTool>
                </Group>
              </ToolbarWrapper> */}

            {/* Single Select ToggleGroup */}
            {/* <ToolbarWrapper title="Single Select:">
                <ToggleGroup
                  type="single"
                  value={singleSelectValue}
                  onValueChange={(value) => value && setSingleSelectValue(value)}
                  className="flex items-center space-x-1 m-0.5"
                >
                  <ToggleGroupTool value="save" aria-label="Save">
                    <TopRow variant="dot" color="bg-green-400" />
                    <IconSlot>
                      <SaveIcon />
                    </IconSlot>
                    <BottomRow>30s</BottomRow>
                  </ToggleGroupTool>
                  <ToggleGroupTool value="upload" aria-label="Upload">
                    <TopRow variant="text">2</TopRow>
                    <IconSlot>
                      <UploadIcon />
                    </IconSlot>
                    <BottomRow></BottomRow>
                  </ToggleGroupTool>
                  <ToggleGroupTool value="ellipsis" aria-label="More">
                    <TopRow color="bg-red-400" />
                    <IconSlot>
                      <EllipsisIcon />
                    </IconSlot>
                    <BottomRow></BottomRow>
                  </ToggleGroupTool>
                </ToggleGroup>
              </ToolbarWrapper> */}

            {/* Multi Select ToggleGroup */}
            {/* <ToolbarWrapper title="Multi Select:">
                <ToggleGroup
                  type="multiple"
                  value={multiSelectValues}
                  onValueChange={setMultiSelectValues}
                  className="flex items-center space-x-1 m-0.5"
                >
                  <ToggleGroupTool value="save" aria-label="Save">
                    <TopRow variant="dot" color="bg-green-400" />
                    <IconSlot>
                      <SaveIcon />
                    </IconSlot>
                    <BottomRow>30s</BottomRow>
                  </ToggleGroupTool>
                  <ToggleGroupTool value="upload" aria-label="Upload">
                    <TopRow variant="text">2</TopRow>
                    <IconSlot>
                      <UploadIcon />
                    </IconSlot>
                    <BottomRow></BottomRow>
                  </ToggleGroupTool>
                  <ToggleGroupTool value="ellipsis" aria-label="More">
                    <TopRow color="bg-red-400" />
                    <IconSlot>
                      <EllipsisIcon />
                    </IconSlot>
                    <BottomRow></BottomRow>
                  </ToggleGroupTool>
                </ToggleGroup>
              </ToolbarWrapper> */}
          </div>
        </TooltipProvider>
      </Form>
      <DefaultEditView {...props} />
    </>
  )
}
import type { DocumentViewClientProps } from 'payload'
Toolbar.Wrapper = ToolbarWrapper
Toolbar.Group = Group
Toolbar.Tool = Tool
Toolbar.TooltipTool = TooltipTool
Toolbar.ToggleGroupTool = ToggleGroupTool
Toolbar.DropdownTool = DropdownTool
Toolbar.TopRow = TopRow
Toolbar.TopRowDot = TopRowDot
Toolbar.BottomRow = BottomRow
Toolbar.IconSlot = IconSlot
