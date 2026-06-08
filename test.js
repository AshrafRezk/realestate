import bcrypt from 'bcryptjs'

const hash = await bcrypt.hash('apple', 10)
console.log(hash)

const result = await bcrypt.compare('apple', '$2b$10$R8ZR8awIrm2X1UHjA9h1cOZwA/NZXGTgRwv1W7pCJrTjfJtwWpqfq')
console.log(result)