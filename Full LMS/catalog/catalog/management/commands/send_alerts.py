from django.core.management.base import BaseCommand
from django.core.mail import send_mail
from django.utils import timezone
from datetime import timedelta
from catalog.models import Loan


class Command(BaseCommand):
    help = 'Sends automated email notifications for upcoming and overdue loans'

    def handle(self, *args, **options):
        today = timezone.now().date()
        three_days_from_now = today + timedelta(days=3)

        # 1. Alert: 3 days away from being due
        upcoming = Loan.objects.filter(
            due_date=three_days_from_now, returned_date__isnull=True)
        for loan in upcoming:
            send_mail(
                'Library Reminder: Due in 3 Days',
                f'Hi {loan.patron.username}, "{loan.book.title}" is due on {loan.due_date}.',
                'library@yoursystem.com',
                [loan.patron.email],
            )

        # 2. Alert: Officially Overdue
        overdue = Loan.objects.filter(
            due_date__lt=today, returned_date__isnull=True)
        for loan in overdue:
            send_mail(
                'URGENT: Library Book Overdue',
                f'Hi {loan.patron.username}, "{loan.book.title}" was due on {loan.due_date}. Fines are now accruing.',
                'library@yoursystem.com',
                [loan.patron.email],
            )

        self.stdout.write(self.style.SUCCESS(
            'Successfully sent library alerts.'))
