CREATE DATABASE IF NOT EXISTS green_loop
    CHARACTER SET utf8mb4
    COLLATE utf8mb4_unicode_ci;

USE green_loop;

CREATE TABLE IF NOT EXISTS users (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(100) NOT NULL UNIQUE,
    email VARCHAR(190) NOT NULL UNIQUE,
    first_name VARCHAR(100) NOT NULL DEFAULT '',
    last_name VARCHAR(100) NOT NULL DEFAULT '',
    password VARCHAR(255) NOT NULL,
    role VARCHAR(30) NOT NULL DEFAULT 'user',
    wallet_balance DECIMAL(12,2) NOT NULL DEFAULT 0.00,
    green_points INT NOT NULL DEFAULT 0,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `Products` (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    category VARCHAR(100) NOT NULL,
    price DECIMAL(12,2) NOT NULL DEFAULT 0.00,
    `condition` VARCHAR(30) NOT NULL DEFAULT 'good',
    condition_note VARCHAR(500) NULL,
    description TEXT NOT NULL,
    image VARCHAR(500) NULL,
    green_score INT NOT NULL DEFAULT 0,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_products_category (category)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS orders (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id INT UNSIGNED NULL,
    product_id INT UNSIGNED NOT NULL,
    total_price DECIMAL(12,2) NULL,
    price DECIMAL(12,2) NULL,
    status VARCHAR(30) NOT NULL DEFAULT 'pending',
    customer_name VARCHAR(150) NULL,
    customer_phone VARCHAR(50) NULL,
    customer_address TEXT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_orders_user (user_id),
    INDEX idx_orders_product (product_id),
    CONSTRAINT fk_orders_user FOREIGN KEY (user_id) REFERENCES users(id),
    CONSTRAINT fk_orders_product FOREIGN KEY (product_id) REFERENCES `Products`(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS recycle_requests (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id INT UNSIGNED NOT NULL,
    waste_type VARCHAR(30) NOT NULL,
    category VARCHAR(100) NULL,
    quantity INT NULL,
    weight DECIMAL(10,2) NULL,
    images LONGTEXT NULL,
    description TEXT NULL,
    pickup_method VARCHAR(30) NOT NULL DEFAULT 'drop_off',
    pickup_address TEXT NULL,
    points_earned INT NOT NULL DEFAULT 0,
    status VARCHAR(30) NOT NULL DEFAULT 'pending',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NULL DEFAULT NULL,
    INDEX idx_recycle_user (user_id),
    INDEX idx_recycle_status (status),
    CONSTRAINT fk_recycle_user FOREIGN KEY (user_id) REFERENCES users(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS wallet_transactions (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id INT UNSIGNED NOT NULL,
    type VARCHAR(30) NOT NULL,
    amount DECIMAL(12,2) NOT NULL,
    balance_after DECIMAL(12,2) NULL,
    status VARCHAR(30) NOT NULL DEFAULT 'pending',
    slip_image VARCHAR(500) NULL,
    reference_order_id INT UNSIGNED NULL,
    note VARCHAR(500) NULL,
    reviewed_by VARCHAR(100) NULL,
    reviewed_at DATETIME NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_wallet_user (user_id),
    INDEX idx_wallet_status (type, status),
    CONSTRAINT fk_wallet_user FOREIGN KEY (user_id) REFERENCES users(id),
    CONSTRAINT fk_wallet_order FOREIGN KEY (reference_order_id) REFERENCES orders(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;