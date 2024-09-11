export default {
  port: process.env.PORT ? Number(process.env.PORT) : 3000,
  db: {
    host: 'localhost',
    port: 27017,
    name: 'cryptoestate',
  },
};