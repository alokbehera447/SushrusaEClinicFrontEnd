import os

file_path = '../sushrusha_Django/consultations/views.py'
with open(file_path, 'r') as f:
    content = f.read()

old_logic = """            # Get doctor's availability for the date
            available_slots = DoctorSlot.objects.filter(
                doctor=doctor,
                date=date_obj,
                is_available=True,
                is_booked=False
            ).order_by('start_time')
            
            calculated_slots = []
            
            print(f"DEBUG: Doctor {doctor.name} has {len(available_slots)} available slots")
            print(f"DEBUG: Found {len(existing_consultations)} existing consultations")
            print(f"DEBUG: Consultation duration: {consultation_duration} minutes")
            
            for slot in available_slots:
                # Convert slot times to datetime for calculation
                slot_start = datetime.combine(date_obj, slot.start_time)
                slot_end = datetime.combine(date_obj, slot.end_time)
                
                current_time = slot_start
                
                # Generate consultation slots within this availability period
                while current_time < slot_end:
                    slot_end_time = current_time + timedelta(minutes=consultation_duration)
                    
                    # Don't create slot if it would exceed the availability period
                    if slot_end_time > slot_end:
                        break
                    
                    # OPTIMIZATION: Fast overlap check using pre-computed blocked ranges
                    slot_start_time = current_time.time()
                    slot_end_time_obj = slot_end_time.time()
                    
                    # Check if this slot overlaps with any blocked range
                    is_blocked = False
                    for blocked_start, blocked_end in blocked_ranges:
                        if (slot_start_time < blocked_end and slot_end_time_obj > blocked_start):
                            is_blocked = True
                            break
                    
                    if not is_blocked:
                        slot_data = {
                            'start_time': slot_start_time.strftime('%H:%M'),
                            'end_time': slot_end_time_obj.strftime('%H:%M'),
                            'duration_minutes': consultation_duration,
                            'clinic_name': clinic.name if clinic else 'Default Clinic',
                            'doctor_name': doctor.name,
                            'is_available': True
                        }
                        calculated_slots.append(slot_data)
                        print(f"DEBUG: Created slot {slot_data['start_time']} - {slot_data['end_time']}")
                    else:
                        print(f"DEBUG: Blocked slot {slot_start_time.strftime('%H:%M')} - {slot_end_time_obj.strftime('%H:%M')}")
                    
                    # Move to next slot
                    current_time = slot_end_time"""

new_logic = """            # Get doctor's availability for the date
            available_slots_query = DoctorSlot.objects.filter(
                doctor=doctor,
                date=date_obj,
                is_available=True,
                is_booked=False
            ).order_by('start_time')
            
            calculated_slots = []
            
            # If no specific slots are found, we provide a default daily shift (9 AM to 6 PM)
            # This ensures dynamic booking still works even if doctor hasn't set slots.
            if not available_slots_query.exists():
                from datetime import time
                print(f"DEBUG: No specific slots for {doctor.name}, using default shift")
                # Create a list with one large "availability window" object for calculation
                class DummySlot:
                    def __init__(self, start, end):
                        self.start_time = start
                        self.end_time = end
                available_slots = [DummySlot(time(9, 0), time(12, 30)), DummySlot(time(14, 0), time(18, 0))]
            else:
                available_slots = list(available_slots_query)
            
            print(f"DEBUG: Doctor {doctor.name} has {len(available_slots)} slot windows")
            print(f"DEBUG: Found {len(existing_consultations)} existing consultations")
            
            for slot in available_slots:
                slot_start = datetime.combine(date_obj, slot.start_time)
                slot_end = datetime.combine(date_obj, slot.end_time)
                current_time = slot_start
                
                while current_time < slot_end:
                    slot_end_time = current_time + timedelta(minutes=30) # Using 30 min increments for frontend alignment
                    if slot_end_time > slot_end: break
                    
                    slot_start_time = current_time.time()
                    slot_end_time_obj = slot_end_time.time()
                    
                    is_blocked = False
                    for blocked_start, blocked_end in blocked_ranges:
                        # Check for ANY overlap
                        if (slot_start_time < blocked_end and slot_end_time_obj > blocked_start):
                            is_blocked = True
                            break
                    
                    if not is_blocked:
                        calculated_slots.append({
                            'start_time': slot_start_time.strftime('%H:%M'),
                            'end_time': slot_end_time_obj.strftime('%H:%M'),
                            'duration_minutes': 30,
                            'clinic_name': clinic.name if clinic else 'Sushrusha eClinic',
                            'doctor_name': doctor.name,
                            'is_available': True
                        })
                    
                    current_time = slot_end_time"""

if old_logic in content:
    content = content.replace(old_logic, new_logic)
    with open(file_path, 'w') as f:
        f.write(content)
    print("Successfully patched calculate_available_slots to provide default shifts")
else:
    print("Could not find old_logic in content")
