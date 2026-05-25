import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const workTypes = [
  "Кладка перегородок",
  "Монтаж опалубки",
  "Армирование",
  "Бетонирование",
  "Штукатурные работы",
  "Монтаж инженерных сетей",
  "Уборка строительной площадки"
];

async function main() {
  for (const name of workTypes) {
    await prisma.workType.upsert({
      where: { name },
      update: {},
      create: { name }
    });
  }
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
