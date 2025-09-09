"use client"

import React, { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { IconPlayerPause, IconPlayerPlay } from "@tabler/icons-react"
import { apis } from "@/redux/api"
import ErrorBlock from "@/components/utilities/ErrorBlock"

interface SuspendConfirmationModalProps {
  isOpen: boolean
  onClose: () => void
  accountId: string
  accountEmail: string
  isCurrentlySuspended: boolean
}

export function SuspendConfirmationModal({
  isOpen,
  onClose,
  accountId,
  accountEmail,
  isCurrentlySuspended
}: SuspendConfirmationModalProps) {
  const [suspendDelegatedAccount, { isLoading: suspendLoading, error: suspendError }] = apis.superAdmin.useSuspendDelegatedAccountMutation()
  const [unsuspendDelegatedAccount, { isLoading: unsuspendLoading, error: unsuspendError }] = apis.superAdmin.useUnsuspendDelegatedAccountMutation()

  const [formData, setFormData] = useState({
    accountId: '',
    operation: 'suspend' as 'suspend' | 'unsuspend'
  })

  // Update form data when props change
  useEffect(() => {
    setFormData({
      accountId,
      operation: isCurrentlySuspended ? 'unsuspend' : 'suspend'
    })
  }, [accountId, isCurrentlySuspended])

  const isLoading = suspendLoading || unsuspendLoading
  const error = suspendError || unsuspendError

  const handleConfirm = async () => {
    try {
      if (formData.operation === 'unsuspend') {
        await unsuspendDelegatedAccount(formData.accountId).unwrap()
      } else {
        await suspendDelegatedAccount(formData.accountId).unwrap()
      }
      onClose()
    } catch (error) {
      console.error("Failed to change account status:", error)
    }
  }
  const isSuspending = formData.operation === 'suspend'

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center">
            {isSuspending ? (
              <>
                <IconPlayerPause className="mr-2 h-5 w-5 text-orange-500" />
                Suspend Delegated Account
              </>
            ) : (
              <>
                <IconPlayerPlay className="mr-2 h-5 w-5 text-green-500" />
                Unsuspend Delegated Account
              </>
            )}
          </DialogTitle>
          <DialogDescription>
            {isSuspending ? (
              <>
                Are you sure you want to suspend the delegated account for{" "}
                <span className="font-medium">{accountEmail}</span>?
                <br />
                <br />
                The account will be temporarily disabled and the user will not be able
                to perform any delegated actions until the account is unsuspended.
              </>
            ) : (
              <>
                Are you sure you want to unsuspend the delegated account for{" "}
                <span className="font-medium">{accountEmail}</span>?
                <br />
                <br />
                The account will be reactivated and the user will regain access to
                perform their delegated actions.
              </>
            )}
          </DialogDescription>
        </DialogHeader>
        <ErrorBlock error={error} />
        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button
            variant={isSuspending ? "destructive" : "default"}
            onClick={handleConfirm}
            disabled={isLoading}
          >
            {isLoading ? (
              isSuspending ? "Suspending..." : "Unsuspending..."
            ) : (
              isSuspending ? "Suspend Account" : "Unsuspend Account"
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}