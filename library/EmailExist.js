import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const isEmailExist = async (email) => {
  const user = await prisma.user.findFirst({
    where: {
      email: email,
    },
  });
  return user !== null;
};

const isEmailExistWithUserId = async (id, email) => {
  const user = await prisma.user.findUnique({
    where: {
      id: id,
      email: email,
    },
  });
  return user !== null;
};

export { isEmailExist, isEmailExistWithUserId };
