'use client'

import type { SaveDraftButtonClientProps } from 'payload'

import React, { useCallback, useRef } from 'react'
import {
  useForm,
  useFormModified,
  useFormBackgroundProcessing,
  useFormInitializing,
  useFormProcessing,
  useHotkey,
  useConfig,
  useDocumentInfo,
  useEditDepth,
  useLocale,
  useOperation,
  useTranslation,
} from '@payloadcms/ui'
import { cn } from '@/utilities/ui'
import Toolbar, { TooltipTool } from '../Toolbar'
import { SaveIcon } from 'lucide-react'

const baseClass = 'save-draft'

export const SaveDraftButton = React.forwardRef<
  HTMLButtonElement,
  SaveDraftButtonClientProps & {
    className?: string
    children?: React.ReactNode
  }
>((props, ref) => {
  console.log('SaveDraftButton', props)

  const {
    config: {
      routes: { api },
      serverURL,
    },
  } = useConfig()

  const { id, collectionSlug, globalSlug, setUnpublishedVersionCount, uploadStatus } =
    useDocumentInfo()

  const modified = useFormModified()
  const { code: locale } = useLocale()
  const buttonRef = useRef<HTMLButtonElement>(null)
  const divRef = useRef<HTMLDivElement>(null)
  const editDepth = useEditDepth()
  const { t } = useTranslation()
  const form = useForm()
  const operation = useOperation()

  // Form processing states
  const processing = useFormProcessing()
  const backgroundProcessing = useFormBackgroundProcessing()
  const initializing = useFormInitializing()

  console.log('form', form)

  // Check if we're in a form context
  const isInFormContext = form && typeof form.submit === 'function'
  const submit = isInFormContext ? form.submit : null

  const disabled =
    (operation === 'update' && !modified) ||
    uploadStatus === 'uploading' ||
    !isInFormContext ||
    processing ||
    backgroundProcessing ||
    initializing

  const saveDraft = useCallback(async () => {
    if (disabled) {
      return
    }

    // If not in form context, just log or handle gracefully
    if (!isInFormContext) {
      console.log('SaveDraftButton: Not in form context - this is a demo/preview mode')
      return
    }

    const search = `?locale=${locale}&depth=0&fallback-locale=null&draft=true`
    let action
    let method = 'POST'

    if (collectionSlug) {
      action = `${serverURL}${api}/${collectionSlug}${id ? `/${id}` : ''}${search}`
      if (id) {
        method = 'PATCH'
      }
    }

    if (globalSlug) {
      action = `${serverURL}${api}/globals/${globalSlug}${search}`
    }

    try {
      if (submit) {
        await submit({
          action,
          method,
          overrides: {
            _status: 'draft',
          },
          skipValidation: true,
        })

        setUnpublishedVersionCount((count) => count + 1)
      }
    } catch (error) {
      console.error('Error saving draft:', error)
    }
  }, [
    submit,
    collectionSlug,
    globalSlug,
    serverURL,
    api,
    locale,
    id,
    disabled,
    setUnpublishedVersionCount,
    isInFormContext,
  ])

  useHotkey({ cmdCtrlKey: true, editDepth, keyCodes: ['s'] }, (e) => {
    if (disabled) {
      // absorb the event
    }

    e.preventDefault()
    e.stopPropagation()
    if (buttonRef?.current) {
      buttonRef.current.click()
    } else if (divRef?.current) {
      divRef.current.click()
    }
  })

  // If children are provided, render a div wrapper to allow tooltips to work
  // if (props.children) {
  //   return (
  //     <div
  //       className={cn(baseClass, 'cursor-pointer', props.className)}
  //       onClick={() => {
  //         if (!disabled) {
  //           return void saveDraft()
  //         }
  //       }}
  //       ref={divRef}
  //     >
  //       {props.children}
  //     </div>
  //   )
  // }

  // Otherwise, render the Tool component with form functionality
  return (
    <TooltipTool tooltip={t('version:saveDraft')}>
      <button
        ref={ref}
        className={cn(
          'w-8 flex flex-col items-center relative p-1 gap-1 rounded-sm !border-none',
          disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:bg-muted',
          props.className,
        )}
        onClick={() => {
          console.log('clicked', disabled)
          if (!disabled) {
            return void saveDraft()
          }
        }}
        disabled={disabled}
      >
        <Toolbar.TopRow>
          <Toolbar.TopRowDot color="bg-green-400" />
        </Toolbar.TopRow>
        <Toolbar.IconSlot>
          <SaveIcon />
        </Toolbar.IconSlot>
        <Toolbar.BottomRow>30s</Toolbar.BottomRow>
      </button>
    </TooltipTool>
  )
})

SaveDraftButton.displayName = 'SaveDraftButton'
