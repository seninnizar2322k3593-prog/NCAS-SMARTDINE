/**
 * API Route: Create Razorpay Order
 * Creates a new payment order in Razorpay
 */

import { NextResponse } from 'next/server'
import Razorpay from 'razorpay'
import { supabase } from '@/services/supabase'

// Initialize Razorpay instance
const razorpay = new Razorpay({
  key_id: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET
})

export async function POST(request) {
  try {
    const { amount, studentId } = await request.json()

    // Generate unique order ID
    const orderId = 'ORD' + Date.now()

    // Create Razorpay order
    const razorpayOrder = await razorpay.orders.create({
      amount: amount * 100, // Amount in paise
      currency: 'INR',
      receipt: orderId
    })

    // Create order record in database with pending status
    const { data, error } = await supabase
      .from('orders')
      .insert([
        {
          order_id: orderId,
          student_id: studentId,
          items: [],
          total_amount: amount,
          payment_status: 'pending',
          razorpay_order_id: razorpayOrder.id,
          ticket_printed: false
        }
      ])
      .select()

    if (error) {
      console.error('Database error:', error)
      return NextResponse.json(
        { error: 'Failed to create order' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      orderId: orderId,
      razorpayOrderId: razorpayOrder.id,
      amount: amount
    })
  } catch (error) {
    console.error('Error creating order:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
