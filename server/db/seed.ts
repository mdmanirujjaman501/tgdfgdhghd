import bcrypt from 'bcryptjs';
import { dbGet, dbRun } from './connection';

export async function seedDatabase() {
  // 1. Seed Super Admin & Editor
  const existingAdmin1 = await dbGet('SELECT * FROM admins WHERE email = ?', ['admin@serialstudio.com']);
  if (!existingAdmin1) {
    console.log('[Database] Seeding initial Super Admin user (admin@serialstudio.com)...');
    const hashedPw = await bcrypt.hash('admin123', 10);
    await dbRun(
      `INSERT INTO admins (name, email, password, role, status) VALUES (?, ?, ?, ?, ?)`,
      ['Super Administrator', 'admin@serialstudio.com', hashedPw, 'Super Admin', 'active']
    );
  }

  const existingAdmin2 = await dbGet('SELECT * FROM admins WHERE email = ?', ['admin@example.com']);
  if (!existingAdmin2) {
    const hashedPw = await bcrypt.hash('admin123', 10);
    await dbRun(
      `INSERT INTO admins (name, email, password, role, status) VALUES (?, ?, ?, ?, ?)`,
      ['Super Administrator', 'admin@example.com', hashedPw, 'Super Admin', 'active']
    );
    await dbRun(
      `INSERT INTO admins (name, email, password, role, status) VALUES (?, ?, ?, ?, ?)`,
      ['Sarah Jenkins (Editor)', 'editor@example.com', hashedPw, 'Editor', 'active']
    );
  }

  // 2. Seed Settings
  const siteName = await dbGet('SELECT * FROM settings WHERE setting_key = ?', ['website_name']);
  if (!siteName) {
    console.log('[Database] Seeding settings...');
    const defaultSettings = [
      ['website_name', 'CineDrama Hub'],
      ['website_url', 'https://cinedrama.app'],
      ['default_language', 'English'],
      ['api_enabled', 'true'],
      ['rate_limit_default', '1000'],
      ['cors_allowed_origins', '*'],
      ['max_upload_size_mb', '10'],
      ['allowed_image_types', 'image/jpeg,image/png,image/webp,image/gif'],
      ['jwt_expiry_hours', '24']
    ];
    for (const [key, val] of defaultSettings) {
      await dbRun('INSERT INTO settings (setting_key, setting_value) VALUES (?, ?)', [key, val]);
    }
  }

  // 3. Seed Taxonomies
  const countCats = await dbGet<{ cnt: number }>('SELECT COUNT(*) as cnt FROM categories');
  if (countCats && Number(countCats.cnt) === 0) {
    console.log('[Database] Seeding taxonomies...');
    
    await dbRun(`INSERT INTO categories (name, slug, description) VALUES 
      ('Kdrama', 'kdrama', 'Korean drama television series'),
      ('Crime Thriller', 'crime-thriller', 'High stakes suspense and mystery'),
      ('Romance & Comedy', 'romance-comedy', 'Lighthearted romantic stories'),
      ('Sci-Fi & Fantasy', 'sci-fi-fantasy', 'Speculative fiction and supernatural drama'),
      ('Historical Period', 'historical-period', 'Rich historical epics and costume dramas')
    `);

    await dbRun(`INSERT INTO genres (name, slug, description) VALUES 
      ('Action', 'action', 'Fast paced action packed scenes'),
      ('Drama', 'drama', 'Deep character driven stories'),
      ('Mystery', 'mystery', 'Enigmatic plotlines and puzzle solving'),
      ('Romance', 'romance', 'Affectionate and emotional storytelling'),
      ('Sci-Fi', 'sci-fi', 'Futuristic and technological themes')
    `);

    await dbRun(`INSERT INTO languages (name, code) VALUES 
      ('English', 'en'),
      ('Korean', 'ko'),
      ('Spanish', 'es'),
      ('Japanese', 'ja'),
      ('Mandarin', 'zh')
    `);

    await dbRun(`INSERT INTO countries (name, code) VALUES 
      ('United States', 'US'),
      ('South Korea', 'KR'),
      ('United Kingdom', 'UK'),
      ('Japan', 'JP'),
      ('Spain', 'ES')
    `);

    await dbRun(`INSERT INTO tags (name, slug) VALUES 
      ('Binge Worthy', 'binge-worthy'),
      ('Award Winning', 'award-winning'),
      ('Trending Now', 'trending-now'),
      ('Top Rated', 'top-rated')
    `);
  }

  // 4. Seed Actors
  const countActors = await dbGet<{ cnt: number }>('SELECT COUNT(*) as cnt FROM actors');
  if (countActors && Number(countActors.cnt) === 0) {
    console.log('[Database] Seeding sample actors...');
    await dbRun(`INSERT INTO actors (name, slug, biography, avatar, birth_date, nationality) VALUES 
      ('Hyun Bin', 'hyun-bin', 'Acclaimed South Korean actor known for Crash Landing on You and Memories of the Alhambra.', 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80', '1982-09-25', 'South Korea'),
      ('Son Ye-jin', 'son-ye-jin', 'Award winning actress celebrated for emotional drama and romance leads.', 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&auto=format&fit=crop&q=80', '1982-01-11', 'South Korea'),
      ('Michael Fassbender', 'michael-fassbender', 'Versatile actor starring in intense psychological thrillers.', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80', '1977-04-02', 'Ireland'),
      ('Emma D Arcy', 'emma-d-arcy', 'Breakout talent in period and fantasy epics.', 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400&auto=format&fit=crop&q=80', '1992-06-27', 'United Kingdom')
    `);
  }

  // 5. Seed Serials, Seasons, Episodes, Media Sources
  const countSerials = await dbGet<{ cnt: number }>('SELECT COUNT(*) as cnt FROM serials');
  if (countSerials && Number(countSerials.cnt) === 0) {
    console.log('[Database] Seeding initial TV serials, seasons, episodes & media sources...');
    
    // Serial 1
    const s1 = await dbRun(`INSERT INTO serials 
      (title, slug, description, short_description, poster, banner, trailer_url, release_date, language, country, category_id, status, rating, featured, views, downloads)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        'Kingdom of Shadows',
        'kingdom-of-shadows',
        'An epic historical fantasy series following royal intrigue, ancient curses, and a battle for the northern throne against dark forces.',
        'An epic royal saga filled with betrayal, swords, and dark magic.',
        'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=600&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=1200&auto=format&fit=crop&q=80',
        'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
        '2024-03-15',
        'English',
        'United Kingdom',
        1,
        'published',
        9.2,
        1,
        14250,
        3820
      ]
    );

    // Serial 2
    const s2 = await dbRun(`INSERT INTO serials 
      (title, slug, description, short_description, poster, banner, trailer_url, release_date, language, country, category_id, status, rating, featured, views, downloads)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        'Silicon Heist',
        'silicon-heist',
        'A high tech cyber thriller where brilliant rogue programmers infiltrate global financial databases to execute the ultimate digital heist.',
        'A high speed cyber heist thriller set in modern tech capitals.',
        'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=600&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=1200&auto=format&fit=crop&q=80',
        'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
        '2024-06-01',
        'English',
        'United States',
        2,
        'published',
        8.8,
        1,
        9800,
        2100
      ]
    );

    // Serial 3
    const s3 = await dbRun(`INSERT INTO serials 
      (title, slug, description, short_description, poster, banner, trailer_url, release_date, language, country, category_id, status, rating, featured, views, downloads)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        'Seoul Heartbeat',
        'seoul-heartbeat',
        'A romantic drama following two rival architects in Gangnam who rediscover love while competing for a prestigious urban revitalization project.',
        'A heartwarming romantic K-Drama about second chances in Seoul.',
        'https://images.unsplash.com/photo-1517154421773-0529f29ea451?w=600&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1538481199705-c710c4e965fc?w=1200&auto=format&fit=crop&q=80',
        'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
        '2024-01-10',
        'Korean',
        'South Korea',
        1,
        'published',
        9.5,
        1,
        18900,
        5400
      ]
    );

    // Cast mapping
    await dbRun('INSERT INTO serial_actors (serial_id, actor_id, character_name) VALUES (?, ?, ?)', [s1.lastID, 1, 'Lord Commander Vane']);
    await dbRun('INSERT INTO serial_actors (serial_id, actor_id, character_name) VALUES (?, ?, ?)', [s1.lastID, 4, 'Princess Rhaena']);
    await dbRun('INSERT INTO serial_actors (serial_id, actor_id, character_name) VALUES (?, ?, ?)', [s3.lastID, 1, 'Kang Min-jun']);
    await dbRun('INSERT INTO serial_actors (serial_id, actor_id, character_name) VALUES (?, ?, ?)', [s3.lastID, 2, 'Yoon Chae-won']);

    // Seasons for Serial 1
    const season1 = await dbRun(`INSERT INTO seasons (serial_id, season_number, title, description, release_date, status) VALUES (?, ?, ?, ?, ?, ?)`,
      [s1.lastID, 1, 'Season 1: Rise of the Cursed', 'The beginning of the northern war and royal secrets.', '2024-03-15', 'published']
    );
    await dbRun(`INSERT INTO seasons (serial_id, season_number, title, description, release_date, status) VALUES (?, ?, ?, ?, ?, ?)`,
      [s1.lastID, 2, 'Season 2: Blood and Frost', 'Tensions escalate across the five kingdoms.', '2024-09-20', 'published']
    );

    // Episodes for Season 1
    const ep1 = await dbRun(`INSERT INTO episodes 
      (serial_id, season_id, episode_number, title, slug, description, thumbnail, video_url, duration, release_date, status, featured, views, downloads)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        s1.lastID, season1.lastID, 1,
        'Episode 1: The Dark Omen',
        'episode-1-the-dark-omen',
        'A mysterious plague infects the borderlands as the King calls his council.',
        'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?w=500&auto=format&fit=crop&q=80',
        'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
        '54 mins',
        '2024-03-15',
        'published',
        1,
        4500,
        1200
      ]
    );

    await dbRun(`INSERT INTO episodes 
      (serial_id, season_id, episode_number, title, slug, description, thumbnail, video_url, duration, release_date, status, featured, views, downloads)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        s1.lastID, season1.lastID, 2,
        'Episode 2: Blades in the Shadows',
        'episode-2-blades-in-the-shadows',
        'Assassins strike during the night tournament.',
        'https://images.unsplash.com/photo-1509198397868-475647b2a1e5?w=500&auto=format&fit=crop&q=80',
        'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
        '48 mins',
        '2024-03-22',
        'published',
        0,
        3200,
        850
      ]
    );

    // Media Sources for Episode 1
    await dbRun(`INSERT INTO media_sources (episode_id, type, quality, label, url, file_size, server) VALUES (?, 'stream', '1080p', 'Full HD Stream (Server 1)', 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4', '1.4 GB', 'Cloudflare CDN')`, [ep1.lastID]);
    await dbRun(`INSERT INTO media_sources (episode_id, type, quality, label, url, file_size, server) VALUES (?, 'stream', '720p', 'HD Fast Stream', 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4', '750 MB', 'Google Cloud CDN')`, [ep1.lastID]);
    await dbRun(`INSERT INTO media_sources (episode_id, type, quality, label, url, file_size, server) VALUES (?, 'download', '1080p', 'Direct Download 1080p', 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4', '1.4 GB', 'Mirror 1')`, [ep1.lastID]);
  }

  // 6. Seed API Keys
  const countKeys = await dbGet<{ cnt: number }>('SELECT COUNT(*) as cnt FROM api_keys');
  if (countKeys && Number(countKeys.cnt) === 0) {
    console.log('[Database] Seeding initial API keys...');
    await dbRun(`INSERT INTO api_keys (name, key_value, rate_limit, status, usage_count) VALUES 
      ('Production Mobile App Key', 'sk_live_9f8a3b1c7e6d4a5b2c', 5000, 'active', 1280),
      ('Partner Web Portal Key', 'sk_live_1a2b3c4d5e6f7g8h9i', 2000, 'active', 450)
    `);
  }

  // 7. Seed sample Users
  const countUsers = await dbGet<{ cnt: number }>('SELECT COUNT(*) as cnt FROM users');
  if (countUsers && Number(countUsers.cnt) === 0) {
    console.log('[Database] Seeding sample mobile/web users...');
    const hashedPw = await bcrypt.hash('user123', 10);
    await dbRun(`INSERT INTO users (name, email, password, role, status) VALUES 
      ('David Miller', 'david.m@example.com', '${hashedPw}', 'VIP', 'active'),
      ('Elena Rostova', 'elena.r@example.com', '${hashedPw}', 'Subscriber', 'active'),
      ('Kenji Sato', 'kenji.s@example.com', '${hashedPw}', 'User', 'active')
    `);
  }

  // 8. Seed activity logs
  const countLogs = await dbGet<{ cnt: number }>('SELECT COUNT(*) as cnt FROM activity_logs');
  if (countLogs && Number(countLogs.cnt) === 0) {
    console.log('[Database] Seeding activity logs...');
    await dbRun(`INSERT INTO activity_logs (admin_id, action, entity_type, entity_id, description, ip_address) VALUES 
      (1, 'System Boot', 'System', 1, 'MySQL Database schema initialized and seed data loaded successfully.', '127.0.0.1'),
      (1, 'CREATE_SERIAL', 'serial', 1, 'Created new serial "Kingdom of Shadows"', '127.0.0.1'),
      (1, 'PUBLISH_EPISODE', 'episode', 1, 'Published Episode 1: The Dark Omen', '127.0.0.1')
    `);
  }

  // 9. Seed Monetization Settings
  const mSettings = await dbGet('SELECT * FROM monetization_settings WHERE setting_key = ?', ['admob_enabled']);
  if (!mSettings) {
    console.log('[Database] Seeding monetization settings...');
    const defaultM = [
      ['admob_enabled', 'true'],
      ['admob_app_id_android', 'ca-app-pub-3940256099942544~3347511713'],
      ['admob_app_id_ios', 'ca-app-pub-3940256099942544~1458002511'],
      ['admob_banner_unit_id', 'ca-app-pub-3940256099942544/6300978111'],
      ['admob_interstitial_unit_id', 'ca-app-pub-3940256099942544/1033173712'],
      ['admob_rewarded_unit_id', 'ca-app-pub-3940256099942544/5224354917'],
      ['admob_native_unit_id', 'ca-app-pub-3940256099942544/2247696110'],
      ['admob_app_open_unit_id', 'ca-app-pub-3940256099942544/3419835294'],
      ['admob_test_mode', 'true'],
      ['adsense_enabled', 'true'],
      ['adsense_publisher_id', 'pub-9876543210123456'],
      ['adsense_auto_ads', 'true'],
      ['gam_network_code', '123456789'],
      ['gam_publisher_id', 'pub-1234567890123456'],
      ['gam_inventory_id', 'inv-main-serial-app'],
      ['adblock_detection_enabled', 'true'],
      ['adblock_action', 'warning'],
      ['max_ads_per_page', '4'],
      ['interstitial_interval_mins', '5'],
      ['video_preroll_enabled', 'true'],
      ['video_midroll_enabled', 'true'],
      ['video_midroll_interval_mins', '10'],
      ['video_postroll_enabled', 'false'],
      ['download_monetization_mode', 'ad-supported'],
      ['download_countdown_sec', '10']
    ];
    for (const [k, v] of defaultM) {
      await dbRun('INSERT INTO monetization_settings (setting_key, setting_value) VALUES (?, ?)', [k, v]);
    }
  }

  // 10. Seed Subscription Plans
  const countPlans = await dbGet<{ cnt: number }>('SELECT COUNT(*) as cnt FROM subscription_plans');
  if (countPlans && Number(countPlans.cnt) === 0) {
    console.log('[Database] Seeding subscription plans...');
    await dbRun(`INSERT INTO subscription_plans (name, price, currency, duration, features_json, ad_free, hd_streaming, downloads_allowed, status) VALUES
      ('Free VIP Trial', 0.00, 'USD', '7 Days', '["Standard SD Stream", "Ad-supported", "Limited Downloads"]', 0, 0, 1, 'active'),
      ('Pro Monthly', 9.99, 'USD', 'Monthly', '["Ad-Free Experience", "1080p Full HD", "Unlimited Downloads", "Priority Support"]', 1, 1, 1, 'active'),
      ('Ultra Annual', 89.99, 'USD', 'Yearly', '["Ad-Free", "4K Ultra HD", "Unlimited Downloads", "Multi-device Sync", "VIP Badge"]', 1, 1, 1, 'active'),
      ('Lifetime Access Pass', 199.99, 'USD', 'Lifetime', '["Lifetime Unlimited Access", "All Future Content", "Zero Ads Forever", "Direct High-Speed Downloads"]', 1, 1, 1, 'active')
    `);
  }

  // 11. Seed Payment Gateways
  const countGateways = await dbGet<{ cnt: number }>('SELECT COUNT(*) as cnt FROM payment_gateways');
  if (countGateways && Number(countGateways.cnt) === 0) {
    console.log('[Database] Seeding payment gateways...');
    await dbRun(`INSERT INTO payment_gateways (gateway_code, name, is_enabled, mode, config_json) VALUES
      ('stripe', 'Stripe Credit Cards', 1, 'sandbox', '{"publishable_key":"pk_test_sample123","secret_key_masked":"sk_test_****4892"}'),
      ('paypal', 'PayPal Express Checkout', 1, 'sandbox', '{"client_id":"client_test_sample456"}'),
      ('bkash', 'bKash Mobile Wallet', 1, 'sandbox', '{"app_key":"bkash_app_key_test"}'),
      ('nagad', 'Nagad Payment Gateway', 1, 'sandbox', '{"merchant_id":"nagad_m_987"}'),
      ('sslcommerz', 'SSLCommerz Local Cards & Banking', 0, 'sandbox', '{"store_id":"store_test_321"}')
    `);
  }

  // 12. Seed Ad Units & Placements
  const countPlacements = await dbGet<{ cnt: number }>('SELECT COUNT(*) as cnt FROM ad_placements');
  if (countPlacements && Number(countPlacements.cnt) === 0) {
    console.log('[Database] Seeding ad placements & units...');
    await dbRun(`INSERT INTO ad_units (network, name, slot_id, format, size) VALUES
      ('AdSense', 'Header Banner Leaderboard', '1234567890', 'Display', '728x90'),
      ('AdSense', 'Sidebar Medium Rectangle', '0987654321', 'Display', '300x250'),
      ('Google Ad Manager', 'Episode Pre-roll Video Ad', 'gam-preroll-01', 'In-Stream Video', 'Responsive'),
      ('AdMob', 'Mobile App Sticky Bottom Banner', 'ca-app-pub-3940256099942544/6300978111', 'Banner', '320x50')
    `);

    await dbRun(`INSERT INTO ad_placements (name, position, network, fallback_network, device_target, priority, status) VALUES
      ('Header Main Navigation', 'Header', 'AdSense', 'Google Ad Manager', 'All', 1, 'active'),
      ('Below Video Player', 'Before Episode', 'AdSense', 'AdMob', 'Desktop', 1, 'active'),
      ('Sidebar Sticky Widget', 'Sidebar', 'Google Ad Manager', 'AdSense', 'All', 2, 'active'),
      ('Between Episode List', 'Between Episodes', 'AdSense', 'Google Ad Manager', 'Mobile', 1, 'active'),
      ('Download Gate Countdown', 'Before Download', 'AdSense', 'AdMob', 'All', 1, 'active')
    `);
  }

  // 13. Seed Ad Analytics & Sample Transactions
  const countAdAnalytics = await dbGet<{ cnt: number }>('SELECT COUNT(*) as cnt FROM ad_analytics');
  if (countAdAnalytics && Number(countAdAnalytics.cnt) === 0) {
    console.log('[Database] Seeding sample ad analytics & transactions...');
    await dbRun(`INSERT INTO ad_analytics (date_recorded, country, device, impressions, clicks, revenue, rpm, cpm, ctr) VALUES
      (CURDATE(), 'United States', 'Desktop', 14200, 480, 185.50, 13.06, 12.50, 3.38),
      (CURDATE(), 'South Korea', 'Mobile', 9800, 310, 112.40, 11.46, 10.80, 3.16),
      (CURDATE(), 'United Kingdom', 'Desktop', 6400, 190, 78.20, 12.21, 11.50, 2.96),
      (CURDATE(), 'Japan', 'Tablet', 4200, 110, 45.80, 10.90, 10.10, 2.61),
      (CURDATE(), 'Spain', 'Mobile', 3100, 85, 29.10, 9.38, 8.90, 2.74)
    `);

    await dbRun(`INSERT INTO transactions (transaction_ref, user_id, amount, currency, gateway, status, description) VALUES
      ('TXN-894102', 1, 9.99, 'USD', 'stripe', 'completed', 'Pro Monthly Subscription - David Miller'),
      ('TXN-894103', 2, 89.99, 'USD', 'paypal', 'completed', 'Ultra Annual Plan - Elena Rostova'),
      ('TXN-894104', 3, 9.99, 'USD', 'bkash', 'completed', 'Pro Monthly Subscription - Kenji Sato')
    `);
  }

  // 14. Seed Notifications
  const countNotifs = await dbGet<{ cnt: number }>('SELECT COUNT(*) as cnt FROM notifications');
  if (countNotifs && Number(countNotifs.cnt) === 0) {
    console.log('[Database] Seeding initial notifications...');
    await dbRun(`INSERT INTO notifications (title, message, type, is_read, link) VALUES
      ('System Monetization Engine Online', 'Monetization Center, AdMob, AdSense and GAM integrations are ready.', 'success', 0, '/monetization/overview'),
      ('New VIP Subscription Received', 'User David Miller upgraded to Pro Monthly ($9.99).', 'info', 0, '/monetization/payments'),
      ('Video Health Monitor Check Passed', 'All active streaming mirrors are responding within 150ms.', 'success', 1, '/video-health')
    `);
  }
}

