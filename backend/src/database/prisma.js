const { PrismaClient } = require('@prisma/client');

// Polyfill seguro para serialização de BigInt em JSON (evita TypeError: Do not know how to serialize a BigInt)
BigInt.prototype.toJSON = function () {
  const intVal = Number(this);
  return Number.isSafeInteger(intVal) ? intVal : this.toString();
};

// Singleton do PrismaClient
let prisma;

if (!global.__prismaInstance) {
  global.__prismaInstance = new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error']
  });
}

prisma = global.__prismaInstance;

module.exports = prisma;
