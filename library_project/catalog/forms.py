from django import forms


class ISBNForm(forms.Form):
    isbn = forms.CharField(label='Enter ISBN', max_length=13)
