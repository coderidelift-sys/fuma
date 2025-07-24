# Database Management Guide

## Seeder dan Migration yang Telah Dioptimasi

### 🚀 Quick Start

```bash
# Setup database lengkap dari awal
npm run db:setup

# Atau step by step:
npm install
npx prisma generate
npx prisma migrate dev
npm run seed
```

### 📋 Available Commands

| Command | Description |
|---------|-------------|
| `npm run migrate` | Jalankan migration untuk membuat/update schema database |
| `npm run seed` | Populate database dengan data demo |
| `npm run db:reset` | Hapus semua data dan reset auto-increment counters |
| `npm run db:fresh` | Reset database + seed ulang (clean slate) |
| `npm run db:optimize` | Apply database indexes untuk performa |
| `npm run db:setup` | Setup lengkap: generate + migrate + seed |

### 🔧 Optimasi yang Dilakukan

#### 1. **Seeder Improvements**
- ✅ **Transaction-based operations** untuk konsistensi data
- ✅ **Batch processing** untuk performa lebih baik
- ✅ **Proper error handling** dengan try-catch
- ✅ **Data cleanup** sebelum seeding
- ✅ **Auto-increment reset** untuk ID yang konsisten
- ✅ **Realistic data** dengan nama pemain dan tim nyata
- ✅ **Foreign key constraint handling**

#### 2. **Database Schema Optimizations**
- ✅ **Database indexes** untuk query yang lebih cepat
- ✅ **Composite indexes** untuk query kompleks
- ✅ **Proper foreign key relationships**
- ✅ **Optimized data types**

#### 3. **Performance Enhancements**
- ✅ **Batch inserts** instead of individual creates
- ✅ **Transaction grouping** untuk mengurangi round trips
- ✅ **Efficient data structure** untuk seeding
- ✅ **Memory optimization** dengan proper cleanup

### 📊 Data yang Di-seed

#### Users (3)
- **Admin**: admin@fuma.com / admin123
- **Manager**: manager@fuma.com / demo123  
- **Viewer**: viewer@fuma.com / demo123

#### Teams (4)
- Manchester City FC
- Liverpool FC
- Chelsea FC
- Arsenal FC

#### Players (20)
- 5 players per team dengan data realistis
- Posisi: Goalkeeper, Defender, Midfielder, Forward
- Data lengkap: tinggi, berat, kaki dominan, nilai pasar

#### Tournaments (3)
- Premier League 2024 (ONGOING)
- FA Cup 2024 (ONGOING)
- Champions League 2024 (UPCOMING)

#### Matches (4)
- Live match: Manchester City vs Liverpool
- Scheduled matches
- Completed matches dengan events

#### Match Events (9)
- Goals, Yellow cards, Red cards
- Realistic timing dan descriptions

### 🛠️ Troubleshooting

#### Error: "Cannot find module '@prisma/client'"
```bash
npm install
npx prisma generate
```

#### Error: "Table doesn't exist"
```bash
npx prisma migrate dev
```

#### Error: "Foreign key constraint fails"
```bash
npm run db:reset
npm run seed
```

#### Performance Issues
```bash
npm run db:optimize
```

### 🔄 Development Workflow

#### Untuk Development Baru
```bash
npm run db:setup
```

#### Untuk Reset Data
```bash
npm run db:fresh
```

#### Untuk Update Schema
```bash
npx prisma migrate dev --name your_migration_name
npm run seed
```

#### Untuk Production
```bash
npx prisma migrate deploy
npm run seed
```

### 📈 Performance Tips

1. **Gunakan indexes** yang sudah dibuat di `optimize.sql`
2. **Batch operations** untuk insert/update banyak data
3. **Transaction** untuk operasi yang saling terkait
4. **Connection pooling** untuk production
5. **Regular maintenance** dengan `OPTIMIZE TABLE`

### 🔒 Security Notes

- Password di-hash dengan bcryptjs (12 rounds)
- Demo accounts hanya untuk development
- Ganti credentials untuk production
- Gunakan environment variables untuk sensitive data

### 📝 Logs dan Monitoring

Seeder memberikan output yang detail:
- ✅ Progress indicators
- 📊 Summary statistics  
- 🔐 Demo account credentials
- ❌ Error messages yang jelas

### 🚨 Important Notes

1. **Backup data** sebelum menjalankan `db:reset` atau `db:fresh`
2. **Environment variables** harus di-set dengan benar
3. **Database connection** harus aktif sebelum seeding
4. **Foreign key constraints** sudah dihandle dengan proper order
5. **Auto-increment** akan di-reset ke 1 setiap kali reset

### 📞 Support

Jika mengalami masalah:
1. Check database connection
2. Verify environment variables
3. Run `npm run db:setup` untuk clean setup
4. Check logs untuk error details