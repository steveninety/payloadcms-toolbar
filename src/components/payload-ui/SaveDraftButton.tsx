'use client'

import type { SaveDraftButtonClientProps } from 'payload'

import React, { useCallback } from 'react'
import {
  useConfig,
  useDocumentInfo,
  useEditDepth,
  useForm,
  useFormModified,
  useLocale,
  useOperation,
  useTranslation,
} from '@payloadcms/ui'
import { FormSubmit } from './FormSubmit'
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
  const { id, collectionSlug, globalSlug, setUnpublishedVersionCount, uploadStatus } = useDocumentInfo()
  const { t } = useTranslation()
  const { code: localeCode } = useLocale()
  const {
    config: {
      routes: { api },
      serverURL,
    },
  } = useConfig()

  const { submit } = useForm()
  const modified = useFormModified()
  const operation = useOperation()
  
  // This is the crucial logic that was missing!
  const disabled = (operation === 'update' && !modified) || uploadStatus === 'uploading'
  
  const handleSaveDraft = useCallback(async () => {
    if (disabled) {
      return
    }

    const search = `?locale=${localeCode}&depth=0&fallback-locale=null&draft=true`
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

    await submit({
      action,
      method,
      overrides: {
        _status: 'draft',
      },
      skipValidation: true,
    })

    setUnpublishedVersionCount((count) => count + 1)
  }, [disabled, submit, collectionSlug, globalSlug, id, localeCode, serverURL, api, setUnpublishedVersionCount])

  return (
    <FormSubmit
      buttonId="action-save-draft"
      disabled={disabled}
      onClick={handleSaveDraft}
      type="button"
      render={({ buttonProps, disabled: formDisabled }) => (
        <TooltipTool tooltip={t('version:saveDraft')}>
          <button
            {...buttonProps}
            ref={ref}
            className={cn(
              'w-8 flex flex-col items-center relative p-1 gap-1 rounded-sm !border-none',
              (disabled || formDisabled) ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:bg-muted',
              props.className,
            )}
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
      )}
    />
  )
})

SaveDraftButton.displayName = 'SaveDraftButton'
