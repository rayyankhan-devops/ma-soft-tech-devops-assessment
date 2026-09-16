# Database Service — MySQL Schema & Auto-Seeding

Database initialization and pre-loaded seed configurations for the **MA Soft Tech Solutions** DevOps assessment.

---

## 🗂️ Structure

```
db/
└── init/
    └── mysql/
        ├── 01_schema.sql       # Database and table schema creation
        └── 02_seed.sql         # Pre-loaded initial DevOps records
```

---

## ⚙️ Schema Overview (`items` Table)

```sql
CREATE TABLE IF NOT EXISTS `items` (
  `id` INT AUTO_INCREMENT PRIMARY KEY,
  `title` VARCHAR(100) NOT NULL,
  `priority` ENUM('low', 'medium', 'high') NOT NULL DEFAULT 'medium',
  `category` VARCHAR(50) NOT NULL DEFAULT 'general',
  `created_at` TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
```

---

## 🐳 Docker Compose Auto-Initialization

When launching with Docker Compose, the `db/init/mysql` directory is mounted to `/docker-entrypoint-initdb.d:ro` inside the official `mysql:8.0` container:

```yaml
volumes:
  - ./db/init/mysql:/docker-entrypoint-initdb.d:ro
  - mysql_data:/var/lib/mysql
```

The MySQL entrypoint script automatically executes files in alphabetical order on the first container run:
1. `01_schema.sql` runs first: Creates `ma_devops_db` and the `items` table.
2. `02_seed.sql` runs second: Inserts the initial DevOps tasks.

---

## 🔍 Verifying Seeded Data via Docker

To verify the pre-loaded records inside the container:

```bash
docker compose exec db mysql -u root -pdevops_password -e "SELECT * FROM ma_devops_db.items;"
```
