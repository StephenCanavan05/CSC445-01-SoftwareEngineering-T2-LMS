# CSC445-01-SoftwareEngineering-T2-LMS
IEEE Standard Library Management System created for CSC455-01 Software Engineering at Eastern Connecticut State University!

**Quickstart**

- **Requirements:**
	- Install VS Code (recommended) or another editor.
	- Install Python 3.10 or newer (3.10/3.11 recommended).
	- Git (optional).

- **Key Python packages:** `Django==6.0.3` (project generated with this version) and `requests` (used for Google Books API).

**Setup & run (Windows example)**

1. Open a terminal and change into the project app folder:

	 `cd "Full LMS"`

2. Create and activate a virtual environment:

	 - PowerShell:
		 `python -m venv .venv`
		 `.\.venv\Scripts\Activate.ps1`

	 - CMD:
		 `python -m venv .venv`
		 `.\.venv\Scripts\activate`

3. Install dependencies:

	 `pip install Django==6.0.3 requests`

4. Apply migrations and start the development server:

	 `python manage.py migrate`
	 `python manage.py runserver`

5. Open your browser at `http://127.0.0.1:8000`.

Notes:
- The project's main manage script is [Full LMS/manage.py](Full%20LMS/manage.py).
- Settings are in [Full LMS/library_project/settings.py](Full%20LMS/library_project/settings.py).

**Creating accounts (Patron vs Staff)**

- The registration form lives at the registration page and is reachable from the login page.
	- Click **Sign In** on the home page, then choose **Create an account** (login page has a direct link).
	- Or visit the registration URL directly (`/registration/`). The registration template is [Full LMS/catalog/templates/registration/registration.html](Full%20LMS/catalog/templates/registration/registration.html).

- To create a staff (librarian) account, enter the staff invitation key exactly as shown in the app: `LIBRARY2026` (case-sensitive) into the **Staff Invitation Key** field. If the key is not provided or incorrect, the account will be created as a Patron.

**Using the site**

- Browse the catalog from the home page by clicking **Browse Catalog**. On the browse page, use the search box to look up books by title or author (type an author's name and press Enter to search local records and remote results).
- The browse/search view combines local database results with remote Google Books results.

**Google Books API (optional, for richer remote search results)**

- The code calls the Google Books API from `catalog.views.fetch_external_books()` and uses a placeholder key (`YOUR_GOOGLE_BOOKS_API_KEY`). To enable authenticated requests:
	1. Create or select a project in the Google Cloud Console.
	2. Enable the **Books API** under APIs & Services.
	3. Create an API key (Credentials → Create credentials → API key).
	4. For local testing set an environment variable and restart the dev server:

		 - PowerShell:
			 `$Env:GOOGLE_BOOKS_API_KEY = "YOUR_KEY_HERE"`

		 - Or add the key into your environment or a secure `.env` and load it in Django settings.

- To avoid committing secrets, update `fetch_external_books()` to read the key from the environment or Django settings (example change: `api_key = os.getenv('GOOGLE_BOOKS_API_KEY')`) and do not hard-code your key in the repo.

**Search tips**

- The local search looks for matches in `title` and `author` fields. For broader results, use the browse page which also returns Google Books items if the API key is configured.

**References & files**
- Main app folder: `Full LMS`
- Main Django settings: [Full LMS/library_project/settings.py](Full%20LMS/library_project/settings.py)
- Views (search, registration, staff key): [Full LMS/catalog/views.py](Full%20LMS/catalog/views.py)
- Login page (contains 'Create an account' link): [Full LMS/catalog/templates/registration/login.html](Full%20LMS/catalog/templates/registration/login.html)

