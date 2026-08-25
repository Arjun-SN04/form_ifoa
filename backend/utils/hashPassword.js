import bcrypt from 'bcrypt';

const password = process.argv[2];

if (!password) {
  console.error('Usage: npm run hash-password -- <plain-text-password>');
  process.exit(1);
}

const hash = bcrypt.hashSync(password, 10);
console.log('\nAdd this to backend/.env as ADMIN_PASSWORD_HASH:\n');
console.log(hash);
console.log('');
