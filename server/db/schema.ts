import { dbRun } from './connection';

export async function createSchema() {
  console.log('[Database] Creating MySQL tables if not exists...');

  await dbRun(`
    CREATE TABLE IF NOT EXISTS admins (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      email VARCHAR(255) NOT NULL UNIQUE,
      password VARCHAR(255) NOT NULL,
      avatar VARCHAR(500) DEFAULT NULL,
      role VARCHAR(50) NOT NULL DEFAULT 'Admin',
      status VARCHAR(50) NOT NULL DEFAULT 'active',
      last_login DATETIME DEFAULT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `);

  await dbRun(`
    CREATE TABLE IF NOT EXISTS users (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      email VARCHAR(255) NOT NULL UNIQUE,
      password VARCHAR(255) NOT NULL,
      avatar VARCHAR(500) DEFAULT NULL,
      role VARCHAR(50) NOT NULL DEFAULT 'User',
      status VARCHAR(50) NOT NULL DEFAULT 'active',
      last_login DATETIME DEFAULT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `);

  await dbRun(`
    CREATE TABLE IF NOT EXISTS categories (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      slug VARCHAR(255) NOT NULL UNIQUE,
      description TEXT DEFAULT NULL,
      status VARCHAR(50) NOT NULL DEFAULT 'active',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `);

  await dbRun(`
    CREATE TABLE IF NOT EXISTS genres (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      slug VARCHAR(255) NOT NULL UNIQUE,
      description TEXT DEFAULT NULL,
      status VARCHAR(50) NOT NULL DEFAULT 'active',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `);

  await dbRun(`
    CREATE TABLE IF NOT EXISTS languages (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      code VARCHAR(50) NOT NULL UNIQUE,
      status VARCHAR(50) NOT NULL DEFAULT 'active',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `);

  await dbRun(`
    CREATE TABLE IF NOT EXISTS countries (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      code VARCHAR(50) NOT NULL UNIQUE,
      status VARCHAR(50) NOT NULL DEFAULT 'active',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `);

  await dbRun(`
    CREATE TABLE IF NOT EXISTS tags (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      slug VARCHAR(255) NOT NULL UNIQUE,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `);

  await dbRun(`
    CREATE TABLE IF NOT EXISTS serials (
      id INT AUTO_INCREMENT PRIMARY KEY,
      title VARCHAR(255) NOT NULL,
      slug VARCHAR(255) NOT NULL UNIQUE,
      description TEXT DEFAULT NULL,
      short_description TEXT DEFAULT NULL,
      poster VARCHAR(500) DEFAULT NULL,
      banner VARCHAR(500) DEFAULT NULL,
      trailer_url VARCHAR(500) DEFAULT NULL,
      release_date VARCHAR(50) DEFAULT NULL,
      language VARCHAR(100) DEFAULT 'English',
      country VARCHAR(100) DEFAULT 'USA',
      category_id INT DEFAULT NULL,
      status VARCHAR(50) NOT NULL DEFAULT 'published',
      rating FLOAT DEFAULT 0.0,
      featured TINYINT(1) DEFAULT 0,
      views INT DEFAULT 0,
      downloads INT DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE SET NULL
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `);

  await dbRun(`
    CREATE TABLE IF NOT EXISTS seasons (
      id INT AUTO_INCREMENT PRIMARY KEY,
      serial_id INT NOT NULL,
      season_number INT NOT NULL,
      title VARCHAR(255) NOT NULL,
      description TEXT DEFAULT NULL,
      poster VARCHAR(500) DEFAULT NULL,
      release_date VARCHAR(50) DEFAULT NULL,
      status VARCHAR(50) NOT NULL DEFAULT 'published',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (serial_id) REFERENCES serials(id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `);

  await dbRun(`
    CREATE TABLE IF NOT EXISTS episodes (
      id INT AUTO_INCREMENT PRIMARY KEY,
      serial_id INT NOT NULL,
      season_id INT NOT NULL,
      episode_number INT NOT NULL,
      title VARCHAR(255) NOT NULL,
      slug VARCHAR(255) NOT NULL,
      description TEXT DEFAULT NULL,
      thumbnail VARCHAR(500) DEFAULT NULL,
      video_url VARCHAR(500) DEFAULT NULL,
      duration VARCHAR(50) DEFAULT NULL,
      release_date VARCHAR(50) DEFAULT NULL,
      status VARCHAR(50) NOT NULL DEFAULT 'published',
      featured TINYINT(1) DEFAULT 0,
      views INT DEFAULT 0,
      downloads INT DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (serial_id) REFERENCES serials(id) ON DELETE CASCADE,
      FOREIGN KEY (season_id) REFERENCES seasons(id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `);

  await dbRun(`
    CREATE TABLE IF NOT EXISTS media_sources (
      id INT AUTO_INCREMENT PRIMARY KEY,
      episode_id INT NOT NULL,
      type VARCHAR(50) NOT NULL DEFAULT 'stream',
      quality VARCHAR(50) NOT NULL DEFAULT '720p',
      label VARCHAR(255) NOT NULL,
      url VARCHAR(500) NOT NULL,
      file_size VARCHAR(50) DEFAULT NULL,
      server VARCHAR(255) DEFAULT 'Main Server',
      status VARCHAR(50) NOT NULL DEFAULT 'active',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      FOREIGN KEY (episode_id) REFERENCES episodes(id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `);

  await dbRun(`
    CREATE TABLE IF NOT EXISTS actors (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      slug VARCHAR(255) NOT NULL UNIQUE,
      biography TEXT DEFAULT NULL,
      avatar VARCHAR(500) DEFAULT NULL,
      birth_date VARCHAR(50) DEFAULT NULL,
      nationality VARCHAR(100) DEFAULT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `);

  await dbRun(`
    CREATE TABLE IF NOT EXISTS serial_actors (
      id INT AUTO_INCREMENT PRIMARY KEY,
      serial_id INT NOT NULL,
      actor_id INT NOT NULL,
      character_name VARCHAR(255) DEFAULT NULL,
      FOREIGN KEY (serial_id) REFERENCES serials(id) ON DELETE CASCADE,
      FOREIGN KEY (actor_id) REFERENCES actors(id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `);

  await dbRun(`
    CREATE TABLE IF NOT EXISTS serial_genres (
      serial_id INT NOT NULL,
      genre_id INT NOT NULL,
      PRIMARY KEY (serial_id, genre_id),
      FOREIGN KEY (serial_id) REFERENCES serials(id) ON DELETE CASCADE,
      FOREIGN KEY (genre_id) REFERENCES genres(id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `);

  await dbRun(`
    CREATE TABLE IF NOT EXISTS serial_tags (
      serial_id INT NOT NULL,
      tag_id INT NOT NULL,
      PRIMARY KEY (serial_id, tag_id),
      FOREIGN KEY (serial_id) REFERENCES serials(id) ON DELETE CASCADE,
      FOREIGN KEY (tag_id) REFERENCES tags(id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `);

  await dbRun(`
    CREATE TABLE IF NOT EXISTS api_keys (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      key_value VARCHAR(255) NOT NULL UNIQUE,
      rate_limit INT NOT NULL DEFAULT 1000,
      status VARCHAR(50) NOT NULL DEFAULT 'active',
      usage_count INT DEFAULT 0,
      last_used_at VARCHAR(50) DEFAULT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `);

  await dbRun(`
    CREATE TABLE IF NOT EXISTS activity_logs (
      id INT AUTO_INCREMENT PRIMARY KEY,
      admin_id INT DEFAULT NULL,
      action VARCHAR(255) NOT NULL,
      entity_type VARCHAR(100) NOT NULL,
      entity_id INT DEFAULT NULL,
      description TEXT NOT NULL,
      ip_address VARCHAR(100) DEFAULT NULL,
      user_agent TEXT DEFAULT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (admin_id) REFERENCES admins(id) ON DELETE SET NULL
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `);

  await dbRun(`
    CREATE TABLE IF NOT EXISTS views (
      id INT AUTO_INCREMENT PRIMARY KEY,
      serial_id INT NOT NULL,
      episode_id INT DEFAULT NULL,
      ip_address VARCHAR(100) DEFAULT NULL,
      user_agent TEXT DEFAULT NULL,
      viewed_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (serial_id) REFERENCES serials(id) ON DELETE CASCADE,
      FOREIGN KEY (episode_id) REFERENCES episodes(id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `);

  await dbRun(`
    CREATE TABLE IF NOT EXISTS downloads (
      id INT AUTO_INCREMENT PRIMARY KEY,
      serial_id INT NOT NULL,
      episode_id INT NOT NULL,
      media_id INT DEFAULT NULL,
      ip_address VARCHAR(100) DEFAULT NULL,
      downloaded_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (serial_id) REFERENCES serials(id) ON DELETE CASCADE,
      FOREIGN KEY (episode_id) REFERENCES episodes(id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `);

  await dbRun(`
    CREATE TABLE IF NOT EXISTS settings (
      setting_key VARCHAR(100) PRIMARY KEY,
      setting_value TEXT DEFAULT NULL,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `);

  await dbRun(`
    CREATE TABLE IF NOT EXISTS monetization_settings (
      setting_key VARCHAR(100) PRIMARY KEY,
      setting_value TEXT DEFAULT NULL,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `);

  await dbRun(`
    CREATE TABLE IF NOT EXISTS ad_units (
      id INT AUTO_INCREMENT PRIMARY KEY,
      network VARCHAR(50) NOT NULL,
      name VARCHAR(255) NOT NULL,
      slot_id VARCHAR(255) NOT NULL,
      format VARCHAR(50) NOT NULL,
      size VARCHAR(50) DEFAULT 'Responsive',
      status VARCHAR(50) NOT NULL DEFAULT 'active',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `);

  await dbRun(`
    CREATE TABLE IF NOT EXISTS ad_placements (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      position VARCHAR(100) NOT NULL,
      network VARCHAR(50) NOT NULL DEFAULT 'AdSense',
      ad_unit_id INT DEFAULT NULL,
      fallback_network VARCHAR(50) DEFAULT 'Google Ad Manager',
      device_target VARCHAR(50) DEFAULT 'All',
      priority INT DEFAULT 1,
      status VARCHAR(50) DEFAULT 'active',
      start_date VARCHAR(50) DEFAULT NULL,
      end_date VARCHAR(50) DEFAULT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `);

  await dbRun(`
    CREATE TABLE IF NOT EXISTS ad_campaigns (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      advertiser VARCHAR(255) NOT NULL,
      budget DECIMAL(10,2) DEFAULT 0.00,
      impressions INT DEFAULT 0,
      clicks INT DEFAULT 0,
      start_date VARCHAR(50) DEFAULT NULL,
      end_date VARCHAR(50) DEFAULT NULL,
      status VARCHAR(50) DEFAULT 'active',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `);

  await dbRun(`
    CREATE TABLE IF NOT EXISTS ad_analytics (
      id INT AUTO_INCREMENT PRIMARY KEY,
      date_recorded DATE NOT NULL,
      country VARCHAR(100) DEFAULT 'Global',
      device VARCHAR(50) DEFAULT 'Desktop',
      impressions INT DEFAULT 0,
      clicks INT DEFAULT 0,
      revenue DECIMAL(10,2) DEFAULT 0.00,
      rpm DECIMAL(10,2) DEFAULT 0.00,
      cpm DECIMAL(10,2) DEFAULT 0.00,
      ctr DECIMAL(5,2) DEFAULT 0.00
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `);

  await dbRun(`
    CREATE TABLE IF NOT EXISTS subscription_plans (
      id INT AUTO_INCREMENT PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      price DECIMAL(10,2) NOT NULL DEFAULT 0.00,
      currency VARCHAR(10) DEFAULT 'USD',
      duration VARCHAR(50) NOT NULL DEFAULT 'Monthly',
      features_json TEXT DEFAULT NULL,
      ad_free TINYINT(1) DEFAULT 1,
      hd_streaming TINYINT(1) DEFAULT 1,
      downloads_allowed TINYINT(1) DEFAULT 1,
      status VARCHAR(50) DEFAULT 'active',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `);

  await dbRun(`
    CREATE TABLE IF NOT EXISTS user_subscriptions (
      id INT AUTO_INCREMENT PRIMARY KEY,
      user_id INT NOT NULL,
      plan_id INT NOT NULL,
      amount DECIMAL(10,2) NOT NULL,
      currency VARCHAR(10) DEFAULT 'USD',
      status VARCHAR(50) DEFAULT 'active',
      start_date DATETIME DEFAULT CURRENT_TIMESTAMP,
      end_date DATETIME DEFAULT NULL,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (plan_id) REFERENCES subscription_plans(id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `);

  await dbRun(`
    CREATE TABLE IF NOT EXISTS payment_gateways (
      id INT AUTO_INCREMENT PRIMARY KEY,
      gateway_code VARCHAR(50) NOT NULL UNIQUE,
      name VARCHAR(255) NOT NULL,
      is_enabled TINYINT(1) DEFAULT 0,
      mode VARCHAR(50) DEFAULT 'sandbox',
      config_json TEXT DEFAULT NULL,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `);

  await dbRun(`
    CREATE TABLE IF NOT EXISTS transactions (
      id INT AUTO_INCREMENT PRIMARY KEY,
      transaction_ref VARCHAR(100) NOT NULL UNIQUE,
      user_id INT NOT NULL,
      amount DECIMAL(10,2) NOT NULL,
      currency VARCHAR(10) DEFAULT 'USD',
      gateway VARCHAR(50) NOT NULL,
      status VARCHAR(50) NOT NULL DEFAULT 'completed',
      description TEXT DEFAULT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `);

  await dbRun(`
    CREATE TABLE IF NOT EXISTS source_health_checks (
      id INT AUTO_INCREMENT PRIMARY KEY,
      media_id INT NOT NULL,
      url VARCHAR(500) NOT NULL,
      http_code INT DEFAULT 200,
      response_time_ms INT DEFAULT 120,
      status VARCHAR(50) NOT NULL DEFAULT 'online',
      last_checked_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (media_id) REFERENCES media_sources(id) ON DELETE CASCADE
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `);

  await dbRun(`
    CREATE TABLE IF NOT EXISTS backups (
      id INT AUTO_INCREMENT PRIMARY KEY,
      filename VARCHAR(255) NOT NULL,
      file_size_kb INT DEFAULT 0,
      type VARCHAR(50) DEFAULT 'manual',
      status VARCHAR(50) DEFAULT 'completed',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `);

  await dbRun(`
    CREATE TABLE IF NOT EXISTS security_logs (
      id INT AUTO_INCREMENT PRIMARY KEY,
      ip_address VARCHAR(100) NOT NULL,
      event_type VARCHAR(100) NOT NULL,
      details TEXT DEFAULT NULL,
      severity VARCHAR(50) DEFAULT 'info',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `);

  await dbRun(`
    CREATE TABLE IF NOT EXISTS ip_blocklist (
      id INT AUTO_INCREMENT PRIMARY KEY,
      ip_address VARCHAR(100) NOT NULL UNIQUE,
      reason TEXT DEFAULT NULL,
      blocked_at DATETIME DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `);

  await dbRun(`
    CREATE TABLE IF NOT EXISTS notifications (
      id INT AUTO_INCREMENT PRIMARY KEY,
      title VARCHAR(255) NOT NULL,
      message TEXT NOT NULL,
      type VARCHAR(50) DEFAULT 'info',
      is_read TINYINT(1) DEFAULT 0,
      link VARCHAR(255) DEFAULT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
  `);
}
