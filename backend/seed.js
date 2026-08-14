const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const templates = [
  {
    articleNo: 'AR-8330F',
    name: 'F-Shaver Handpiece', // placeholder name if doesn't exist
    steps: [
      { stepNo: 1, name: 'Serial Number Check', criterion: 'Does the lasered serial number match the documentation?' },
      { stepNo: 2, name: 'Locking Pin Mechanism', criterion: 'Does the locking pin mechanism work properly? (with test gage IG-0026)' },
      { stepNo: 3, name: 'Shaver Handpiece Condition', criterion: 'Is the device free of any damage and dirt? (incl. silicone warranty seal)' },
      { stepNo: 4, name: 'Suction Valve', criterion: 'Can the suction valve be operated smoothly back and forth?' },
      { stepNo: 5, name: 'O-Ring', criterion: 'Is the O-ring properly seated on the connector?' },
      { stepNo: 6, name: 'Water Bubble Leak Test', criterion: 'Did the leak test pass? (according to work instruction WI-000101081)' },
      { stepNo: 7, name: 'Shaver Blade', criterion: 'Can a shaver blade be inserted smoothly and locked properly?' },
      { stepNo: 8, name: 'F-Shaver Handpiece Function', criterion: 'Is the device working properly? (no abnormal noise)' }
    ]
  },
  {
    articleNo: 'AR-8332H',
    name: 'H-Shaver Handpiece',
    steps: [
      { stepNo: 1, name: 'Serial Number Check', criterion: 'Does the lasered serial number match the documentation?' },
      { stepNo: 2, name: 'Locking Pin Mechanism', criterion: 'Does the locking pin mechanism work properly? (with test gage IG-0026)' },
      { stepNo: 3, name: 'Shaver Handpiece Condition', criterion: 'Is the device free of any damage and dirt? (incl. silicone warranty seal)' },
      { stepNo: 4, name: 'Suction Valve', criterion: 'Can the suction valve be operated smoothly back and forth?' },
      { stepNo: 5, name: 'O-Ring', criterion: 'Is the O-ring properly seated on the connector?' },
      { stepNo: 6, name: 'Water Bubble Leak Test', criterion: 'Did the leak test pass? (according to work instruction WI-000101081)' },
      { stepNo: 7, name: 'Shaver Blade', criterion: 'Can a shaver blade be inserted smoothly and locked properly?' },
      { stepNo: 8, name: 'H-Shaver Handpiece Function', criterion: 'Is the device working properly? (hand control buttons, no abnormal noise)' }
    ]
  }
];

async function main() {
  for (const t of templates) {
    // 1. Upsert article
    await prisma.article.upsert({
      where: { articleNo: t.articleNo },
      update: {},
      create: { articleNo: t.articleNo, name: t.name }
    });
    
    // 2. Delete existing steps for this article just in case to avoid duplicates
    await prisma.testStepTemplate.deleteMany({
      where: { articleNo: t.articleNo }
    });
    
    // 3. Insert new steps
    for (const step of t.steps) {
      await prisma.testStepTemplate.create({
        data: {
          articleNo: t.articleNo,
          stepNo: step.stepNo,
          name: step.name,
          criterion: step.criterion
        }
      });
    }
    console.log(`Seeded ${t.articleNo} with ${t.steps.length} steps.`);
  }
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
