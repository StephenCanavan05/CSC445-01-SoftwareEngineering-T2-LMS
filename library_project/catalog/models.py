# catalog/models.py
from django.db import models
from django.contrib.auth.models import User
from datetime import date, timedelta


class Book(models.Model):
    title = models.CharField(max_length=255)
    author = models.CharField(max_length=255)
    isbn = models.CharField(max_length=13, unique=True)
    genre = models.CharField(max_length=100)
    total_copies = models.IntegerField(default=10)
    available_copies = models.IntegerField(default=10)

    def is_available(self):
        return self.available_copies > 0

    def __str__(self):
        return f"{self.title} ({self.available_copies}/{self.total_copies})"


class Loan(models.Model):
    book = models.ForeignKey(Book, on_delete=models.CASCADE)
    patron = models.ForeignKey(User, on_delete=models.CASCADE)
    checkout_date = models.DateField(auto_now_add=True)
    due_date = models.DateField()
    returned_date = models.DateField(null=True, blank=True)

    @property
    def days_left(self):
        if self.returned_date:
            return 0
        delta = self.due_date - date.today()
        return delta.days

    @property
    def status(self):
        if self.returned_date:
            return "Returned"
        if date.today() > self.due_date:
            return "Overdue"
        return "Active"

    # In catalog/models.py, update the Book class


def save(self, *args, **kwargs):
    if self.available_copies < 0:
        self.available_copies = 0
    if self.available_copies > self.total_copies:
        self.available_copies = self.total_copies
    super().save(*args, **kwargs)
