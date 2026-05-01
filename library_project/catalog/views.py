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
from .models import Book, Loan


def home(request):
    return render(request, 'home.html')


def registration(request):
    if request.method == 'POST':
        form = UserCreationForm(request.POST)
        if form.is_valid():
            form.save()
            username = form.cleaned_data.get('username')
            messages.success(
                request, f'Account created for {username}! You can now login.')
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

# --- Dashboards & Browse ---


def fetch_external_books(query):
    """Calls Google Books API multiple times to retrieve up to 100 results."""
    if not query:
        return []

    api_key = "PLACEHOLDER"
    search_param = f"isbn:{query}" if (
        query.isdigit() and len(query) >= 10) else query
    external_books = []

    # Google Books API max results per page is 40.
    # To get 100, we fetch 3 pages (40 + 40 + 20).
    pages = [
        {'start': 0, 'max': 40},
        {'start': 40, 'max': 40},
        {'start': 80, 'max': 20}
    ]

    try:
        for page in pages:
            url = (
                f"https://www.googleapis.com/books/v1/volumes?q={search_param}"
                f"&key={api_key}&startIndex={page['start']}&maxResults={page['max']}"
            )
            response = requests.get(url, timeout=5)
            data = response.json()

            if "items" in data:
                for item in data["items"]:
                    volume_info = item.get("volumeInfo", {})
                    external_books.append({
                        'title': volume_info.get('title', 'Unknown Title'),
                        'authors': volume_info.get('authors', ['Unknown Author']),
                        'thumbnail': volume_info.get('imageLinks', {}).get('thumbnail'),
                        'description': volume_info.get('description', 'No description available.'),
                    })
            else:
                # If a page returns no items, stop fetching further pages
                break

    except Exception as e:
        print(f"API Error: {e}")

    return external_books


def browse_books(request):
    query = request.GET.get('q', '').strip()
    api_books = []

    if query:
        # Local search
        books = Book.objects.filter(
            Q(title__icontains=query) | Q(author__icontains=query)
        )
        # Fetching 100 results from API
        api_books = fetch_external_books(query)
    else:
        books = Book.objects.all()

    return render(request, 'browse.html', {
        'books': books,
        'api_books': api_books,
        'query': query
    })


@login_required
def patron_dashboard(request):
    query = request.GET.get('q', '').strip()  # Fixed 'q' parameter
    books = Book.objects.all()
    api_books = []

    if query:
        books = books.filter(Q(title__icontains=query) |
                             Q(author__icontains=query))
        api_books = fetch_external_books(query)

    context = {
        'books': books,
        'my_loans': Loan.objects.filter(patron=request.user, returned_date__isnull=True),
        'api_books': api_books,
        'query': query,
    }
    return render(request, 'patron_dashboard.html', context)


@login_required
def staff_dashboard(request):
    if not request.user.is_staff:
        return redirect('patron_dashboard')

    book_q = request.GET.get('book_q', '').strip()
    api_books = []

    books = Book.objects.all()
    if book_q:
        books = books.filter(Q(title__icontains=book_q)
                             | Q(isbn__icontains=book_q))
        api_books = fetch_external_books(book_q)

    context = {
        'books': books,
        'all_patrons': User.objects.filter(is_staff=False),
        'all_loans': Loan.objects.filter(returned_date__isnull=True),
        'api_books': api_books,
    }
    return render(request, 'staff_dashboard.html', context)


# --- Inventory & Loan Management ---


@login_required
def checkout_book(request, book_id):
    if not request.user.is_staff:
        messages.error(request, "Only staff can process checkouts.")
        return redirect('patron_dashboard')

    book = get_object_or_404(Book, id=book_id)
    patron_id = request.POST.get('patron_id')

    if not patron_id:
        messages.error(request, "Please select a patron.")
        return redirect('staff_dashboard')

    patron = get_object_or_404(User, id=patron_id)

    if book.available_copies > 0:
        Loan.objects.create(
            book=book,
            patron=patron,
            due_date=timezone.now().date() + timedelta(days=14)
        )
        book.available_copies -= 1
        book.save()
        messages.success(
            request, f"Loaned '{book.title}' to {patron.username}.")
    else:
        messages.error(request, "No copies available.")

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


# catalog/views.py

@login_required
def patron_detail(request, pk):
    if not request.user.is_staff:
        return redirect('patron_dashboard')

    # Get the specific customer (patron)
    patron = get_object_or_404(User, pk=pk)

    # Get their transactions (all loans, even returned ones)
    transactions = Loan.objects.filter(patron=patron).order_by('-due_date')

    return render(request, 'patron_detail.html', {
        'patron': patron,
        'transactions': transactions
    })


@login_required
def send_patron_email(request, pk):
    if not request.user.is_staff:
        return redirect('home')

    patron = get_object_or_404(User, pk=pk)
    # Logic for sending email would go here
    messages.success(request, f"Draft email opened for {patron.email}")
    return redirect('patron_detail', pk=pk)
# --- Static Pages ---


def about(request):
    return render(request, 'about.html')


def contact(request):
    return render(request, 'contact.html')
