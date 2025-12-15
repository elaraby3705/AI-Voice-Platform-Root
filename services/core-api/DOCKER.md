## Running the Project with Docker & Docker Compose

This project is containerized using **Docker** and uses **PostgreSQL** as the database. The following steps describe how to run the project for development or testing purposes.

---

### Prerequisites

Make sure the following are installed on your system:

- [Docker](https://docs.docker.com/get-docker/)
- [Docker Compose](https://docs.docker.com/compose/install/)
- Python (optional, only if you plan to run outside Docker)
- Git (optional, for cloning the repository)

---

### 1. Configure Environment Variables

Create a `.env` file in the project root with the necessary environment variables for Django and PostgreSQL. This includes:

- `DEBUG`
- `SECRET_KEY`
- `DJANGO_ALLOWED_HOSTS`
- `POSTGRES_USER`
- `POSTGRES_PASSWORD`
- `POSTGRES_DB`
- `DATABASE_URL`

> Make sure `DATABASE_URL` points to the PostgreSQL service defined in the Docker Compose setup.

---

### 2. Build and Start Containers

From the project root, run:

```bash
docker-compose up --build
```

- This builds the Django application container and starts both the **web** and **db** services.
- PostgreSQL will run on `localhost:5432`.
- Django will be available at `http://127.0.0.1:8000`.

---

### 3. Apply Migrations

Once the containers are running, apply database migrations:

```bash
docker-compose exec web python manage.py migrate
```

---

### 4. Create a Superuser (Optional)

If you want to access the Django admin panel:

```bash
docker-compose exec web python manage.py createsuperuser
```

---

### 5. Test API Endpoints

- **Register:** `POST http://127.0.0.1:8000/api/v1/auth/register/`  
- **Login:** `POST http://127.0.0.1:8000/api/v1/auth/login/`  
- **Me:** `GET http://127.0.0.1:8000/api/v1/auth/me/` (requires `Authorization: Token <token>`)

> You can test these endpoints using tools like Postman or curl.

---

### 6. Stop Containers

To stop the services:

```bash
docker-compose down
```

To remove the associated volumes (this will delete database data):

```bash
docker-compose down -v
```

---

### Notes

- Keep the `.env` file secure and **do not commit it** to version control.
- If you change Python dependencies (`requirements.txt`), rebuild the containers:

```bash
docker-compose up --build
```

- Use `docker-compose logs -f` to view real-time logs from both Django and PostgreSQL services.
