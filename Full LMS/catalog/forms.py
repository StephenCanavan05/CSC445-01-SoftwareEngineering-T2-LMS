from django import forms


class ISBNForm(forms.Form):
    isbn = forms.CharField(label='Enter ISBN', max_length=13)


class BookForm(forms.ModelForm):
    class Meta:
        model = Book
        fields = ['title', 'author', 'isbn', 'genre']

    def clean_isbn(self):
        isbn = self.cleaned_data.get('isbn')
        if Book.objects.filter(isbn=isbn).exists():
            raise forms.ValidationError(
                "This ISBN is already registered in the system.")
        return isbn
