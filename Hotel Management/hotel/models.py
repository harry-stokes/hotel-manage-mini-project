
from django.db import models


class Booking(models.Model):

    ROOM_CHOICES = [
        ('single', 'Single Room'),
        ('double', 'Double Room'),
        ('deluxe', 'Deluxe Room'),
    ]

    name = models.CharField(max_length=100)
    email = models.EmailField()
    phone = models.CharField(max_length=15)

    room_type = models.CharField(
        max_length=20,
        choices=ROOM_CHOICES
    )

    checkin = models.DateField()
    checkout = models.DateField()

    total_amount = models.PositiveIntegerField(default=0)

    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.name} - {self.room_type}"
