import os
file_path = '../sushrusha_Django/payments/models.py'
with open(file_path, 'r') as f:
    content = f.read()

old_code = """            last_payment = Payment.objects.order_by('id').last()
            if last_payment:
                last_number = int(last_payment.id[3:])
                new_number = last_number + 1
            else:
                new_number = 1"""

new_code = """            # Safe ID generation
            last_payment = Payment.objects.filter(id__startswith='PAY').order_by('id').last()
            new_number = 1
            if last_payment and last_payment.id[3:].isdigit():
                new_number = int(last_payment.id[3:]) + 1
            else:
                new_number = Payment.objects.count() + 1
"""

if old_code in content:
    content = content.replace(old_code, new_code)
    with open(file_path, 'w') as f:
        f.write(content)
    print("Successfully updated Payment ID generation in models.py")
else:
    print("Code not found!")
