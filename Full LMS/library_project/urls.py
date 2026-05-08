from django.contrib import admin
from django.urls import path, include
from catalog import views
from catalog.views import dashboard_redirect, patron_detail, staff_dashboard, patron_dashboard, registration, logout_view, about, contact, browse_books, checkout_book, return_book, home, add_to_reservation, add_to_inventory, remove_reservation, convert_reservation_to_loan, customer_directory, check_out_tab

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
    path('', home, name='home'),
    path('reservation/add/<int:book_id>/',
         add_to_reservation, name='add_to_reservation'),
    path('inventory/add/', add_to_inventory, name='add_to_inventory'),
    path('checkout/', checkout_book, name='checkout_book_no_id'),
    path('reservation/remove/<int:res_id>/',
         remove_reservation, name='remove_reservation'),
    path('reservation/fulfill/<int:res_id>/',
         convert_reservation_to_loan, name='convert_res_to_loan'),
    path('staff/customers/', customer_directory, name='customer_directory'),
    path('staff/check-out/', check_out_tab, name='check_out_tab'),
    path('reserve/convert/<int:res_id>/', views.convert_reservation_to_loan,
         name='convert_reservation_to_loan'),
]
