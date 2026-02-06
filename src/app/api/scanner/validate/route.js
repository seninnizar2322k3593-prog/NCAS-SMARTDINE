/**
 * API Route: Validate QR and Mark Ticket as Printed
 * Used by scanner to validate order and mark ticket as printed
 */

import { NextResponse } from 'next/server'
import { supabase } from '@/services/supabase'

export async function POST(request) {
  try {
    const { orderId } = await request.json()

    // Get order details
    const { data: order, error } = await supabase
      .from('orders')
      .select('*')
      .eq('order_id', orderId)
      .single()

    if (error || !order) {
      return NextResponse.json(
        { success: false, error: 'Order not found' },
        { status: 404 }
      )
    }

    // Validate payment status
    if (order.payment_status !== 'paid') {
      return NextResponse.json(
        { success: false, error: 'Payment not completed' },
        { status: 400 }
      )
    }

    // Check if ticket already printed
    if (order.ticket_printed) {
      return NextResponse.json(
        { success: false, error: 'Ticket already printed' },
        { status: 400 }
      )
    }

    // Mark ticket as printed
    const { data: updatedOrder, error: updateError } = await supabase
      .from('orders')
      .update({ ticket_printed: true })
      .eq('order_id', orderId)
      .select()

    if (updateError) {
      return NextResponse.json(
        { success: false, error: 'Failed to update order' },
        { status: 500 }
      )
    }

    // Get student details
    const { data: student } = await supabase
      .from('students')
      .select('name')
      .eq('student_id', order.student_id)
      .single()

    return NextResponse.json({
      success: true,
      order: {
        ...order,
        studentName: student?.name || 'Unknown'
      }
    })
  } catch (error) {
    console.error('QR validation error:', error)
    return NextResponse.json(
      { success: false, error: 'Internal server error' },
      { status: 500 }
    )
  }
}
