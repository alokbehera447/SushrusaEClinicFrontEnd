import os

file_path = '../sushrusha_Django/payments/razorpay_views.py'
with open(file_path, 'r') as f:
    content = f.read()

# 1. Update RazorpayVerifyPaymentView to handle existing payments and update consultation
old_verify_logic = """        payment = Payment(
            patient=request.user,
            doctor=rzp_order_record.consultation.doctor if rzp_order_record.consultation else None,
            consultation=rzp_order_record.consultation,
            amount=rzp_order_record.amount,
            currency=rzp_order_record.currency,
            payment_type="consultation",
            description=rzp_order_record.notes.get("description", "Consultation Payment"),
            payment_method=internal_method,
            payment_method_details=rzp_payment_details,
            status="completed",
            gateway_name="razorpay",
            gateway_transaction_id=payment_id,
            gateway_response=rzp_payment_details,
            net_amount=rzp_order_record.amount,
            processed_at=timezone.now(),
            completed_at=timezone.now(),
        )
        payment.save()"""

new_verify_logic = """        # Check for existing pending payment for this consultation to avoid duplicates
        payment = None
        if rzp_order_record.consultation:
            payment = Payment.objects.filter(
                consultation=rzp_order_record.consultation,
                status='pending'
            ).first()

        if payment:
            # Update existing payment
            payment.payment_method = internal_method
            payment.payment_method_details = rzp_payment_details
            payment.status = "completed"
            payment.gateway_name = "razorpay"
            payment.gateway_transaction_id = payment_id
            payment.gateway_response = rzp_payment_details
            payment.processed_at = timezone.now()
            payment.completed_at = timezone.now()
            payment.save()
        else:
            # Create new internal Payment record
            payment = Payment.objects.create(
                patient=request.user,
                doctor=rzp_order_record.consultation.doctor if rzp_order_record.consultation else None,
                consultation=rzp_order_record.consultation,
                amount=rzp_order_record.amount,
                currency=rzp_order_record.currency,
                payment_type="consultation",
                description=rzp_order_record.notes.get("description", "Consultation Payment"),
                payment_method=internal_method,
                payment_method_details=rzp_payment_details,
                status="completed",
                gateway_name="razorpay",
                gateway_transaction_id=payment_id,
                gateway_response=rzp_payment_details,
                net_amount=rzp_order_record.amount,
                processed_at=timezone.now(),
                completed_at=timezone.now(),
            )

        # ── Update Consultation record status ───────────────────────────
        if rzp_order_record.consultation:
            cons = rzp_order_record.consultation
            cons.payment_status = 'paid'
            cons.is_paid = True
            cons.payment_method = internal_method
            cons.save()"""

if old_verify_logic in content:
    content = content.replace(old_verify_logic, new_verify_logic)
else:
    print("Could not find old_verify_logic in content")

# 2. Update Webhook handlers to also update consultation
old_webhook_capture = """        # Update linked internal payment if it exists
        if rzp_record.payment:
            payment = rzp_record.payment
            payment.status = "completed"
            payment.gateway_response = payment_entity
            payment.processed_at = timezone.now()
            payment.completed_at = timezone.now()
            payment.save()"""

new_webhook_capture = """        # Update linked internal payment if it exists
        if rzp_record.payment:
            payment = rzp_record.payment
            payment.status = "completed"
            payment.gateway_response = payment_entity
            payment.processed_at = timezone.now()
            payment.completed_at = timezone.now()
            payment.save()
        
        # ── Update Consultation record status ───────────────────────────
        if rzp_record.consultation:
            cons = rzp_record.consultation
            cons.payment_status = 'paid'
            cons.is_paid = True
            cons.save()"""

if old_webhook_capture in content:
    content = content.replace(old_webhook_capture, new_webhook_capture)
else:
    print("Could not find old_webhook_capture in content")

with open(file_path, 'w') as f:
    f.write(content)
