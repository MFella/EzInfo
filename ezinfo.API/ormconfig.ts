export = {
  host: process.env.MONGODB_HOST,
  type: "mysql",
  port: process.env.MONGODB_PORT,
  username: process.env.MONGODB_USER,
  password: process.env.MONGODB_PASSWORD,
  database: process.env.MONGODB_DB,
  entities: ["src/**/**.entity{.ts,.js}"],
  migrations: ["src/database/migrations/*.ts"],
  cli: {
    migrationsDir: "src/database/migrations",
  },
  synchronize: false,
};
