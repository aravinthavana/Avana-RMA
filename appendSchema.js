const fs = require('fs');
const path = './backend/prisma/schema.prisma';
const appendContent = `
model Article {
  id        String   @id @default(uuid())
  articleNo String   @unique
  createdAt DateTime @default(now())

  @@map("articles")
}
`;
fs.appendFileSync(path, appendContent, 'utf8');
console.log('Appended to schema.prisma');
