const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const articles = [
    { articleNo: 'AR-8330F - Shaver Handpiece Footswitch Control' },
    { articleNo: 'AR-8332H - Shaver Handpiece Handcontrol' }
  ];

  for (const article of articles) {
    await prisma.article.upsert({
      where: { articleNo: article.articleNo },
      update: {},
      create: article,
    });
  }
  console.log('Seed completed successfully');
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
