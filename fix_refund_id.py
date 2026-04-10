import os
file_path = '../sushrusha_Django/payments/models.py'
with open(file_path, 'r') as f:
    content = f.read()

old_code = """            last_refund = PaymentRefund.objects.order_by('id').last()
            if last_refund:
                last_number = int(last_refund.id[3:])
                new_number = last_number + 1
            else:
                new_number = 1"""

new_code = """            last_refund = PaymentRefund.objects.filter(id__startswith='REF').order_by('id').last()
            new_number = 1
            if last_refund and last_refund.id[3:].isdigit():
                new_number = int(last_refund.id[3:]) + 1
            else:
                new_number = PaymentRefund.objects.count() + 1
"""

if old_code in content:
    content = content.replace(old_code, new_code)
    with open(file_path, 'w') as f:
        f.write(content)
    print("Successfully updated Refund ID generation in models.py")
else:
    print("Code not found!")
