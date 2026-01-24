# TeleRooms (DODRooms)

A room management and reservation system built with Next.js, Prisma, and PostgreSQL.

## Prerequisites

- Node.js (LTS recommended)
- Docker & Docker Compose

## Getting Started

1.  **Clone the repository:**

    ```bash
    git clone git@github.com:ondrejsindelka/telerooms.git
    cd telerooms
    ```

2.  **Install dependencies:**

    ```bash
    npm install
    ```

3.  **Environment Setup:**

    Copy the example environment file:

    ```bash
    cp .env.example .env
    ```

    Update `.env` with your specific configuration if needed.

4.  **Start the Database:**

    Start the PostgreSQL container:

    ```bash
    docker compose up -d
    ```

5.  **Database Setup:**

    Push the database schema:

    ```bash
    npx prisma db push
    ```

    (Optional) Seed the database:
    ```bash
    npx prisma db seed
    ```

6.  **Run the Application:**

    **Development:**
    ```bash
    npm run dev
    ```

    **Production:**
    ```bash
    npm run build
    npm start
    ```

    **Using PM2:**
    ```bash
    pm2 start ecosystem.config.js
    ```

## Tech Stack

-   **Framework:** Next.js
-   **Database:** PostgreSQL (via Docker)
-   **ORM:** Prisma
-   **Styling:** Tailwind CSS
-   **Process Manager:** PM2

## License

[MIT](LICENSE)
