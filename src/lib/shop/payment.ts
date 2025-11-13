import type { BillingKeyPaymentInput } from '@portone/server-sdk/dist/generated/common/BillingKeyPaymentInput.js'
import type { ConfirmedPaymentSummary } from '@portone/server-sdk/dist/generated/payment/ConfirmedPaymentSummary.js'
import type { CreatePaymentScheduleResponse } from '@portone/server-sdk/dist/generated/payment/paymentSchedule/CreatePaymentScheduleResponse.js'
import type { Payment } from '@portone/server-sdk/dist/generated/payment/Payment.js'
import type { RevokePaymentSchedulesResponse } from '@portone/server-sdk/dist/generated/payment/paymentSchedule/RevokePaymentSchedulesResponse.js'
import { getPortOneClient } from '@/lib/portone/client'

function paymentClient() {
  return getPortOneClient().payment
}

export async function confirmPortOnePayment({
  paymentId,
  paymentToken,
  txId,
  totalAmount,
  currency = 'KRW',
  taxFreeAmount,
  isTest
}: {
  paymentId: string
  paymentToken: string
  txId?: string | null
  totalAmount?: number
  currency?: string
  taxFreeAmount?: number
  isTest?: boolean
}): Promise<ConfirmedPaymentSummary> {
  return paymentClient().confirmPayment({
    paymentId,
    paymentToken,
    txId: txId ?? undefined,
    totalAmount,
    currency,
    taxFreeAmount,
    isTest
  })
}

export async function getPortOnePayment({
  paymentId,
  impUid
}: {
  paymentId?: string
  impUid?: string
}): Promise<Payment> {
  if (!paymentId && !impUid) {
    throw new Error('포트원 결제 조회를 위해 paymentId 또는 impUid가 필요합니다.')
  }

  if (paymentId) {
    return paymentClient().getPayment({ paymentId })
  }

  const legacyId = impUid!
  // V1 결제 건은 transactionId(=imp_uid)를 paymentId로 간주하여 조회할 수 있습니다.
  return paymentClient().getPayment({ paymentId: legacyId })
}

export async function cancelPortOnePayment({
  paymentId,
  amount,
  taxFreeAmount,
  reason,
  requester = 'Admin'
}: {
  paymentId: string
  amount?: number
  taxFreeAmount?: number
  reason: string
  requester?: 'Customer' | 'Admin'
}) {
  await paymentClient().cancelPayment({
    paymentId,
    amount,
    taxFreeAmount,
    reason,
    requester
  })
}

export async function createPortOnePaymentSchedule({
  paymentId,
  schedule,
  scheduledAt
}: {
  paymentId: string
  schedule: BillingKeyPaymentInput
  scheduledAt: Date
}): Promise<CreatePaymentScheduleResponse> {
  return paymentClient().paymentSchedule.createPaymentSchedule({
    paymentId,
    payment: schedule,
    timeToPay: scheduledAt.toISOString()
  })
}

export async function preRegisterPortOnePayment({
  paymentId,
  totalAmount,
  taxFreeAmount,
  currency = 'KRW'
}: {
  paymentId: string
  totalAmount: number
  taxFreeAmount?: number
  currency?: string
}) {
  return paymentClient().preRegisterPayment({
    paymentId,
    totalAmount,
    taxFreeAmount,
    currency
  })
}

export async function revokePortOnePaymentSchedules({
  billingKey,
  scheduleIds
}: {
  billingKey?: string
  scheduleIds?: string[]
}): Promise<RevokePaymentSchedulesResponse> {
  return paymentClient().paymentSchedule.revokePaymentSchedules({
    billingKey,
    scheduleIds
  })
}

export async function getPortOneBillingKeyInfo(billingKey: string) {
  return paymentClient().billingKey.getBillingKeyInfo({
    billingKey
  })
}

