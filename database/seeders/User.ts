import BaseSeeder from '@ioc:Adonis/Lucid/Seeder'
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export default class extends BaseSeeder {
  public async run () {
    await prisma.user.create({
      data: {
        email: "test@test.com",
          password: "test",
          name: "test",
          role: "ADMIN"
      },
      });
  }
}
