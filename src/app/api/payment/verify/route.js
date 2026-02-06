/**
 * API Route: Verify Razorpay Payment
 * Verifies payment signature and updates order with payment details
 */

import { NextResponse } from 'next/server'
import crypto from 'crypto'
import { supabase } from '@/services/supabase'
import QRCode from 'qrcode'

export async function POST(request) {
  try {
    const {
      orderId,
      razorpayOrderId,
      razorpayPaymentId,
      razorpaySignature,
      studentId,
      items,
      total
    } = await request.json()

    // Verify signature
    const text = razorpayOrderId + '|' + razorpayPaymentId
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(text)
      .digest('hex')

    if (expectedSignature !== razorpaySignature) {
      return NextResponse.json(
        { success: false, error: 'Invalid signature' },
        { status: 400 }
      )
    }

    // Generate QR code for the order
    const qrData = await QRCode.toDataURL(orderId)

    // Update order with payment details and QR code
    const { data, error } = await supabase
      .from('orders')
      .update({
        payment_status: 'paid',
        razorpay_payment_id: razorpayPaymentId,
        items: items,
        total_amount: total,
        qr_data: qrData
      })
      .eq('order_id', orderId)
      .select()

    if (error) {
      console.error('Database update error:', error)
      return NextResponse.json(
        { success: false, error: 'Failed to update order' },
        { status: 500 }
      )
    }

    // Update food item quantities
    for (const item of items) {
      await supabase.rpc('decrement_food_quantity', {
        food_id: item.id,
        qty: item.quantity
      })
    }

    return NextResponse.json({
      success: true,
      orderId: orderId,
      qrData: qrData
    })
  } catch (error) {
    console.error('Payment verification error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
