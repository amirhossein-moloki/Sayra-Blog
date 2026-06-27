import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function setupPrimaryGamingCenter() {
  const slug = 'primary-cms';

  const existing = await prisma.gamingCenter.findUnique({
    where: { slug }
  });

  if (existing) {
    console.log(`GamingCenter with slug "${slug}" already exists: ${existing.id}`);
    return existing;
  }

  const gc = await prisma.gamingCenter.create({
    data: {
      name: 'Primary CMS',
      slug,
      isActive: true,
      description: 'Primary GamingCenter for Django CMS migration',
    }
  });

  console.log(`Created Primary GamingCenter: ${gc.name} (${gc.id})`);
  return gc;
}

setupPrimaryGamingCenter()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
