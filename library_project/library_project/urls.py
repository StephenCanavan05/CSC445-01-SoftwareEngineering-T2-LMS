from django.contrib import admin
from django.urls import path, include
from catalog.views import dashboard_redirect, patron_detail, staff_dashboard, patron_dashboard, registration, logout_view, about, contact, browse_books, checkout_book, return_book, home

urlpatterns = [
    path('admin/', admin.site.urls),
    path('', dashboard_redirect, name='dashboard'),
    path('staff/', staff_dashboard, name='staff_dashboard'),
    path('patron/', patron_dashboard, name='patron_dashboard'),
    path('accounts/', include('django.contrib.auth.urls')),
    path('registration/', registration, name='registration'),
    path('logout/', logout_view, name='logout_view'),
    path('browse/', browse_books, name='browse_books'),
    path('about/', about, name='about'),
    path('contact/', contact, name='contact'),
    path('patron/<int:pk>/', patron_detail, name='patron_detail'),
    path('browse/', browse_books, name='browse'),
    path('checkout/<int:book_id>/', checkout_book, name='checkout_book'),
    path('return/<int:loan_id>/', return_book, name='return_book'),
    path('about/', about, name='about'),
    path('contact/', contact, name='contact'),
    # Look for a line like this and add the name='home'
    path('', home, name='home'),
]
