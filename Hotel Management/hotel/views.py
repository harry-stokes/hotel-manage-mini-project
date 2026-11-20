
from datetime import date, timedelta

from django.shortcuts import render
from django.contrib import messages

from .models import Booking


ROOM_CAPACITY = {
    'single': 5,
    'double': 4,
    'deluxe': 3,
}

ROOM_PRICES = {
    'single': {'weekday': 1500, 'weekend': 1800},
    'double': {'weekday': 2500, 'weekend': 3000},
    'deluxe': {'weekday': 4000, 'weekend': 4800},
}


def calculate_price(room_type, checkin, checkout):
    total = 0
    current = checkin

    while current < checkout:
        # Friday, Saturday and Sunday are weekend days
        if current.weekday() in (4, 5, 6):
            total += ROOM_PRICES[room_type]['weekend']
        else:
            total += ROOM_PRICES[room_type]['weekday']

        current += timedelta(days=1)

    return total


def home(request):

    if request.method == 'POST':

        name = request.POST.get('name', '').strip()
        email = request.POST.get('email', '').strip()
        phone = request.POST.get('phone', '').strip()
        room_type = request.POST.get('room_type')
        checkin_text = request.POST.get('checkin')
        checkout_text = request.POST.get('checkout')

        try:
            checkin = date.fromisoformat(checkin_text)
            checkout = date.fromisoformat(checkout_text)
        except (ValueError, TypeError):
            messages.error(request, 'Please enter valid dates.')
            return render(request, 'index.html')

        if not name or not email or not phone:
            messages.error(request, 'Please fill in all guest details.')

        elif room_type not in ROOM_CAPACITY:
            messages.error(request, 'Please select a valid room type.')

        elif checkin < date.today():
            messages.error(request, 'Check-in cannot be in the past.')

        elif checkout <= checkin:
            messages.error(request, 'Check-out must be after check-in.')

        else:

            overlapping = Booking.objects.filter(
                room_type=room_type,
                checkin__lt=checkout,
                checkout__gt=checkin
            )

            booked_count = overlapping.count()
            capacity = ROOM_CAPACITY[room_type]

            if booked_count >= capacity:
                messages.error(
                    request,
                    'No rooms available for these dates.'
                )

            else:
                total = calculate_price(
                    room_type,
                    checkin,
                    checkout
                )

                Booking.objects.create(
                    name=name,
                    email=email,
                    phone=phone,
                    room_type=room_type,
                    checkin=checkin,
                    checkout=checkout,
                    total_amount=total
                )

                messages.success(
                    request,
                    'Booking registered successfully!'
                )

    today = date.today()

    current_guests = Booking.objects.filter(
        checkin__lte=today,
        checkout__gt=today
    ).order_by('checkin')

    booking_history = Booking.objects.all().order_by('-created_at')

    availability = {}

    for room_type, capacity in ROOM_CAPACITY.items():

        count = Booking.objects.filter(
            checkin__lte=today,
            checkout__gt=today,
            room_type=room_type
        ).count()

        availability[room_type] = {
            'total': capacity,
            'occupied': count,
            'available': capacity - count
        }

    parking_slots = [
        {'name': 'P1', 'status': 'Vacant'},
        {'name': 'P2', 'status': 'Occupied'},
        {'name': 'P3', 'status': 'Vacant'},
        {'name': 'P4', 'status': 'Occupied'},
        {'name': 'P5', 'status': 'Vacant'},
        {'name': 'P6', 'status': 'Vacant'},
        {'name': 'P7', 'status': 'Occupied'},
        {'name': 'P8', 'status': 'Vacant'},
    ]

    context = {
        'current_guests': current_guests,
        'booking_history': booking_history,
        'availability': availability,
        'parking_slots': parking_slots,
    }

    return render(request, 'index.html', context)
