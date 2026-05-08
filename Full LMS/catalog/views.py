import requests
from datetime import timedelta
from django.shortcuts import render, redirect, get_object_or_404
from django.utils import timezone
from django.db.models import Q
from django.contrib import messages
from django.contrib.auth import logout
from django.contrib.auth.decorators import login_required
from django.contrib.auth.models import User
from django.contrib.auth.forms import UserCreationForm
from django.db import transaction
from .models import Book, Loan, Reservation
from django.urls import reverse


def home(request):
    return render(request, 'home.html')


def about(request):
    return render(request, 'about.html')


def contact(request):
    return render(request, 'contact.html')


def registration(request):
    if request.method == 'POST':
        form = UserCreationForm(request.POST)
        # Capture the key from the manual HTML input
        entered_key = request.POST.get('staff_key', '').strip()

        if form.is_valid():
            # commit=False creates the user object without saving to DB yet
            user = form.save(commit=False)
            if entered_key == 'LIBRARY2026':
                user.is_staff = True
                messages.success(
                    request, f'Staff account created for {user.username}!')
            else:
                messages.success(
                    request, f'Patron account created for {user.username}!')

            user.save()
            return redirect('login')
    else:
        form = UserCreationForm()

    return render(request, 'registration/registration.html', {'form': form})


def logout_view(request):
    logout(request)
    return redirect('login')


@login_required
def dashboard_redirect(request):
    if request.user.is_staff:
        return redirect('staff_dashboard')
    return redirect('patron_dashboard')


@login_required
@transaction.atomic
def checkout_book(request, book_id=None):
    """Issues a book to a patron while checking for fines and availability."""
    if not request.user.is_staff:
        return redirect('patron_dashboard')

    if request.method == "POST":
        final_book_id = book_id if (
            book_id and book_id != 0) else request.POST.get('book_id')

        book = Book.objects.select_for_update().get(id=final_book_id)

        patron_id = request.POST.get('patron_id')
        patron = get_object_or_404(User, id=patron_id)

        # Validation: Fines
        unreturned_loans = Loan.objects.filter(
            patron=patron, returned_date__isnull=True)
        total_fines = sum(loan.calculate_fine() for loan in unreturned_loans)

        if total_fines > 0:
            messages.error(
                request, f"BLOCK: {patron.username} has ${total_fines:.2f} in unpaid fines.")
            return redirect('staff_dashboard')

        # Validation: Availability
        if book.available_copies <= 0:
            messages.error(request, "This book is currently out of stock.")
            return redirect('staff_dashboard')

        # Execute Transaction
        Loan.objects.create(
            book=book,
            patron=patron,
            due_date=request.POST.get('due_date')
        )
        book.available_copies -= 1
        book.save()

        messages.success(request, f"Loan issued to {patron.username}.")
        return redirect('staff_dashboard')


@login_required
def return_book(request, loan_id):
    if not request.user.is_staff:
        return redirect('patron_dashboard')

    loan = get_object_or_404(Loan, id=loan_id)
    if not loan.returned_date:
        loan.returned_date = timezone.now().date()
        loan.save()
        book = loan.book
        book.available_copies += 1
        book.save()
        messages.success(request, f"'{book.title}' has been returned.")

    return redirect('staff_dashboard')


def browse_books(request):
    query = request.GET.get('q', '').strip()
    local_books = []
    api_books = []

    if query:
        #  Search Local Database
        local_books = Book.objects.filter(
            title__icontains=query) | Book.objects.filter(author__icontains=query)

        # Search Global
        api_books = fetch_external_books(query)

        # If the API returned nothing, show the info message
        if not api_books:
            messages.info(request, f"No global results found for '{query}'.")

    return render(request, 'browse.html', {
        'local_books': local_books,
        'api_books': api_books,
        'query': query
    })


def fetch_external_books(query):
    """Helper function to talk to Google Books"""
    if not query:
        return []

    # Use the key you provided
    api_key = "YOUR_GOOGLE_BOOKS_API_KEY"
    api_url = "https://www.googleapis.com/books/v1/volumes"
    params = {
        'q': query,
        'key': api_key,
        'maxResults': 20,
        'printType': 'books'
    }

    try:
        response = requests.get(api_url, params=params, timeout=10)
        print(f"DEBUG: API Status {response.status_code}")

        if response.status_code == 200:
            data = response.json()
            items = data.get('items', [])
            results = []

            for item in items:
                volume = item.get('volumeInfo', {})
                identifiers = volume.get('industryIdentifiers', [])

                isbn = 'N/A'
                if identifiers:
                    isbn = next((i['identifier'] for i in identifiers if i['type']
                                == 'ISBN_13'), identifiers[0]['identifier'])

                results.append({
                    'title': volume.get('title', 'Unknown Title'),
                    'authors': ", ".join(volume.get('authors', ['Unknown Author'])),
                    'isbn': isbn,
                    'thumbnail': volume.get('imageLinks', {}).get('thumbnail', ''),
                })
            return results
        else:
            print(f"DEBUG: API Error Body: {response.text}")
            return []

    except Exception as e:
        print(f"DEBUG: Connection Error: {e}")
        return []


def add_to_inventory(request):
    if request.method == "POST":
        query = request.POST.get('q', '')
        isbn = request.POST.get('isbn')
        title = request.POST.get('title')
        author = request.POST.get('author')

        if Book.objects.filter(isbn=isbn).exists():
            messages.error(
                request, f"Duplicate: {title} is already in the system.")
        else:
            Book.objects.create(
                title=title,
                author=author,
                isbn=isbn,
                total_copies=1,
                available_copies=1
            )
            messages.success(request, f"Added {title} to inventory!")

        url = reverse('browse')
        if query:
            url += f'?q={query}'

        return redirect(url)


@login_required
def patron_dashboard(request):
    transactions = Loan.objects.filter(
        patron=request.user).order_by('-due_date')

    my_loans = Loan.objects.filter(
        patron=request.user, returned_date__isnull=True)

    my_reservations = Reservation.objects.filter(
        patron=request.user).order_by('-reserved_at')

    total_fines = sum(
        loan.calculate_fine() for loan in transactions if not loan.returned_date
    )

    today = timezone.now().date()
    for loan in my_loans:
        if loan.due_date:
            delta = loan.due_date - today
            loan.days_remaining = delta.days
        else:
            loan.days_remaining = 0

    context = {
        'my_loans': my_loans,
        'transactions': transactions,
        'my_reservations': my_reservations,
        'total_fines': total_fines,
    }

    return render(request, 'patron_dashboard.html', context)


@login_required
def staff_dashboard(request):
    if not request.user.is_staff:
        return redirect('patron_dashboard')
    query = request.GET.get('loan_q', '').strip()

    active_loans = Loan.objects.filter(returned_date__isnull=True)

    if query:
        active_loans = active_loans.filter(
            Q(book__title__icontains=query) |
            Q(patron__username__icontains=query)
        )

    all_patrons = User.objects.filter(is_staff=False)
    local_books_all = Book.objects.all()

    return render(request, 'staff_dashboard.html', {
        'active_loans': active_loans,
        'all_patrons': all_patrons,
        'local_books_all': local_books_all,
        'query': query,
    })


@login_required
def customer_directory(request):
    query = request.GET.get('user_q', '')
    if query:
        all_patrons = User.objects.filter(
            username__icontains=query, is_staff=False)
    else:
        all_patrons = User.objects.filter(is_staff=False)

    return render(request, 'customer_directory.html', {
        'all_patrons': all_patrons
    })


@login_required
def check_out_tab(request):
    book_q = request.GET.get('book_q', '')
    api_books = []
    local_books = []

    if book_q:
        # Search local inventory
        local_books = Book.objects.filter(title__icontains=book_q)

        # Search Google Books API
        response = requests.get(
            f'https://www.googleapis.com/books/v1/volumes?q={book_q}')
        if response.status_code == 200:
            data = response.json()
            for item in data.get('items', []):
                info = item.get('volumeInfo', {})
                api_books.append({
                    'title': info.get('title'),
                    'authors': ", ".join(info.get('authors', ['Unknown'])),
                    'isbn': info.get('industryIdentifiers', [{}])[0].get('identifier', 'N/A'),
                    'thumbnail': info.get('imageLinks', {}).get('thumbnail'),
                })

    return render(request, 'check_out.html', {
        'local_books': local_books,
        'api_books': api_books,
        'all_patrons': User.objects.filter(is_staff=False),
    })


@login_required
def patron_detail(request, pk):
    patron = get_object_or_404(User, pk=pk)
    transactions = Loan.objects.filter(patron=patron).order_by('-due_date')

    total_fines = sum(
        loan.calculate_fine() for loan in transactions if not loan.returned_date
    )

    return render(request, 'patron_detail.html', {
        'patron': patron,
        'transactions': transactions,
        'total_fines': total_fines,
    })


@login_required
def add_to_reservation(request, book_id):
    book = get_object_or_404(Book, id=book_id)
    already_has = Loan.objects.filter(
        patron=request.user, book=book, returned_date__isnull=True).exists()

    if already_has:
        messages.warning(request, "You already have this book checked out!")
    else:
        Reservation.objects.get_or_create(patron=request.user, book=book)
        messages.success(request, f"'{book.title}' reserved.")

    return redirect('patron_dashboard')


@login_required
def send_patron_email(request, pk):

    if not request.user.is_staff:

        return redirect('home')

    patron = get_object_or_404(User, pk=pk)

    messages.success(request, f"Draft email opened for {patron.email}")

    return redirect('patron_detail', pk=pk)


@login_required
def remove_reservation(request, res_id):
    """Allows both Patrons and Staff to cancel a reservation."""
    res = get_object_or_404(Reservation, id=res_id)

    if request.user == res.patron or request.user.is_staff:
        res.delete()
        messages.success(request, "Reservation removed.")
    else:
        messages.error(request, "Unauthorized action.")

    return redirect(request.META.get('HTTP_REFERER', 'dashboard_redirect'))


@login_required
@transaction.atomic
def convert_reservation_to_loan(request, res_id):
    if not request.user.is_staff:
        return redirect('patron_dashboard')

    res = get_object_or_404(Reservation, id=res_id)
    book = Book.objects.select_for_update().get(id=res.book.id)
    patron = res.patron

    if not patron:
        messages.error(request, "This reservation has no assigned patron.")
        return redirect('staff_dashboard')

    if book.available_copies <= 0:
        messages.error(
            request, "No copies available to fulfill this reservation yet.")
        return redirect('patron_detail', pk=patron.id)

    Loan.objects.create(
        book=book,
        patron=patron,
        due_date=timezone.now().date() + timedelta(days=14)
    )

    book.available_copies -= 1
    book.save()
    res.delete()

    messages.success(request, f"Reservation fulfilled for {patron.username}.")
    return redirect('patron_detail', pk=patron.id)
