/**
 * API Route: Create UPI Order
 * Creates a new order without payment gateway verification
 * Assumes payment will be completed via UPI
 */

import { NextResponse } from 'next/server'
import { supabase } from '@/services/supabase'
import QRCode from 'qrcode'

export async function POST(request) {
  try {
    const { studentId, items, total } = await request.json()

    // Generate unique order ID
    const orderId = 'ORD' + Date.now()

    // Generate QR code for the order
    const qrData = await QRCode.toDataURL(orderId)

    // Create order record in database with paid status (no verification)
    const { data, error } = await supabase
      .from('orders')
      .insert([
        {
          order_id: orderId,
          student_id: studentId,
          items: items,
          total_amount: total,
          payment_status: 'paid', // Mark as paid immediately for UPI
          qr_data: qrData,
          ticket_printed: false
        }
      ])
      .select()

    if (error) {
      console.error('Database error:', error)
      return NextResponse.json(
        { success: false, error: 'Failed to create order' },
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
    console.error('Error creating order:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
