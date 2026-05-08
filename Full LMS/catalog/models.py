# catalog/models.py
from django.db import models
from django.contrib.auth.models import User
from django.utils import timezone
from datetime import date
from decimal import Decimal


class Book(models.Model):
    title = models.CharField(max_length=255)
    author = models.CharField(max_length=255)
    isbn = models.CharField(max_length=13, unique=True)
    genre = models.CharField(max_length=100, blank=True, null=True)
    total_copies = models.IntegerField(default=1)
    available_copies = models.IntegerField(default=1)

    def __str__(self):
        return f"{self.title} ({self.available_copies}/{self.total_copies})"


class Loan(models.Model):
    book = models.ForeignKey(Book, on_delete=models.CASCADE)
    patron = models.ForeignKey(User, on_delete=models.CASCADE)
    checkout_date = models.DateField(auto_now_add=True)
    due_date = models.DateField()
    returned_date = models.DateField(null=True, blank=True)

    @property
    def is_overdue(self):
        return not self.returned_date and timezone.now().date() > self.due_date

    def calculate_fine(self):
        if self.is_overdue:
            overdue_days = (timezone.now().date() - self.due_date).days
            fine_rate = Decimal('0.25')  # $0.25 per day
            return Decimal(overdue_days) * fine_rate
        return Decimal('0.00')


class Reservation(models.Model):
    book = models.ForeignKey(Book, on_delete=models.CASCADE)
    patron = models.ForeignKey(
        User, on_delete=models.CASCADE, null=True, blank=True)
    reserved_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"{self.patron.username if self.patron else 'No Patron'} reserved {self.book.title}"
